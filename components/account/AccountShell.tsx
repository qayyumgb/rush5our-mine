/**
 * ACCOUNT PAGES — the frame every account page shares: the red glow, the
 * eyebrow, the leaning two-colour headline and a lead, then the page's
 * own content. A server component; the forms inside are client ones.
 */

import type { ReactNode } from "react";
import styles from "./Account.module.css";

interface AccountShellProps {
  eyebrow: string;
  titleWhite: string;
  titleRed: string;
  lead?: string;
  /** A wider column (My Account). */
  wide?: boolean;
  children: ReactNode;
}

export function AccountShell({ eyebrow, titleWhite, titleRed, lead, wide, children }: AccountShellProps) {
  return (
    <main className={styles.page}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={`${styles.col} ${wide ? styles.colWide : ""}`}>
        <header className={styles.head}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 className={styles.title}>
            {titleWhite} <span className={styles.red}>{titleRed}</span>
          </h1>
          {lead && <p className={styles.lead}>{lead}</p>}
        </header>
        {children}
      </div>
    </main>
  );
}

export default AccountShell;
