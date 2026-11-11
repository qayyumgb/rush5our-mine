/**
 * /reset-password?token=… — kept as an address only, for reset emails sent
 * before the form moved: "Choose a new password" is a face of the Join
 * page's panel, so this passes the link's token on to it.
 */

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage({ searchParams }: PageProps<"/reset-password">) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : "";
  redirect(token ? `/join?reset=${encodeURIComponent(token)}#signup` : "/join?forgot=1#signup");
}
