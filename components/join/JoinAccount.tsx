"use client";

/**
 * JOIN THE MOVEMENT — the sign-up panel's other faces, in its own styles
 * (JoinSignup.module.css), shown by JoinSignup in its place:
 *
 *   • JoinSignIn  "Already a member? Sign in": email or username and
 *                 password, "Forgot your password?", and back to "Create
 *                 your account". An unconfirmed account gets a button to
 *                 send a new confirmation link. Signed in → My Account.
 *   • JoinForgot  "Forgot your password?": an email, and a reset link is
 *                 sent. The answer is the same whether or not it has an
 *                 account.
 *   • JoinReset   the reset email's link (/join?reset=<token>): the new
 *                 password twice. Saved → signed in → My Account. An
 *                 expired or used link says so and offers a new one.
 *   • JoinMember  a member who's already signed in: their RUSH Code, My
 *                 account and Sign out — the way back to the account,
 *                 since the menu has no account link.
 *
 * None carries the page's `data-a` reveal markers: they appear after the
 * page's entrance has run, so they show as they are.
 */

import { useRef, useState, type FormEvent, type RefObject } from "react";
import Icon from "@/components/ui/Icon";
import {
  normalizeSignIn,
  passwordError,
  validateSignIn,
  type AuthResponse,
  type FieldErrors,
} from "@/lib/auth/validation";
import { EMAIL_RE } from "@/lib/contact/validation";
import { joinSignup } from "@/data/join";
import styles from "./JoinSignup.module.css";

const NETWORK_ERROR = "We couldn’t reach the server. Check your connection and try again.";

async function post(url: string, body: object): Promise<AuthResponse> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await res.json()) as AuthResponse;
  } catch {
    return { ok: false, error: NETWORK_ERROR };
  }
}

/** A full page load to an address on this site, as everywhere here. */
function goTo(path: string) {
  window.location.assign(path);
}

export type JoinNotice = keyof typeof joinSignup.signInMode.notices;

/* --- shared pieces ------------------------------------------------------------- */

interface PanelFieldProps {
  id: string;
  icon: "user" | "envelope" | "lock";
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: string;
  name: string;
  error?: string;
  disabled?: boolean;
  password?: boolean;
  email?: boolean;
  inputRef?: RefObject<HTMLInputElement | null>;
}

/** One of the panel's boxed fields (icon, placeholder label, error under
    it), with the show/hide eye on a password. */
function PanelField({
  id,
  icon,
  label,
  value,
  onChange,
  autoComplete,
  name,
  error,
  disabled,
  password,
  email,
  inputRef,
}: PanelFieldProps) {
  const [shown, setShown] = useState(false);
  return (
    <div className={styles.slot}>
      <label className={styles.field}>
        <Icon name={icon} className={`${styles.fieldIcon} ${styles[icon]}`} />
        <input
          ref={inputRef}
          type={password && !shown ? "password" : email ? "email" : "text"}
          name={name}
          autoComplete={autoComplete}
          autoCapitalize="none"
          spellCheck={false}
          {...(email ? { inputMode: "email" as const } : {})}
          placeholder={label}
          aria-label={label}
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={styles.input}
        />
        {password && (
          <button
            type="button"
            className={styles.eye}
            aria-label={shown ? "Hide password" : "Show password"}
            aria-pressed={shown}
            onClick={() => setShown((s) => !s)}
          >
            <Icon name="eye" className={styles.eyeIcon} />
            {shown && <span className={styles.eyeSlash} aria-hidden="true" />}
          </button>
        )}
      </label>
      {error && (
        <span id={`${id}-error`} className={styles.error}>
          {error}
        </span>
      )}
    </div>
  );
}

function PanelSubmit({ busy, label, busyLabel }: { busy: boolean; label: string; busyLabel: string }) {
  return (
    <button type="submit" className={styles.submit} disabled={busy} aria-busy={busy}>
      <span className="f-cond cz caps">{busy ? busyLabel : label}</span>
      {busy ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        <svg className={styles.submitArrow} viewBox="0 0 32 20" aria-hidden="true">
          <path d="M1 10h29M21 1.5l9 8.5-9 8.5" />
        </svg>
      )}
    </button>
  );
}

function ErrorNote({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <p className={`${styles.note} ${styles.noteError}`} role="alert">
      <svg className={styles.noteIcon} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 7v6.5M12 17v.5" />
        <circle cx="12" cy="12" r="10" />
      </svg>
      <span>
        <strong className="f-cond caps">{title}</strong>
        {children}
      </span>
    </p>
  );
}

