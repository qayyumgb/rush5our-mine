/**
 * CONTACT FORM — the two emails a submission sends.
 *
 *   1. `notificationEmail` — to the business inbox, with the visitor's
 *      address as reply-to, so hitting Reply answers the visitor.
 *   2. `autoReplyEmail`    — to the visitor, confirming receipt.
 *
 * Both use the site's email layout (lib/mail/layout.ts). Everything a
 * visitor typed is escaped before it goes into HTML: a message is content,
 * never markup.
 *
 * Server-only: imported by app/api/contact/route.ts.
 */

import type { MailDataRequired } from "@sendgrid/mail";
import { site } from "@/data/site";
import { BAND, RED, escapeHtml, logoAttachment, row, shell } from "@/lib/mail/layout";
import type { ContactValues } from "./validation";

export function notificationEmail(values: ContactValues, to: string, from: string): MailDataRequired {
  const { name, email, subject, message } = values;

  const text = [
    "New contact form submission",
    "",
    `Name:    ${name}`,
    `Email:   ${email}`,
    `Subject: ${subject}`,
    "",
    "Message:",
    message,
    "",
    "Reply to this email to answer the sender directly.",
  ].join("\n");

  const html = shell(
    "New contact form submission",
    `<table role="presentation" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;">
      ${row("Name", escapeHtml(name))}
      ${row("Email", `<a href="mailto:${escapeHtml(email)}" style="color:#ffffff;">${escapeHtml(email)}</a>`)}
      ${row("Subject", escapeHtml(subject))}
    </table>
    <p style="margin:20px 0 6px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${RED};">Message</p>
    <p style="margin:0;padding:14px 16px;background:${BAND};border-left:3px solid ${RED};color:#ffffff;white-space:pre-wrap;">${escapeHtml(message)}</p>
    <p style="margin:20px 0 0;font-size:13px;color:#8c8c8c;">Reply to this email to answer the sender directly.</p>`,
  );

  return {
    to,
    from: { email: from, name: site.name },
    replyTo: { email, name },
    subject: `New contact form submission: ${subject}`,
    text,
    html,
    attachments: [logoAttachment()],
  };
}

export function autoReplyEmail(values: ContactValues, from: string): MailDataRequired {
  const { name, email, subject } = values;

  const text = [
    `Hi ${name},`,
    "",
    "Thanks for reaching out to RUSH 5OUR! We received your message and will get back to you soon.",
    "",
    `Your subject: ${subject}`,
    "",
    "— RUSH 5OUR",
    site.tagline,
  ].join("\n");

  const html = shell(
    "We received your message",
    `<p style="margin:0 0 14px;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 14px;">Thanks for reaching out to <strong style="color:#ffffff;">RUSH 5OUR</strong>! We received your message and will get back to you soon.</p>
    <p style="margin:0;font-size:13px;color:#8c8c8c;">Your subject: ${escapeHtml(subject)}</p>`,
  );

  return {
    to: { email, name },
    from: { email: from, name: site.name },
    subject: "We received your message — RUSH 5OUR",
    text,
    html,
    attachments: [logoAttachment()],
  };
}
