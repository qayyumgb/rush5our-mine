"use client";

/**
 * MEDIA QUERY HOOKS — subscribe to a media query without a render cascade.
 *
 * `useSyncExternalStore` is used rather than `useState` + `useEffect` because
 * the match is external state that can change at any time (a visitor turning
 * on "reduce motion", or plugging in a mouse). It also gives an explicit
 * server snapshot, so SSR and the first client render agree and nothing
 * flashes on hydration.
 */

import { useCallback, useSyncExternalStore } from "react";

/**
 * @param query       a media query string
 * @param serverValue what to assume during SSR and the first paint
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  const getServerSnapshot = useCallback(() => serverValue, [serverValue]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * True when the visitor has asked for reduced motion.
 * Assumes "no" on the server: the page is designed with motion, and the
 * client corrects on its first commit, before any timeline is built.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)", false);
}

/**
 * True for mouse/trackpad pointers. Assumes "no" on the server so touch
 * devices never briefly mount hover-only machinery.
 */
export function useFinePointer(): boolean {
  return useMediaQuery("(pointer: fine)", false);
}
