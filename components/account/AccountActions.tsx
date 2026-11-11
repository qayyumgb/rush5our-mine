"use client";

/**
 * MY ACCOUNT — the two buttons: copy the RUSH Code, and sign out.
 */

import { useState } from "react";
import { accountCopy } from "@/data/account";
import { postAuth } from "./fields";
import styles from "./Account.module.css";

export function CopyCode({ code }: { code: string }) {
  const c = accountCopy.account;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No clipboard (an old browser, or permission refused): the code
      // itself is selectable with one tap.
    }
  };

  return (
    <button type="button" className={styles.ghost} onClick={copy} aria-live="polite">
      {copied ? c.copied : c.copy}
    </button>
  );
}

export function SignOutButton() {
  const c = accountCopy.account;
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    if (busy) return;
    setBusy(true);
    const res = await postAuth("/api/auth/signout", {});
    window.location.assign(res.ok && res.redirect ? res.redirect : "/join?signin=1#signup");
  };

  return (
    <button type="button" className={styles.ghost} onClick={signOut} disabled={busy}>
      {busy && <span className={styles.spinner} aria-hidden="true" />}
      {busy ? c.signingOut : c.signOut}
    </button>
  );
}
