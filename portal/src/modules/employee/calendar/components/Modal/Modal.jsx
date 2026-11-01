import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Icon from '../Icons';

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function Modal({ title, subtitle, icon, onClose, width = 560, children }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const firstField = ref.current?.querySelector('.cal-modal__body input, .cal-modal__body textarea');
    (firstField || ref.current)?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !ref.current) return;
      const nodes = [...ref.current.querySelectorAll(FOCUSABLE)];
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previous?.focus?.();
    };
  }, []);

  return createPortal(
    <div
      className="cal-modal__backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        className="cal-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cal-modal-title"
        tabIndex={-1}
        style={{ maxWidth: width }}
      >
        <header className="cal-modal__head">
          <div>
            <h3 id="cal-modal-title">
              {icon && <Icon name={icon} size={16} />} {title}
            </h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="cal-modal__close" aria-label="Close" onClick={onClose}>
            <Icon name="x" size={16} />
          </button>
        </header>
        <div className="cal-modal__body">{children}</div>
      </div>
    </div>,
    document.body
  );
}