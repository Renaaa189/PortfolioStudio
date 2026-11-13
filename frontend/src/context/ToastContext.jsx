import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CircleCheck, CircleAlert, Info, X } from 'lucide-react';

const ToastContext = createContext(null);
const ICONS = { success: CircleCheck, error: CircleAlert, info: Info };
const DURATION = 4200;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (type, title, message) => {
      const id = ++idRef.current;
      setToasts((list) => [...list.slice(-3), { id, type, title, message }]);
      setTimeout(() => dismiss(id), DURATION);
    },
    [dismiss],
  );

  const api = useMemo(
    () => ({
      success: (title, message) => push('success', title, message),
      error: (title, message) => push('error', title, message),
      info: (title, message) => push('info', title, message),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toasts" role="region" aria-live="polite" aria-label="Notificaciones">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div key={t.id} className={`toast toast--${t.type}`} style={{ '--toast-duration': `${DURATION}ms` }}>
              <Icon size={20} className="toast__icon" />
              <div className="toast__body">
                <div className="toast__title">{t.title}</div>
                {t.message && <div className="toast__msg">{t.message}</div>}
              </div>
              <button className="icon-btn icon-btn--sm" onClick={() => dismiss(t.id)} aria-label="Cerrar">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
