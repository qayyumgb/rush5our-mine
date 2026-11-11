/**
 * MY ACCOUNT — the words on the account page (app/(site)/account). Sign
 * up, sign in, forgot and reset password are all faces of the Join page's
 * panel (data/join.ts).
 *
 * No mockups exist for these screens yet: they're set in the Join page's
 * manner. Replace the copy freely; the components only read this file.
 */

export interface AccountCopy {
  account: {
    eyebrow: string;
    /** "{name}" is replaced with the member's first name. */
    greeting: string;
    welcome: string;
    resetDone: string;
    codeLabel: string;
    codeHelp: string;
    copy: string;
    copied: string;
    details: { name: string; username: string; email: string; since: string; verified: string };
    next: { title: string; body: string };
    signOut: string;
    signingOut: string;
  };
}

export const accountCopy: AccountCopy = {
  account: {
    eyebrow: "My account",
    greeting: "Hey {name}.",
    welcome: "Your email is confirmed. You’re officially part of the movement.",
    resetDone: "Your new password is saved.",
    codeLabel: "Your RUSH Code",
    codeHelp: "Your code is yours alone. Sharing, the QR code and points arrive with the next update.",
    copy: "Copy code",
    copied: "Copied",
    details: {
      name: "Name",
      username: "Username",
      email: "Email",
      since: "Member since",
      verified: "Confirmed",
    },
    next: {
      title: "What’s next",
      body: "Your dashboard — points, rank and rewards — is being built. You’ll be the first to know.",
    },
    signOut: "Sign out",
    signingOut: "Signing out…",
  },
};
