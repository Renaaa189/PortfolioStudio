import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, TriangleAlert } from 'lucide-react';
import { Button, IconButton } from './Button.jsx';

export function Modal({ open, onClose, title, subtitle, size, children, dismissible = true }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const prevFocus = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusFirst = () => {
      const el = ref.current?.querySelector('input:not([type=hidden]), textarea, select, button.btn--primary, button');
      el?.focus();
    };
    const t = setTimeout(focusFirst, 30);

    const onKey = (e) => {
      if (e.key === 'Escape' && dismissible) onClose?.();
      if (e.key === 'Tab' && ref.current) {
        const nodes = ref.current.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
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
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, [open, onClose, dismissible]);

  if (!open) return null;

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && dismissible && onClose?.()}>
      <div ref={ref} className={`modal ${size ? `modal--${size}` : ''}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        {(title || dismissible) && (
          <div className="modal__header">
            <div>
              {title && (
                <h2 className="modal__title" id="modal-title">
                  {title}
                </h2>
              )}
              {subtitle && <p className="modal__subtitle">{subtitle}</p>}
            </div>
            {dismissible && <IconButton icon={X} label="Cerrar" onClick={onClose} />}
          </div>
        )}
        <div className="modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Eliminar', onConfirm, onCancel, loading }) {
  return (
    <Modal open={open} onClose={onCancel} size="sm" dismissible={!loading}>
      <div className="confirm">
        <div className="confirm__icon">
          <TriangleAlert size={30} />
        </div>
        <h2 className="modal__title" id="modal-title">
          {title}
        </h2>
        <p>{message}</p>
        <div className="form-actions">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger-solid" onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
