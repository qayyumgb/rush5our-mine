/**
 * POST /api/auth/forgot { email } — emails a password-reset link.
 *
 * Always answers "ok", so the form can't be used to find out who's a
 * member. The link works once and expires in an hour.
 */

import { resetPasswordMessage } from "@/lib/auth/emails";
import { failure, json, readRequest, sendMail } from "@/lib/auth/route";
import { siteOrigin } from "@/lib/auth/session";
import { findByEmail, issueToken } from "@/lib/auth/users";
import { EMAIL_RE } from "@/lib/contact/validation";

export async function POST(request: Request) {
  const read = await readRequest(request, "auth-forgot", 5);
  if ("response" in read) return read.response;

  const email = typeof read.payload.email === "string" ? read.payload.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: "Enter a valid email address.", fields: { email: "Enter a valid email address." } }, 400);
  }

  try {
    const member = await findByEmail(email);
    if (member) {
      const token = await issueToken(member.id, "reset-password");
      // Opens the Join page's panel on "Choose a new password".
      const link = `${siteOrigin(request)}/join?reset=${encodeURIComponent(token)}#signup`;
      await sendMail("forgot", (from) => resetPasswordMessage(member, link, from));
    }
    return json({ ok: true });
  } catch (error) {
    return failure("forgot", error);
  }
}
