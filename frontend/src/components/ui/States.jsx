import { CircleAlert, RotateCw } from 'lucide-react';
import { Button } from './Button.jsx';

export function Loader({ label = 'Cargando…' }) {
  return (
    <div className="loader-screen" role="status">
      <div style={{ display: 'grid', justifyItems: 'center', gap: 16 }}>
        <div className="loader-orb" />
        <span className="muted">{label}</span>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="empty">
      {Icon && (
        <div className="empty__icon">
          <Icon size={32} />
        </div>
      )}
      <h3 className="empty__title">{title}</h3>
      {text && <p className="empty__text">{text}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry }) {
  return (
    <div className="empty">
      <div className="empty__icon" style={{ color: 'var(--danger)' }}>
        <CircleAlert size={32} />
      </div>
      <h3 className="empty__title">No pudimos cargar la información</h3>
      <p className="empty__text">{error?.message || 'Ocurrió un error inesperado.'}</p>
      {onRetry && (
        <Button variant="secondary" icon={RotateCw} onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}

export function Alert({ children, variant = 'error' }) {
  return (
    <div className={`alert ${variant === 'info' ? 'alert--info' : ''}`} role={variant === 'error' ? 'alert' : 'status'}>
      <CircleAlert size={18} />
      <div>{children}</div>
    </div>
  );
}

export function Skeleton({ height = 16, width = '100%', radius, style }) {
  return <div className="skeleton" style={{ height, width, borderRadius: radius, ...style }} />;
}
