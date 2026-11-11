/**
 * /forgot-password — kept as an address only. "Forgot your password?" is a
 * face of the Join page's panel, so this opens it there.
 */

import { redirect } from "next/navigation";

export default function ForgotPasswordPage() {
  redirect("/join?forgot=1#signup");
}
