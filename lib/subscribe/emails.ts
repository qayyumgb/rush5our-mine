/**
 * SIGN-UPS — the two emails a sign-up sends.
 *
 *   1. `signupNotificationEmail` — to the business inbox: the new member,
 *      their address as reply-to, so hitting Reply answers them. Until
 *      there is a member database, this inbox IS the sign-up list. The
 *      sign-up's source (Join the Movement, or Early Access / Merch Drop)
 *      is in the subject and the body, so the two lists can be told apart
 *      and filtered.
 *   2. `welcomeEmail` — to the new member: a short welcome on the brand.
 *      Early Access sign-ups get their own: "you're on the list", with no
 *      links into the website, which isn't open yet.
 *
 * Both use the site's email layout (lib/mail/layout.ts). Everything the
 * visitor typed is escaped before it goes into HTML.
 *
 * Server-only: imported by app/api/subscribe/route.ts.
 */

import type { MailDataRequired } from "@sendgrid/mail";
import { joinSignup } from "@/data/join";
import { site } from "@/data/site";
import { BAND, RED, button, escapeHtml, logoAttachment, row, shell } from "@/lib/mail/layout";
import { SOURCE_LABEL, type SubscribeValues } from "./validation";

const UPDATES_YES = "Yes — hunts, drops & opportunities";
const UPDATES_NO = "No";

export function signupNotificationEmail(
  values: SubscribeValues,
  to: string,
  from: string,
  when: Date,
): MailDataRequired {
  const { name, email, updates, source } = values;
  const stamp = when.toUTCString();
  const label = SOURCE_LABEL[source];
  const early = source === "early-access";

  const text = [
    `New sign-up: ${label}`,
    "",
    `Source:    ${label}`,
    `Name:      ${name}`,
    `Email:     ${email}`,
    ...(early ? [] : [`Updates:   ${updates ? UPDATES_YES : UPDATES_NO}`]),
    `Signed up: ${stamp}`,
    "",
    "Reply to this email to answer the new member directly.",
  ].join("\n");

  const html = shell(
    `New sign-up: ${escapeHtml(label)}`,
    `<table role="presentation" cellpadding="0" cellspacing="0" style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.5;">
      ${row("Source", escapeHtml(label))}
      ${row("Name", escapeHtml(name))}
      ${row("Email", `<a href="mailto:${escapeHtml(email)}" style="color:#ffffff;">${escapeHtml(email)}</a>`)}
      ${early ? "" : row("Updates", escapeHtml(updates ? UPDATES_YES : UPDATES_NO))}
      ${row("Signed up", escapeHtml(stamp))}
    </table>
    <p style="margin:20px 0 0;font-size:13px;color:#8c8c8c;">Reply to this email to answer the new member directly.</p>`,
  );

  return {
    to,
    from: { email: from, name: site.name },
    replyTo: { email, name },
    // The tag leads the subject, so an inbox filter (or a glance) can sort
    // the Early Access list from general sign-ups.
    subject: `${early ? "[Early Access] " : ""}New sign-up: ${name} (${email})`,
    text,
    html,
    attachments: [logoAttachment()],
  };
}

export function welcomeEmail(values: SubscribeValues, from: string): MailDataRequired {
  if (values.source === "early-access") return earlyAccessWelcomeEmail(values, from);
  const { name, email, updates } = values;
  const videos = `${site.url}/videos`;
  // The same four promises the Join page makes under the form.
  const perks = joinSignup.perks.map((p) => ({ title: p.title, body: p.body.join(" ") }));
  const updatesLine = updates
    ? "We’ll send you hunts, drops and opportunities as they happen."
    : "You chose not to get update emails, so this is the only one we’ll send for now.";

  const text = [
    `Hi ${name},`,
    "",
    "You’re in. Welcome to RUSH 5OUR — real people, real moments, one movement.",
    "",
    "What being in means:",
    ...perks.map((p) => `• ${p.title}: ${p.body}`),
    "",
    updatesLine,
    "",
    `Watch the latest: ${videos}`,
    "",
    "— RUSH 5OUR",
    site.tagline,
  ].join("\n");

  const html = shell(
    `You’re in<span style="color:${RED};">.</span>`,
    `<p style="margin:0 0 14px;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 18px;">Welcome to <strong style="color:#ffffff;">RUSH 5OUR</strong> — real people, real moments, one movement. You’re officially part of it.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BAND};border-left:3px solid ${RED};">
      ${perks
        .map(
          (p) => `<tr>
        <td style="padding:10px 16px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#d6d6d6;">
          <span style="font-size:12px;letter-spacing:1px;text-transform:uppercase;color:${RED};">${escapeHtml(p.title)}</span><br />${escapeHtml(p.body)}
        </td>
      </tr>`,
        )
        .join("")}
    </table>
    <p style="margin:18px 0 0;">${escapeHtml(updatesLine)}</p>
    ${button(videos, "Watch the latest →")}`,
  );

  return {
    to: { email, name },
    from: { email: from, name: site.name },
    subject: "You’re in — welcome to RUSH 5OUR",
    text,
    html,
    attachments: [logoAttachment()],
  };
}

/** The Early Access list's confirmation, in the page's own words. */
function earlyAccessWelcomeEmail(values: SubscribeValues, from: string): MailDataRequired {
  const { name, email } = values;
  const lead = "Welcome to the movement. We’ll notify you when RUSH 5OUR merch officially drops!";
  const detail =
    "You’re on the Early Access List for our first-ever merch collection, including our exclusive Mr. Crossland shirt. Keep an eye on your inbox — you’ll hear first.";

  const text = [
    `Hi ${name},`,
    "",
    "You’re on the list!",
    "",
    lead,
    "",
    detail,
    "",
    "Be First. Stay Exclusive. Build the Movement.",
    "",
    "— RUSH 5OUR",
  ].join("\n");

  const html = shell(
    `You’re on the list<span style="color:${RED};">!</span>`,
    `<p style="margin:0 0 14px;">Hi ${escapeHtml(name)},</p>
    <p style="margin:0 0 14px;color:#ffffff;">${escapeHtml(lead)}</p>
    <p style="margin:0 0 18px;">${escapeHtml(detail)}</p>
    <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:${RED};">Be First. Stay Exclusive. Build the Movement.</p>`,
  );

  return {
    to: { email, name },
    from: { email: from, name: site.name },
    subject: "You’re on the list — RUSH 5OUR Early Access",
    text,
    html,
    attachments: [logoAttachment()],
  };
}