function SentNote({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <p className={`${styles.note} ${styles.noteSent}`} role="status">
      <svg className={styles.noteIcon} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 12.5l5.2 5.2L20 6.8" />
      </svg>
      <span>
        <strong className="f-cond caps">{title}</strong>
        {children}
      </span>
    </p>
  );
}

/* --- sign in ---------------------------------------------------------------------- */

export function JoinSignIn({
  notice,
  onCreateAccount,
  onForgot,
  hidden,
}: {
  notice: JoinNotice | null;
  onCreateAccount: () => void;
  onForgot: () => void;
  hidden: boolean;
}) {
  const c = joinSignup.signInMode;
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors<"login" | "password">>({});
  const [failure, setFailure] = useState("");
  const [unverified, setUnverified] = useState(false);
  const [resend, setResend] = useState<"idle" | "sending" | "sent">("idle");
  const [busy, setBusy] = useState(false);
  const loginRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const values = normalizeSignIn({ login, password });
    const found = validateSignIn(values);
    setErrors(found);
    setFailure("");
    setUnverified(false);
    if (found.login) return loginRef.current?.focus();
    if (found.password) return passwordRef.current?.focus();

    setBusy(true);
    const res = await post("/api/auth/signin", values);
    if (res.ok) return goTo("/account");
    setBusy(false);
    setFailure(res.error);
    if (res.fields) setErrors(res.fields);
    if (res.code === "unverified") {
      setUnverified(true);
      setResend("idle");
    }
  };

  const resendLink = async () => {
    if (resend === "sending") return;
    setResend("sending");
    await post("/api/auth/resend", { login: login.trim() });
    setResend("sent");
  };

  return (
    <form className={styles.panel} onSubmit={onSubmit} noValidate aria-label={c.submit} hidden={hidden}>
      {notice && (
        <p className={`${styles.note} ${notice === "error" ? styles.noteError : ""} ${styles.noteTop}`} role="status">
          <span>{c.notices[notice]}</span>
        </p>
      )}

      <PanelField
        id="signin-login"
        icon="user"
        name="username"
        label={c.login}
        autoComplete="username"
        value={login}
        onChange={(v) => {
          setLogin(v);
          if (errors.login) setErrors((p) => ({ ...p, login: undefined }));
        }}
        error={errors.login}
        disabled={busy}
        inputRef={loginRef}
      />
      <PanelField
        id="signin-password"
        icon="lock"
        name="password"
        label={c.password}
        autoComplete="current-password"
        password
        value={password}
        onChange={(v) => {
          setPassword(v);
          if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
        }}
        error={errors.password}
        disabled={busy}
        inputRef={passwordRef}
      />

      <div className={styles.submitWrap}>
        <PanelSubmit busy={busy} label={c.submit} busyLabel={c.sending} />
        {failure && (
          <ErrorNote title={c.failedTitle}>
            {failure}
            {unverified && (
              <button type="button" className={styles.noteAction} onClick={resendLink} disabled={resend === "sending"}>
                {resend === "sent" ? c.resent : c.resend}
              </button>
            )}
          </ErrorNote>
        )}
      </div>

      <div className={`${styles.signIn} ${styles.signInStack} f-sans`}>
        <button type="button" className={styles.signInLink} onClick={onForgot}>
          {c.forgot}
        </button>
        <span>
          {c.create.lead}{" "}
          <button type="button" className={styles.signInLink} onClick={onCreateAccount}>
            {c.create.label}
          </button>
        </span>
      </div>
    </form>
  );
}

/* --- forgot password --------------------------------------------------------------- */

