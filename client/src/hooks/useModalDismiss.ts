/*
 * Dismisses the specified modal "dialog" element on out-of-bounds
 * mouse-click or ESC keypress.
 */
import { useEffect, RefObject } from "react";

/**
 * @param isOpen - is the modal current active?
 * @param onClose - no-arg callback to invoke when the modal should be dismissed
 * @param modalRef - the model "dialog" element
 *
 * Note this hook doesn't actually close or hide the `modalRef`
 * HTMLElement (that reference is only used for event target
 * tracking). This hook invokes `onClose` (with the expectation
 * that that onClose handler will dismiss the dialog).
 */
export default function useModalDismiss(
  isOpen: boolean,
  onClose: () => void,
  modalRef: RefObject<HTMLElement>
) {
  useEffect(() => {
    if (!isOpen) {
      return;
    } else {
      const clickHandler = (e: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
          onClose();
        }
      };
      const escHandler = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      document.addEventListener("mousedown", clickHandler);
      document.addEventListener("keydown", escHandler);
      return () => {
        document.removeEventListener("mousedown", clickHandler);
        document.removeEventListener("keydown", escHandler);
      };
    }
  }, [isOpen, onClose, modalRef]);
}
