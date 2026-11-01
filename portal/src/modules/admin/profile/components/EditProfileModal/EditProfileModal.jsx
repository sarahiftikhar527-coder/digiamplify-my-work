
import { useEffect, useRef, useState } from 'react';

export default function EditProfileModal({
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

    previousFocusRef.current = document.activeElement;

    const focusTimer = requestAnimationFrame(() => {
      cancelRef.current?.focus();
    });

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !busyRef.current) {
        event.preventDefault();
        onClose?.();
        return;
      }

      if (event.key === 'Tab') {
        const modal = modalRef.current;

        if (!modal) return;

        const elements = Array.from(
          modal.querySelectorAll(
            'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((element) => !element.hasAttribute('hidden'));

        if (!elements.length) {
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
      console.error('Unable to open profile editing:', error);
    } finally {
      busyRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleBackdropClick = (event) => {
    if (
      event.target === event.currentTarget &&
      !busyRef.current
    ) {
      onClose?.();
    }
  };

  const handleCancel = () => {
    if (!busyRef.current) {
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
        <h3 id="pf-modal-title">Edit employee profile</h3>

        <p id="pf-modal-description">
          You will be taken to the employee profile to edit the
          existing details. Your changes will be saved when you
          select Save changes.
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
            {isSubmitting ? 'Opening...' : 'Edit profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