export function JoinForgot({ onBack, hidden }: { onBack: () => void; hidden: boolean }) {
  const c = joinSignup.forgotMode;
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [failure, setFailure] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const emailRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (state === "busy") return;
    const value = email.trim();
    if (!EMAIL_RE.test(value)) {
      setError("Enter a valid email address.");
      return emailRef.current?.focus();
    }
    setState("busy");
    setError("");
    setFailure("");
    const res = await post("/api/auth/forgot", { email: value });
    if (res.ok) return setState("sent");
    setState("idle");
    if (res.fields?.email) setError(res.fields.email);
    else setFailure(res.error);
  };

  return (
    <form className={styles.panel} onSubmit={onSubmit} noValidate aria-label={c.submit} hidden={hidden}>
      {state === "sent" ? (
        <SentNote title={c.sentTitle}>{c.sent}</SentNote>
      ) : (
        <>
          <PanelField
            id="forgot-email"
            icon="envelope"
            name="email"
            label={c.email}
            autoComplete="email"
            email
            value={email}
            onChange={(v) => {
              setEmail(v);
              if (error) setError("");
            }}
            error={error}
            disabled={state === "busy"}
            inputRef={emailRef}
          />
          <div className={styles.submitWrap}>
            <PanelSubmit busy={state === "busy"} label={c.submit} busyLabel={c.sending} />
            {failure && <ErrorNote title={joinSignup.signInMode.failedTitle}>{failure}</ErrorNote>}
          </div>
        </>
      )}

      <p className={`${styles.signIn} f-sans`}>
        <button type="button" className={styles.signInLink} onClick={onBack}>
          {c.back}
        </button>
      </p>
    </form>
  );
}

/* --- reset password ------------------------------------------------------------------ */

export function JoinReset({ token, onAgain, hidden }: { token: string; onAgain: () => void; hidden: boolean }) {
  const c = joinSignup.resetMode;
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [failure, setFailure] = useState("");
  const [expired, setExpired] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const found: typeof errors = {};
    const pw = passwordError(password);
    if (pw) found.password = pw;
    else if (password !== confirm) found.confirm = c.mismatch;
    setErrors(found);
    setFailure("");
    if (found.password || found.confirm) return;

    setBusy(true);
    const res = await post("/api/auth/reset", { token, password });
    if (res.ok) return goTo(res.redirect ?? "/account");
    setBusy(false);
    if (res.code === "invalid-token") return setExpired(true);
    setFailure(res.error);
    if (res.fields?.password) setErrors({ password: res.fields.password });
  };

  return (
    <form className={styles.panel} onSubmit={onSubmit} noValidate aria-label={c.submit} hidden={hidden}>
      {expired ? (
        <ErrorNote title={c.expiredTitle}>
          {c.expired}
          <button type="button" className={styles.noteAction} onClick={onAgain}>
            {c.again}
          </button>
        </ErrorNote>
      ) : (
        <>
          <PanelField
            id="reset-password"
            icon="lock"
            name="new-password"
            label={c.password}
            autoComplete="new-password"
            password
            value={password}
            onChange={(v) => {
              setPassword(v);
              if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
            }}
            error={errors.password}
            disabled={busy}
          />
          <PanelField
            id="reset-confirm"
            icon="lock"
            name="confirm-password"
            label={c.confirm}
            autoComplete="new-password"
            password
            value={confirm}
            onChange={(v) => {
              setConfirm(v);
              if (errors.confirm) setErrors((p) => ({ ...p, confirm: undefined }));
            }}
            error={errors.confirm}
            disabled={busy}
          />
          <div className={styles.submitWrap}>
            <PanelSubmit busy={busy} label={c.submit} busyLabel={c.sending} />
            {failure && <ErrorNote title={c.failedTitle}>{failure}</ErrorNote>}
          </div>
        </>
      )}
    </form>
  );
}

/* --- signed in ----------------------------------------------------------------------- */

export function JoinMember({ rushCode, hidden }: { rushCode: string; hidden: boolean }) {
  const c = joinSignup.memberMode;
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    if (busy) return;
    setBusy(true);
    const res = await post("/api/auth/signout", {});
    goTo(res.ok && res.redirect ? res.redirect : "/join");
  };

  return (
    <div className={`${styles.panel} ${styles.member}`} hidden={hidden}>
      <p className={`${styles.memberLabel} f-cond caps`}>{c.codeLabel}</p>
      <strong className={`${styles.memberCode} f-display`}>{rushCode}</strong>

      <div className={styles.submitWrap}>
        <a href={c.account.href} className={styles.submit}>
          <span className="f-cond cz caps">{c.account.label}</span>
          <svg className={styles.submitArrow} viewBox="0 0 32 20" aria-hidden="true">
            <path d="M1 10h29M21 1.5l9 8.5-9 8.5" />
          </svg>
        </a>
      </div>

      <p className={`${styles.signIn} f-sans`}>
        <button type="button" className={styles.signInLink} onClick={signOut} disabled={busy}>
          {busy ? c.signingOut : c.signOut}
        </button>
      </p>
    </div>
  );
}
