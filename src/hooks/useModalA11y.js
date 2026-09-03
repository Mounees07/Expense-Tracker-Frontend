import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Accessibility behavior shared by all modals:
 * - traps Tab/Shift+Tab focus within the modal while it is open
 * - closes on Escape
 * - returns focus to the element that opened the modal, on close
 *
 * Usage: const modalRef = useModalA11y(isOpen, onClose);
 * Attach `modalRef` to the outer modal container element.
 */
const useModalA11y = (isOpen, onClose) => {
  const modalRef = useRef(null);
  const triggerElementRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    triggerElementRef.current = document.activeElement;

    const focusFirstElement = () => {
      const node = modalRef.current;
      if (!node) return;
      const focusable = node.querySelectorAll(FOCUSABLE_SELECTOR);
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        node.focus();
      }
    };

    // Defer so the modal content is mounted first
    const raf = requestAnimationFrame(focusFirstElement);

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(modalRef.current.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
          (el) => el.offsetParent !== null
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKeyDown, true);
      if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
        triggerElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  return modalRef;
};

export default useModalA11y;
