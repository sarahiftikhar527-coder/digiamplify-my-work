import { useEffect, useRef } from 'react';
import Icon from '../Icons';

export default function Modal({ title, onClose, children, width = 380 }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', onKey);
    const previous = document.activeElement;
    ref.current?.querySelector('.fn-modal__body input, .fn-modal__body select')?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      previous?.focus?.();
    };
  }, []);

  return (
    <div className="fn-modal__backdrop" onMouseDown={onClose}>
      <div
        ref={ref}
        className="fn-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fn-modal-title"
        style={{ maxWidth: width }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="fn-modal__head">
          <h3 id="fn-modal-title">{title}</h3>
          <button type="button" className="fn-modal__close" aria-label="Close" onClick={onClose}>
            <Icon name="x" size={14} />
          </button>
        </div>
        <div className="fn-modal__body">{children}</div>
      </div>
    </div>
  );
}