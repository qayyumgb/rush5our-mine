const fs = require('fs');
const rep = (file, a, b, all) => { let s = fs.readFileSync(file, 'utf8'); if (!s.includes(a)) throw new Error(file + ' missing: ' + a.slice(0, 70)); fs.writeFileSync(file, all ? s.split(a).join(b) : s.replace(a, b)); };

// ---- FaqSection: footer moves out ------------------------------------------
{
  const f = 'components/home/FaqSection.tsx';
  let s = fs.readFileSync(f, 'utf8');
  const j0 = s.indexOf('      {/* ---------------- Footer ---------------- */}');
  const j1 = s.indexOf('      </footer>\n') + '      </footer>\n'.length;
  if (j0 < 0 || j1 < 0) throw new Error('footer jsx');
  s = s.slice(0, j0) + s.slice(j1).replace(/^\n/, '');
  const a0 = s.indexOf('      /* footer */');
  const a1 = s.indexOf('    }, root);', a0);
  if (a0 < 0 || a1 < 0) throw new Error('footer anim');
  s = s.slice(0, a0) + s.slice(a1);
  s = s.replace('import SocialIcon from "@/components/ui/SocialIcon";\n', '');
  s = s.replace('import { footerLinks, site, socialLinks } from "@/data/site";\n', '');
  s = s.replace(' * opens the contact form) and the site footer.', ' * opens the contact form). The site footer follows it from the root layout.');
  s = s.replace(' *   • the footer lifts as it comes into view\n', '');
  fs.writeFileSync(f, s);
  const c = 'components/home/FaqSection.module.css';
  let t = fs.readFileSync(c, 'utf8');
  const k0 = t.indexOf('/* ------------------------------------------------------------------------ */\n/* Footer');
  const k1 = t.indexOf('/* Without motion, GSAP never sets an inline panel height');
  if (k0 < 0 || k1 < 0) throw new Error('footer css');
  t = t.slice(0, k0) + t.slice(k1);
  t = t.replace('   A centred heading, an accordion, a "reach out" bar and the footer.', '   A centred heading, an accordion and a "reach out" bar. The shared footer\n   (components/ui/Footer.tsx) follows it from the root layout.');
  fs.writeFileSync(c, t);
}

// ---- layout renders the footer once ----------------------------------------
rep('app/layout.tsx', 'import { MotionProvider } from "@/components/motion/MotionProvider";', 'import { MotionProvider } from "@/components/motion/MotionProvider";\nimport Footer from "@/components/ui/Footer";');
rep('app/layout.tsx', '            {children}\n            <Cursor />', '            {children}\n            {/* One footer for every page, after its sections. */}\n            <Footer />\n            <Cursor />');

// ---- Eyebrow can hide until revealed, like HandAccent ----------------------
rep('components/ui/Eyebrow.tsx', '  labelClassName?: string;\n  ruleClassName?: string;\n}', '  labelClassName?: string;\n  ruleClassName?: string;\n  /** Adds `data-a`, keeping it hidden until its timeline sets the start\n   *  state — for heroes, whose timeline is built after first paint. */\n  hideUntilRevealed?: boolean;\n}');
rep('components/ui/Eyebrow.tsx', '  labelClassName,\n  ruleClassName,\n}: EyebrowProps) {', '  labelClassName,\n  ruleClassName,\n  hideUntilRevealed = false,\n}: EyebrowProps) {');
rep('components/ui/Eyebrow.tsx', '        .filter(Boolean)\n        .join(" ")}\n    >\n      {centred && (', '        .filter(Boolean)\n        .join(" ")}\n      {...(hideUntilRevealed ? { "data-a": "" } : {})}\n    >\n      {centred && (');

// ---- heroes: nothing paints before its timeline exists ---------------------
// Both heroes build their timeline after first paint (no preloader covers
// them), so anything not marked data-a shows plain for a frame or two before
// its entrance starts. Everything the timeline touches now carries data-a.
rep('components/about/AboutHero.tsx', '        <Eyebrow\n          label={aboutHero.eyebrow}', '        <Eyebrow\n          hideUntilRevealed\n          label={aboutHero.eyebrow}');
rep('components/about/AboutHero.tsx', '        <h1 className={styles.title}>', '        <h1 className={styles.title} data-a>');
rep('components/contact/ContactHero.tsx', '        <p className={`${styles.eyebrow} f-sans cz caps`}>', '        <p className={`${styles.eyebrow} f-sans cz caps`} data-a>');
rep('components/contact/ContactHero.tsx', '        <span className={styles.rule} aria-hidden="true" />\n\n        <h1 id="contact-title" className={styles.title}>', '        <span className={styles.rule} aria-hidden="true" data-a />\n\n        <h1 id="contact-title" className={styles.title} data-a>');
rep('components/contact/ContactHero.tsx', '        <p className={`${styles.body} f-sans cz`}>', '        <p className={`${styles.body} f-sans cz`} data-a>');
rep('components/contact/ContactHero.tsx', '        <p className={`${styles.tagline} f-sans cz caps`}>', '        <p className={`${styles.tagline} f-sans cz caps`} data-a>');
rep('components/contact/ContactHero.tsx', '        <span className={`${styles.rule} ${styles.rule2}`} aria-hidden="true" />', '        <span className={`${styles.rule} ${styles.rule2}`} aria-hidden="true" data-a />');
console.log('fix5 ok');
