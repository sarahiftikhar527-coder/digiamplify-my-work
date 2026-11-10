import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { initials } from "../utils";
import "../meetings.css";

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Modal({ title, subtitle, onClose, width = 720, children, footer, labelId = "mt-modal-title" }) {
  const ref = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const previous = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const first = ref.current?.querySelector("input:not([type=hidden]), textarea");
    (first || ref.current)?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") {
        closeRef.current?.();
        return;
      }
      if (e.key !== "Tab" || !ref.current) return;
      const nodes = [...ref.current.querySelectorAll(FOCUSABLE)];
      if (!nodes.length) return;
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === firstNode) {
        e.preventDefault();
        lastNode.focus();
      } else if (!e.shiftKey && document.activeElement === lastNode) {
        e.preventDefault();
        firstNode.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previous?.focus?.();
    };
  }, []);

  return createPortal(
    <div className="mt-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div
        ref={ref}
        className="mt-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        tabIndex={-1}
        style={{ maxWidth: width }}
      >
        <header className="mt-modal__head">
          <div>
            <h3 id={labelId}>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="mt-icon-btn" aria-label="Close" onClick={onClose}>
            <X size={16} />
          </button>
        </header>
        <div className="mt-modal__body">{children}</div>
        {footer && <footer className="mt-modal__foot">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}

export function Avatar({ name, src, size = 28 }) {
  const [failed, setFailed] = useState(false);
  const style = { width: size, height: size, fontSize: Math.max(10, size * 0.38) };

  if (src && !failed) {
    return <img className="mt-avatar" style={style} src={src} alt="" onError={() => setFailed(true)} />;
  }
  return (
    <span className="mt-avatar mt-avatar--text" style={style} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

export function Spinner() {
  return <span className="mt-spinner" role="status" aria-label="Loading" />;
}