import { Link } from 'react-router';
import { Compass } from 'lucide-react';
import { Backdrop } from '../../components/ui/Backdrop.jsx';
import { EmptyState } from '../../components/ui/States.jsx';

export default function NotFoundPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <Backdrop />
      <div>
        <h1 className="gradient-text" style={{ fontSize: 'clamp(90px, 18vw, 180px)', textAlign: 'center', fontWeight: 800 }}>
          404
        </h1>
        <EmptyState
          icon={Compass}
          title="Esta página se perdió en el espacio"
          text="El enlace que seguiste no existe o fue movido."
          action={
            <Link to="/" className="btn btn--primary">
              Volver al inicio
            </Link>
          }
        />
      </div>
    </div>
  );
}
