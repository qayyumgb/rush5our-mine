/**
 * CONTACT FORM — the two emails a submission sends.
 *
 *   1. `notificationEmail` — to the business inbox, with the visitor's
 *      address as reply-to, so hitting Reply answers the visitor.
 *   2. `autoReplyEmail`    — to the visitor, confirming receipt.
 *
 * Both share one layout: a plain light page holding a dark card in the
 * site's theme — a black header band carrying the logo over a red rule,
 * then the content in light text on near-black. The logo is a picture of
 * the site's header logo (lib/contact/logo.ts) — mail clients can't draw
 * the skewed tile or the site's font in CSS — attached inline and shown via
 * `cid:`, so it renders whether or not the site is online.
 *
 * Each email has a plain-text body and an HTML one. Everything a visitor
 * typed is escaped before it goes into HTML: a message is content, never
 * markup.
 *
 * Server-only: imported by app/api/contact/route.ts.
 */

import type { MailDataRequired } from "@sendgrid/mail";
import { site } from "@/data/site";
import { LOGO_PNG_BASE64, LOGO_SIZE } from "./logo";
import type { ContactValues } from "./validation";

const RED = "#eb151f";
/** The nav's background, so the logo's own backdrop blends into the band. */
const BAND = "#070707";
const CARD = "#111111";
const LOGO_CID = "rush5our-logo";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * The logo, attached inline; referenced from the HTML as `cid:`.
 *
 * Given in the API's own field name: the SDK's attachment type spells it
 * `contentId`, but sends that through unchanged, and SendGrid then rejects
 * the email with "content_id parameter is required if disposition =
 * 'inline'". A `content_id` is passed through as is (checked against
 * @sendgrid/mail 8.1.6).
 */
function logoAttachment(): NonNullable<MailDataRequired["attachments"]>[number] {
  const attachment = {
    content: LOGO_PNG_BASE64,
    filename: "rush5our-logo.png",
    type: "image/png",
    disposition: "inline",
    content_id: LOGO_CID,
  };
  return attachment as unknown as NonNullable<MailDataRequired["attachments"]>[number];
}

/** The logo image at a third of its captured size, so it stays sharp. */
function logo(): string {
  const w = Math.round(LOGO_SIZE.width / 3);
  const h = Math.round(LOGO_SIZE.height / 3);
  return `<img src="cid:${LOGO_CID}" width="${w}" height="${h}" alt="${escapeHtml(site.name)}" style="display:block;width:${w}px;height:${h}px;border:0;" />`;
}

/** The shared shell: light page, dark card, black header with the logo. */
function shell(title: string, body: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:0;background:#f3f3f3;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f3f3;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${CARD};border:1px solid #2a2a2a;border-radius:6px;overflow:hidden;">
            <tr>
              <td style="padding:22px 32px;background:${BAND};border-bottom:4px solid ${RED};">
                ${logo()}
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 0;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:bold;color:#ffffff;">
                ${title}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px 32px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#d6d6d6;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:14px 32px;background:${BAND};border-top:1px solid #222222;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#8c8c8c;">
                ${escapeHtml(site.name)} · ${escapeHtml(site.tagline)}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** One labelled row of the notification's details table. */
function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 16px 6px 0;vertical-align:top;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${RED};white-space:nowrap;">${label}</td>
    <td style="padding:6px 0;color:#ffffff;">${value}</td>
  </tr>`;
}

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
