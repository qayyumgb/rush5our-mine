/**
 * MY ACCOUNT — /account. Signed-in members only; anyone else is sent to
 * the Join page's sign-in form. The member's RUSH Code, their details, and sign out. The
 * dashboard (points, rank, rewards, the QR) is the rest of Phase 3.
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Nav from "@/components/ui/Nav";
import AccountShell from "@/components/account/AccountShell";
import { CopyCode, SignOutButton } from "@/components/account/AccountActions";
import { currentMember } from "@/lib/auth/session";
import { accountCopy } from "@/data/account";
import styles from "@/components/account/Account.module.css";

/** Per visitor (their session, their link): never prerendered or cached. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My account",
  robots: { index: false, follow: false },
};

const since = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export default async function AccountPage({ searchParams }: PageProps<"/account">) {
  const member = await currentMember();
  if (!member) redirect("/join?signin=1#signup");

  const params = await searchParams;
  const c = accountCopy.account;
  const firstName = member.name.split(/\s+/)[0] || member.name;
  const notice = "welcome" in params ? c.welcome : "reset" in params ? c.resetDone : "";

  return (
    <>
      <Nav />
      <AccountShell eyebrow={c.eyebrow} titleWhite="" titleRed={c.greeting.replace("{name}", firstName)} wide>
        <div className={styles.panel}>
          {notice && (
            <p className={`${styles.notice} ${styles.noticeGood}`} role="status">
              {notice}
            </p>
          )}

          <section className={styles.code} aria-labelledby="rush-code-label">
            <p id="rush-code-label" className={styles.codeLabel}>
              {c.codeLabel}
            </p>
            <strong className={styles.codeValue}>{member.rushCode}</strong>
            <p className={styles.codeHelp}>{c.codeHelp}</p>
            <div className={styles.codeActions}>
              <CopyCode code={member.rushCode} />
            </div>
          </section>

          <dl className={styles.details}>
            <div className={styles.detail}>
              <dt>{c.details.name}</dt>
              <dd>{member.name}</dd>
            </div>
            <div className={styles.detail}>
              <dt>{c.details.username}</dt>
              <dd>@{member.username}</dd>
            </div>
            <div className={styles.detail}>
              <dt>{c.details.email}</dt>
              <dd>
                {member.email}
                {member.emailVerified && <span className={styles.badge}>{c.details.verified}</span>}
              </dd>
            </div>
            <div className={styles.detail}>
              <dt>{c.details.since}</dt>
              <dd>{since(member.createdAt)}</dd>
            </div>
          </dl>

          <div className={styles.next}>
            <p className={styles.nextTitle}>{c.next.title}</p>
            <p className={styles.nextBody}>{c.next.body}</p>
          </div>

          <div className={styles.signOut}>
            <SignOutButton />
          </div>
        </div>
      </AccountShell>
    </>
  );
}
