/**
 * EYEBROW — the small tracked red label with a hairline that opens each
 * section ("THE CONCEPT ———", "——— GOOD TO KNOW ———").
 *
 * The `js-eyebrow-*` hooks are what `headReveal` animates: the label decodes
 * out of random glyphs while the rule(s) scale open.
 */

import styles from "./Eyebrow.module.css";

export interface EyebrowProps {
  label: string;
  /** "right" = rule after the label; "both" = centred, rule either side. */
  rules?: "right" | "both";
  className?: string;
  labelClassName?: string;
  ruleClassName?: string;
}

export function Eyebrow({
  label,
  rules = "right",
  className,
  labelClassName,
  ruleClassName,
}: EyebrowProps) {
  const centred = rules === "both";

  return (
    <p
      className={[styles.eyebrow, centred ? styles.centred : "", className]
        .filter(Boolean)
        .join(" ")}
    >
      {centred && (
        <i
          className={[styles.rule, styles.ruleLeft, "js-eyebrow-rule", ruleClassName]
            .filter(Boolean)
            .join(" ")}
          aria-hidden="true"
        />
      )}

      <span className={["f-sans cz caps js-eyebrow-label", labelClassName].filter(Boolean).join(" ")}>
        {label}
      </span>

      <i
        className={[styles.rule, "js-eyebrow-rule", ruleClassName].filter(Boolean).join(" ")}
        aria-hidden="true"
      />
    </p>
  );
}

export default Eyebrow;
