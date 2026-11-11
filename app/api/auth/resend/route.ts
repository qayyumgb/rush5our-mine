/**
 * POST /api/auth/resend { login } — a new verification link, to the
 * member with that email or username ({ email } is accepted too).
 *
 * Always answers "ok", whether or not the address has an account or is
 * already verified, so the form can't be used to find out who's a member.
 * An earlier link stops working when a new one is sent.
 */

import { verifyEmailMessage } from "@/lib/auth/emails";
import { failure, json, readRequest, sendMail } from "@/lib/auth/route";
import { siteOrigin } from "@/lib/auth/session";
import { findForSignIn, issueToken } from "@/lib/auth/users";

export async function POST(request: Request) {
  const read = await readRequest(request, "auth-resend", 5);
  if ("response" in read) return read.response;

  const raw = read.payload.login ?? read.payload.email;
  const login = typeof raw === "string" ? raw.trim() : "";
  if (!login || login.length > 254) {
    return json({ ok: false, error: "Enter your email or username.", fields: { login: "Enter your email or username." } }, 400);
  }

  try {
    const member = await findForSignIn(login);
    if (member && !member.emailVerified) {
      const token = await issueToken(member.id, "verify-email");
      const link = `${siteOrigin(request)}/api/auth/verify?token=${encodeURIComponent(token)}`;
      await sendMail("resend", (from) => verifyEmailMessage(member, link, from));
    }
    return json({ ok: true });
  } catch (error) {
    return failure("resend", error);
  }
}
