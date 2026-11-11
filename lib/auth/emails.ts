/**
 * ACCOUNTS — the emails an account sends, in the site's email layout
 * (lib/mail/layout.ts): verify your email, and reset your password. Each
 * carries a one-time link. Server-only.
 */

import "server-only";
import type { MailDataRequired } from "@sendgrid/mail";
import { site } from "@/data/site";
import { RED, button, escapeHtml, logoAttachment, shell } from "@/lib/mail/layout";

interface Recipient {
  name: string;
  email: string;
  rushCode?: string;
}

export function verifyEmailMessage(to: Recipient, link: string, from: string): MailDataRequired {
  const text = [
    `Hi ${to.name},`,
    "",
    "One step left: confirm your email to activate your RUSH 5OUR account.",
    "",
    `Confirm your email: ${link}`,
    "",
    "The link works once and expires in 48 hours. If you didn’t create an account, ignore this email.",
    "",
    "— RUSH 5OUR",
  ].join("\n");

  const html = shell(
    `Confirm your email<span style="color:${RED};">.</span>`,
    `<p style="margin:0 0 14px;">Hi ${escapeHtml(to.name)},</p>
    <p style="margin:0;">One step left: confirm your email to activate your <strong style="color:#ffffff;">RUSH 5OUR</strong> account.</p>
    ${button(link, "Confirm my email")}
    <p style="margin:18px 0 0;font-size:13px;color:#8c8c8c;">The link works once and expires in 48 hours. If you didn’t create an account, ignore this email.</p>`,
  );

  return {
    to: { email: to.email, name: to.name },
    from: { email: from, name: site.name },
    subject: "Confirm your email — RUSH 5OUR",
    text,
    html,
    attachments: [logoAttachment()],
  };
}

export function resetPasswordMessage(to: Recipient, link: string, from: string): MailDataRequired {
  const text = [
    `Hi ${to.name},`,
    "",
    "Someone (hopefully you) asked to reset the password for your RUSH 5OUR account.",
    "",
    `Choose a new password: ${link}`,
    "",
    "The link works once and expires in 1 hour. If you didn’t ask, ignore this email — your password won’t change.",
    "",
    "— RUSH 5OUR",
  ].join("\n");

  const html = shell(
    `Reset your password<span style="color:${RED};">.</span>`,
    `<p style="margin:0 0 14px;">Hi ${escapeHtml(to.name)},</p>
    <p style="margin:0;">Someone (hopefully you) asked to reset the password for your RUSH 5OUR account.</p>
    ${button(link, "Choose a new password")}
    <p style="margin:18px 0 0;font-size:13px;color:#8c8c8c;">The link works once and expires in 1 hour. If you didn’t ask, ignore this email — your password won’t change.</p>`,
  );

  return {
    to: { email: to.email, name: to.name },
    from: { email: from, name: site.name },
    subject: "Reset your password — RUSH 5OUR",
    text,
    html,
    attachments: [logoAttachment()],
  };
}
