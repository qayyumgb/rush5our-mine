/**
 * TEXT SPLITTING — turns headline markup into per-character spans so lines
 * can rise from behind their mask, and provides the terminal-style scramble
 * used on eyebrows, tags and card numbers.
 *
 * Accessibility: splitting destroys the readable text node for screen
 * readers, so `splitTitle` copies the original string onto an aria-label and
 * hides the visual lines. Nothing here changes the DOM until the browser has
 * the real fonts, which is why callers await `document.fonts.ready` first —
 * splitting against a fallback font would measure the wrong widths.
 */
import { gsap } from "./gsap";

/** Returns the colour class on an element, if it carries one. */
function textClass(el: Element): string {
  if (el.classList.contains("t-white")) return "t-white";
  if (el.classList.contains("t-red")) return "t-red";
  return "";
}

/**
 * Wraps every character of `el` in a `.char` span (grouped into `.word`
 * spans so words never break mid-air). Colour classes found on nested
 * elements are pushed down onto the characters, so a single line can mix
 * white and red text and still animate as one set.
 */
export function splitChars(el: HTMLElement): HTMLElement[] {
  const chars: HTMLElement[] = [];

  function walk(node: Node, cls: string) {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        (n.textContent ?? "").split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(" "));
            return;
          }
          const word = document.createElement("span");
          word.className = "word";
          part.split("").forEach((ch) => {
            const c = document.createElement("span");
            c.className = "char" + (cls ? " " + cls : "");
            c.textContent = ch;
            word.appendChild(c);
            chars.push(c);
          });
          frag.appendChild(word);
        });
        node.replaceChild(frag, n);
      } else if (n.nodeType === Node.ELEMENT_NODE) {
        const own = textClass(n as Element);
        if (own) (n as Element).classList.remove(own);
        walk(n, own || cls);
      }
    });
  }

  walk(el, textClass(el));
  el.classList.remove("t-white", "t-red");
  return chars;
}

/**
 * Splits every `.line-inner` inside a headline and returns the characters in
 * document order. Each character gets a `--i` index so the CSS sheen sweep
 * can stagger itself without JS.
 */
export function splitTitle(h: HTMLElement): HTMLElement[] {
  h.setAttribute("aria-label", (h.textContent ?? "").replace(/\s+/g, " ").trim());
  h.querySelectorAll(".line").forEach((l) => l.setAttribute("aria-hidden", "true"));

  let chars: HTMLElement[] = [];
  h.querySelectorAll<HTMLElement>(".line-inner").forEach((li) => {
    chars = chars.concat(splitChars(li));
  });
  chars.forEach((c, i) => c.style.setProperty("--i", String(i)));
  return chars;
}

/**
 * Converts `<br>`-separated copy into individually masked lines, so each one
 * can slide up from behind its own edge. Returns the inner (animatable)
 * elements.
 */
export function splitBrLines(el: HTMLElement): HTMLElement[] {
  el.innerHTML = el.innerHTML
    .split(/<br\s*\/?>/i)
    .map((p) => `<span class="sub-line"><span class="sub-line-inner">${p.trim()}</span></span>`)
    .join("");
  return Array.from(el.querySelectorAll<HTMLElement>(".sub-line-inner"));
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#_";

/**
 * Decodes text character-by-character out of random glyphs. Punctuation and
 * spaces are held steady so the line keeps its shape while it resolves.
 * Returns the tween, ready to be added to a parent timeline.
 */
export function scramble(el: HTMLElement, duration = 0.9) {
  const final = el.textContent ?? "";
  const state = { p: 0 };

  gsap.set(el, { opacity: 0 });

  return gsap.to(state, {
    p: 1,
    duration,
    ease: "none",
    onStart: () => gsap.set(el, { opacity: 1 }),
    onUpdate: () => {
      const n = Math.floor(state.p * final.length);
      let out = final.slice(0, n);
      for (let i = n; i < final.length; i++) {
        out += /[\s.,—’'?]/.test(final[i])
          ? final[i]
          : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
    },
    onComplete: () => {
      el.textContent = final;
    },
  });
}
