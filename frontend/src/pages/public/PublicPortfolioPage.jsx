import { Link, useParams } from 'react-router';
import { SearchX, Sparkles } from 'lucide-react';
import { portfolioApi } from '../../api/services.js';
import { useAsync } from '../../hooks/useAsync.js';
import { Backdrop } from '../../components/ui/Backdrop.jsx';
import { EmptyState, ErrorState, Loader } from '../../components/ui/States.jsx';
import { Logo } from '../../components/ui/Misc.jsx';
import { PortfolioView } from '../../components/portfolio/PortfolioView.jsx';

export default function PublicPortfolioPage() {
  const { username } = useParams();
  const { data, error, reload } = useAsync(() => portfolioApi.public(username), [username]);

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
        <Backdrop />
        <div style={{ textAlign: 'center' }}>
          <Link to="/">
            <Logo />
          </Link>
          {error.status === 404 ? (
            <EmptyState
              icon={SearchX}
              title="Este portfolio no está disponible"
              text={`No existe un portfolio publicado para "${username}". Puede que todavía esté en construcción.`}
              action={
                <Link to="/registro" className="btn btn--primary">
                  <Sparkles size={18} /> Crear mi propio portfolio
                </Link>
              }
            />
          ) : (
            <ErrorState error={error} onRetry={reload} />
          )}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <>
        <Backdrop />
        <Loader label="Cargando portfolio…" />
      </>
    );
  }

  return <PortfolioView data={data} />;
}
