/**
 * EMAIL LAYOUT — the look every email the site sends shares.
 *
 * A plain light page holding a dark card in the site's theme: a black
 * header band carrying the logo over a red rule, then the content in light
 * text on near-black, and a footer band. The logo is a picture of the
 * site's header logo (./logo.ts) — mail clients can't draw the skewed tile
 * or the site's font in CSS — attached inline and shown via `cid:`, so it
 * renders whether or not the site is online.
 *
 * Everything a visitor typed must go through `escapeHtml` before it goes
 * into HTML: what they type is content, never markup.
 *
 * Server-only: imported by lib/contact/emails.ts and lib/subscribe/emails.ts.
 */

import type { MailDataRequired } from "@sendgrid/mail";
import { site } from "@/data/site";
import { LOGO_PNG_BASE64, LOGO_SIZE } from "./logo";

/** The site's red (--red in app/globals.css). */
export const RED = "#eb151f";
/** The nav's background, so the logo's own backdrop blends into the band. */
export const BAND = "#070707";
const CARD = "#111111";
const LOGO_CID = "rush5our-logo";

export function escapeHtml(value: string): string {
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
export function logoAttachment(): NonNullable<MailDataRequired["attachments"]>[number] {
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
export function shell(title: string, body: string): string {
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

/** One labelled row of a details table. `value` must already be escaped. */
export function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 16px 6px 0;vertical-align:top;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${RED};white-space:nowrap;">${label}</td>
    <td style="padding:6px 0;color:#ffffff;">${value}</td>
  </tr>`;
}

/**
 * A red button that holds up in mail clients: a table cell carrying the
 * colour, so Outlook keeps it, with the link inside. `href` and `label`
 * are the site's own, not a visitor's.
 */
export function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 4px;">
      <tr>
        <td style="background:${RED};border-radius:4px;">
          <a href="${escapeHtml(href)}" style="display:inline-block;padding:13px 24px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;color:#ffffff;text-decoration:none;">${escapeHtml(label)}</a>
        </td>
      </tr>
    </table>`;
}
