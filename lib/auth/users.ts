/**
 * ACCOUNTS — members, sessions and one-time tokens in the database.
 * Server-only. Every query is parameterised by the `postgres` client's
 * tagged templates; nothing a visitor typed is ever spliced into SQL.
 */

import "server-only";
import { db, isUniqueViolation } from "@/lib/db/client";
import { hashToken, newRushCode, newToken } from "./crypto";

export interface Member {
  id: string;
  name: string;
  email: string;
  username: string;
  rushCode: string;
  updates: boolean;
  emailVerified: boolean;
  createdAt: Date;
}

interface MemberRow {
  id: string;
  name: string;
  email: string;
  username: string;
  rush_code: string;
  updates: boolean;
  email_verified_at: Date | null;
  created_at: Date;
}

const toMember = (r: MemberRow): Member => ({
  id: String(r.id),
  name: r.name,
  email: r.email,
  username: r.username,
  rushCode: r.rush_code,
  updates: r.updates,
  emailVerified: r.email_verified_at !== null,
  createdAt: r.created_at,
});

/* --- members -------------------------------------------------------------- */

export async function emailTaken(email: string): Promise<boolean> {
  const rows = await db()`select 1 from users where lower(email) = lower(${email}) limit 1`;
  return rows.length > 0;
}

export async function usernameTaken(username: string): Promise<boolean> {
  const rows = await db()`select 1 from users where lower(username) = lower(${username}) limit 1`;
  return rows.length > 0;
}

export type CreateResult = { ok: true; member: Member } | { ok: false; taken: "email" | "username" };

/** Creates a member with a fresh RUSH Code, retrying in the rare case the
    random code is already someone's. */
export async function createMember(input: {
  name: string;
  email: string;
  username: string;
  passwordHash: string;
  updates: boolean;
}): Promise<CreateResult> {
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const [row] = await db()<MemberRow[]>`
        insert into users (name, email, username, password_hash, rush_code, updates)
        values (${input.name}, ${input.email}, ${input.username}, ${input.passwordHash}, ${newRushCode()}, ${input.updates})
        returning id, name, email, username, rush_code, updates, email_verified_at, created_at`;
      return { ok: true, member: toMember(row) };
    } catch (error) {
      if (isUniqueViolation(error, "users_rush_code_key")) continue;
      if (isUniqueViolation(error, "users_email_key")) return { ok: false, taken: "email" };
      if (isUniqueViolation(error, "users_username_key")) return { ok: false, taken: "username" };
      throw error;
    }
  }
  throw new Error("Could not find a free RUSH Code");
}

/** By email or username, with the password hash for checking a sign-in. */
export async function findForSignIn(login: string): Promise<(Member & { passwordHash: string }) | null> {
  const [row] = await db()<(MemberRow & { password_hash: string })[]>`
    select id, name, email, username, rush_code, updates, email_verified_at, created_at, password_hash
    from users
    where lower(email) = lower(${login}) or lower(username) = lower(${login})
    limit 1`;
  return row ? { ...toMember(row), passwordHash: row.password_hash } : null;
}

export async function findByEmail(email: string): Promise<Member | null> {
  const [row] = await db()<MemberRow[]>`
    select id, name, email, username, rush_code, updates, email_verified_at, created_at
    from users where lower(email) = lower(${email}) limit 1`;
  return row ? toMember(row) : null;
}

export async function markVerified(userId: string): Promise<void> {
  await db()`update users set email_verified_at = coalesce(email_verified_at, now()), updated_at = now() where id = ${userId}`;
}

export async function setPassword(userId: string, passwordHash: string): Promise<void> {
  await db()`update users set password_hash = ${passwordHash}, updated_at = now() where id = ${userId}`;
}

/* --- one-time tokens (email links) ------------------------------------------ */

export type TokenPurpose = "verify-email" | "reset-password";

const TOKEN_TTL: Record<TokenPurpose, string> = {
  "verify-email": "48 hours",
  "reset-password": "1 hour",
};

/** A new link token for the member; any earlier one for the same purpose
    stops working. Returns the token to put in the link. */
export async function issueToken(userId: string, purpose: TokenPurpose): Promise<string> {
  const { token, hash } = newToken();
  const sql = db();
  await sql.begin(async (tx) => {
    await tx`delete from auth_tokens where user_id = ${userId} and purpose = ${purpose}`;
    await tx`
      insert into auth_tokens (token_hash, user_id, purpose, expires_at)
      values (${hash}, ${userId}, ${purpose}, now() + ${TOKEN_TTL[purpose]}::interval)`;
  });
  return token;
}

/** Uses up a link token: returns its member's id if it was valid and in
    date, and deletes it either way, so a link works once. */
export async function consumeToken(token: string, purpose: TokenPurpose): Promise<string | null> {
  if (!token || token.length > 200) return null;
  const [row] = await db()<{ user_id: string; live: boolean }[]>`
    delete from auth_tokens
    where token_hash = ${hashToken(token)} and purpose = ${purpose}
    returning user_id, expires_at > now() as live`;
  return row?.live ? String(row.user_id) : null;
}

/** Looks at a link token without using it (the reset page checks its link
    before showing the form). */
export async function tokenIsLive(token: string, purpose: TokenPurpose): Promise<boolean> {
  if (!token || token.length > 200) return false;
  const rows = await db()`
    select 1 from auth_tokens
    where token_hash = ${hashToken(token)} and purpose = ${purpose} and expires_at > now()`;
  return rows.length > 0;
}

/* --- sessions ---------------------------------------------------------------- */

export const SESSION_DAYS = 30;

export async function createSession(userId: string): Promise<string> {
  const { token, hash } = newToken();
  await db()`
    insert into sessions (token_hash, user_id, expires_at)
    values (${hash}, ${userId}, now() + ${`${SESSION_DAYS} days`}::interval)`;
  return token;
}

export async function memberForSession(token: string): Promise<Member | null> {
  if (!token || token.length > 200) return null;
  const [row] = await db()<MemberRow[]>`
    select u.id, u.name, u.email, u.username, u.rush_code, u.updates, u.email_verified_at, u.created_at
    from sessions s join users u on u.id = s.user_id
    where s.token_hash = ${hashToken(token)} and s.expires_at > now()`;
  return row ? toMember(row) : null;
}

export async function deleteSession(token: string): Promise<void> {
  if (!token) return;
  await db()`delete from sessions where token_hash = ${hashToken(token)}`;
}

/** Signs a member out everywhere (after a password reset). */
export async function deleteAllSessions(userId: string): Promise<void> {
  await db()`delete from sessions where user_id = ${userId}`;
}
