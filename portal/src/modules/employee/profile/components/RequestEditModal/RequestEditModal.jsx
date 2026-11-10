import { useEffect, useRef, useState } from 'react';

export default function RequestEditModal({
  open,
  onClose,
  onConfirm,
}) {
  const modalRef = useRef(null);
  const cancelRef = useRef(null);
  const previousFocusRef = useRef(null);
  const busyRef = useRef(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
      busyRef.current = false;
      return undefined;
    }

    // Remember the previously focused element.
    previousFocusRef.current = document.activeElement;

    // Focus the Cancel button when the modal opens.
    const focusTimer = requestAnimationFrame(() => {
      cancelRef.current?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose?.();
        return;
      }

      // Keep keyboard focus inside the modal.
      if (event.key === 'Tab') {
        const modal = modalRef.current;
        if (!modal) return;

        const focusableElements = modal.querySelectorAll(
          'button:not(:disabled), [href], input:not(:disabled), ' +
            'select:not(:disabled), textarea:not(:disabled), ' +
            '[tabindex]:not([tabindex="-1"])'
        );

        const elements = Array.from(focusableElements).filter(
          (element) => !element.hasAttribute('hidden')
        );

        if (elements.length === 0) {
          event.preventDefault();
          modal.focus();
          return;
        }

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (
          event.shiftKey &&
          (document.activeElement === first ||
            !modal.contains(document.activeElement))
        ) {
          event.preventDefault();
          last.focus();
        } else if (
          !event.shiftKey &&
          (document.activeElement === last ||
            !modal.contains(document.activeElement))
        ) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);

      // Return focus to the element that opened the modal.
      const previousFocus = previousFocusRef.current;

      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleConfirm = async () => {
    if (busyRef.current) return;

    busyRef.current = true;
    setIsSubmitting(true);

    try {
      await onConfirm?.();
      onClose?.();
    } catch (error) {
      console.error('Unable to start profile editing:', error);
    } finally {
      busyRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && !isSubmitting) {
      onClose?.();
    }
  };

  const handleCancel = () => {
    if (!isSubmitting) {
      onClose?.();
    }
  };

  return (
    <div
      className="pf-modal__backdrop"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="pf-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pf-modal-title"
        aria-describedby="pf-modal-description"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="pf-modal-title">Edit your profile?</h3>

        <p id="pf-modal-description">
          You can change your details, but nothing is saved right away.
          Your changes are sent to the admin and are saved only after
          the admin approves them.
        </p>

        <div className="pf-modal__actions">
          <button
            ref={cancelRef}
            type="button"
            className="pf-btn pf-btn--ghost"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <button
            type="button"
            className="pf-btn"
            onClick={handleConfirm}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Starting...' : 'Start editing'}
          </button>
        </div>
      </div>
    </div>
  );
}