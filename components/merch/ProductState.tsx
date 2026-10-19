/**
 * PRODUCT PAGE STATES — not found, couldn't load, the store not set up, and
 * the loading skeleton. Server components; share ProductDetail's sheet.
 */

import type { StateCopy } from "@/data/shop";
import { shop } from "@/data/shop";
import styles from "./ProductDetail.module.css";

export function ProductState({ copy, alert }: { copy: StateCopy; alert?: boolean }) {
  const cta = shop.product.notFound.cta;
  return (
    <div className={styles.state} role={alert ? "alert" : undefined}>
      <h1 className={`${styles.stateTitle} f-display`}>{copy.title}</h1>
      <p className={`${styles.stateBody} f-sans`}>{copy.body}</p>
      <a className={`${styles.stateCta} f-cond caps`} href={cta.href}>
        {cta.label}
      </a>
    </div>
  );
}

export function ProductSkeleton() {
  return (
    <div className={styles.product} role="status" aria-label={shop.loading.title}>
      <div className={styles.layout}>
        <div className={`${styles.skeleton} ${styles.skeletonMedia}`} />
        <div>
          <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: "30%" }} />
          <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: "85%", height: 56 }} />
          <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: "35%", height: 40 }} />
          <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: "70%", height: 48 }} />
          <div className={`${styles.skeleton} ${styles.skeletonLine}`} style={{ width: "100%", height: 64 }} />
        </div>
      </div>
    </div>
  );
}
