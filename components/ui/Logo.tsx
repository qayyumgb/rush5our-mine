/**
 * LOGO — the "R5" mark plus the two-tone RUSH5OUR wordmark.
 *
 * Both halves are decorative (`aria-hidden`); the accessible name comes from
 * the wrapping link's `aria-label`, so screen readers hear the brand once
 * rather than twice.
 */
import { site } from "@/data/site";
import styles from "./Logo.module.css";

interface LogoProps {
  href?: string;
  className?: string;
  /** Adds `data-a` so the nav's entrance timeline can reveal it. */
  hideUntilRevealed?: boolean;
}

export function Logo({ href = "#hero", className, hideUntilRevealed = false }: LogoProps) {
  return (
    <a
      href={href}
      className={[styles.logo, className].filter(Boolean).join(" ")}
      aria-label={`${site.name} — home`}
      {...(hideUntilRevealed ? { "data-a": "" } : {})}
    >
      <span className={styles.mark} aria-hidden="true">
        <span>{site.mark}</span>
      </span>
      <span className={styles.word} aria-hidden="true">
        {site.wordmark.light}
        <span className="text-red">{site.wordmark.accent}</span>
      </span>
    </a>
  );
}

export default Logo;
