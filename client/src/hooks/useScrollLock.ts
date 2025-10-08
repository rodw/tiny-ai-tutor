/*
 * Prevents mousewheel/trackpad-gesture-based scrolling under an overlay pane.
 */
import { useEffect, RefObject } from "react";

/**
 * @param isLocked - whether to lock or unlock the element
 * @param lockedClassName - class name to add/remove when locked/unlocked. defaults to `scroll-locked`
 * @param targetRef - element to lock/unlock; defaults to `document.body`
 *
 * Note this hook really only toggles the `lockedClassName` for the
 * `targetRef` element. It relies on a companion rule like:
 * ```css
 * body.scroll-locked {
 *   overflow: hidden !important;
 *   overscroll-behavior: none !important;
 * }
 * ```
 * (or some other logic) to enforce the lock.
 */
export default function useScrollLock(
  isLocked: boolean,
  lockedClassName: string | null | undefined = undefined,
  targetRef: RefObject<HTMLElement> | null | undefined = undefined
) {
  // if no lockedClassName is provided fall back to "scroll-locked"
  const className = lockedClassName != null && lockedClassName.trim() ? lockedClassName : "scroll-locked";
  useEffect(() => {
    // if no targetRef is provided fall back to document.body
    const targetElt = targetRef != null ? targetRef.current : document.body;
    if (isLocked) {
      targetElt?.classList?.add(className);
    } else {
      targetElt?.classList?.remove(className);
    }
    return () => {
      targetElt?.classList?.remove(className);
    };
  }, [isLocked, lockedClassName, targetRef]);
}