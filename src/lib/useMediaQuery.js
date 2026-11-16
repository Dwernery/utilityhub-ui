import { useSyncExternalStore } from "react";

/** Tailwind's default breakpoints, so JS and `md:`/`lg:` classes switch together. */
export const BREAKPOINTS = {
  md: "(min-width: 48rem)",
  lg: "(min-width: 64rem)",
};

/**
 * Whether a CSS media query currently matches, updating when it changes.
 * Only re-renders when the answer flips, not on every resize event.
 *
 * @param {string} query  e.g. BREAKPOINTS.md
 */
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
