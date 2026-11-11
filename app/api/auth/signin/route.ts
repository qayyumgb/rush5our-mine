/**
 * POST /api/auth/signin { login, password } — email or username, and
 * password.
 *
 * A wrong email and a wrong password get the same answer, and take the
 * same time (a decoy hash is checked when no member matches), so the form
 * doesn't reveal who has an account. A right password on an unverified
 * account is refused with `code: "unverified"`, so the page can offer to
 * resend the link. 10 attempts per 10 minutes per address.
 */

import { decoyHash, verifyPassword } from "@/lib/auth/crypto";
import { failure, json, readRequest } from "@/lib/auth/route";
import { startSession } from "@/lib/auth/session";
import { findForSignIn } from "@/lib/auth/users";
import { normalizeSignIn, validateSignIn } from "@/lib/auth/validation";

const WRONG = "That email, username or password isn’t right.";

export async function POST(request: Request) {
  const read = await readRequest(request, "auth-signin", 10);
  if ("response" in read) return read.response;

  const values = normalizeSignIn(read.payload);
  const fields = validateSignIn(values);
  if (Object.keys(fields).length > 0) {
    return json({ ok: false, error: "Please check the highlighted fields.", fields }, 400);
  }

  try {
    const member = await findForSignIn(values.login);
    const valid = await verifyPassword(values.password, member?.passwordHash ?? (await decoyHash()));
    if (!member || !valid) return json({ ok: false, error: WRONG }, 401);

    if (!member.emailVerified) {
      return json(
        {
          ok: false,
          code: "unverified",
          error: "Confirm your email first: use the link we sent you, or get a new one below.",
        },
        403,
      );
    }

    await startSession(member.id, request);
    return json({ ok: true });
  } catch (error) {
    return failure("signin", error);
  }
}
