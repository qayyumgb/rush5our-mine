/**
 * /signin — kept as a short address only. Signing in happens in the Join
 * page's form ("Already a member? Sign in"), so this opens it there in
 * sign-in mode, passing on any notice it was given.
 */

import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SignInPage({ searchParams }: PageProps<"/signin">) {
  const params = await searchParams;
  const notice = params.link === "expired" ? "expired" : params.link === "error" ? "error" : "signed-out" in params ? "signed-out" : "";
  redirect(`/join?signin=1${notice ? `&notice=${notice}` : ""}#signup`);
}
