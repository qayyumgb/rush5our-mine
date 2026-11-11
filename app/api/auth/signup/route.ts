/**
 * POST /api/auth/signup — creates a member from the Join page form.
 *
 *   1. same site, size, rate limit (5 per 10 minutes per address); a
 *      filled honeypot is answered "ok" and dropped
 *   2. validated by the rules the form uses (lib/auth/validation.ts)
 *   3. email and username must be free (either is reported on its field)
 *   4. the member is created unverified, with a hashed password and a new
 *      RUSH Code, and a verification link is emailed
 *   5. the business inbox gets the usual sign-up notification
 *
 * The member can't sign in until they've clicked the link (the plan's
 * anti-fraud rule, 3.1). The answer is the same whether or not the email
 * went out: the sign-in page can send it again.
 */

import { HONEYPOT_FIELD } from "@/lib/contact/validation";
import { hashPassword } from "@/lib/auth/crypto";
import { verifyEmailMessage } from "@/lib/auth/emails";
import { failure, json, readRequest, sendMail } from "@/lib/auth/route";
import { siteOrigin } from "@/lib/auth/session";
import { createMember, emailTaken, issueToken, usernameTaken } from "@/lib/auth/users";
import { normalizeSignUp, validateSignUp, type FieldErrors, type SignUpField } from "@/lib/auth/validation";
import { signupNotificationEmail } from "@/lib/subscribe/emails";

export async function POST(request: Request) {
  const read = await readRequest(request, "auth-signup", 5);
  if ("response" in read) return read.response;
  const { payload } = read;

  const trap = payload[HONEYPOT_FIELD];
  if (typeof trap === "string" && trap.trim() !== "") {
    console.warn("[signup] honeypot filled — sign-up dropped");
    return json({ ok: true });
  }

  const values = normalizeSignUp(payload);
  const fields = validateSignUp(values);
  if (Object.keys(fields).length > 0) {
    return json({ ok: false, error: "Please check the highlighted fields.", fields }, 400);
  }

  try {
    const taken: FieldErrors<SignUpField> = {};
    if (await emailTaken(values.email)) taken.email = "There’s already an account with this email. Try signing in.";
    if (await usernameTaken(values.username)) taken.username = "That username is taken. Try another.";
    if (Object.keys(taken).length > 0) {
      return json({ ok: false, error: "Please check the highlighted fields.", fields: taken }, 409);
    }

    const created = await createMember({
      name: values.name,
      email: values.email,
      username: values.username,
      passwordHash: await hashPassword(values.password),
      updates: values.updates,
    });
    if (!created.ok) {
      // Someone took it between the check and the insert.
      const field = created.taken;
      const message = field === "email" ? "There’s already an account with this email." : "That username is taken.";
      return json({ ok: false, error: "Please check the highlighted fields.", fields: { [field]: message } }, 409);
    }

    const { member } = created;
    const token = await issueToken(member.id, "verify-email");
    const link = `${siteOrigin(request)}/api/auth/verify?token=${encodeURIComponent(token)}`;
    await sendMail("signup", (from) => verifyEmailMessage(member, link, from));
    await sendMail("signup", (from, to) =>
      signupNotificationEmail(
        { source: "join", name: member.name, email: member.email, updates: member.updates, agree: true },
        to,
        from,
        new Date(),
      ),
    );

    return json({ ok: true });
  } catch (error) {
    return failure("signup", error);
  }
}
