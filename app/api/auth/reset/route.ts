/**
 * POST /api/auth/reset { token, password } — sets a new password from a
 * reset link.
 *
 * Uses the link up, signs the member out of every other browser, marks
 * their email verified (the link proved they own it) and signs them in
 * here.
 */

import { hashPassword } from "@/lib/auth/crypto";
import { failure, json, readRequest } from "@/lib/auth/route";
import { startSession } from "@/lib/auth/session";
import { consumeToken, deleteAllSessions, markVerified, setPassword } from "@/lib/auth/users";
import { passwordError } from "@/lib/auth/validation";

export async function POST(request: Request) {
  const read = await readRequest(request, "auth-reset", 10);
  if ("response" in read) return read.response;

  const token = typeof read.payload.token === "string" ? read.payload.token : "";
  const password = typeof read.payload.password === "string" ? read.payload.password : "";
  const pw = passwordError(password);
  if (pw) return json({ ok: false, error: "Please check the highlighted field.", fields: { password: pw } }, 400);

  try {
    const userId = await consumeToken(token, "reset-password");
    if (!userId) {
      return json(
        { ok: false, code: "invalid-token", error: "This reset link has expired or was already used. Ask for a new one." },
        400,
      );
    }
    await setPassword(userId, await hashPassword(password));
    await markVerified(userId);
    await deleteAllSessions(userId);
    await startSession(userId, request);
    return json({ ok: true, redirect: "/account?reset=1" });
  } catch (error) {
    return failure("reset", error);
  }
}
