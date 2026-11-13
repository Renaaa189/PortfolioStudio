import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ArrowLeft, Eye, Rocket } from 'lucide-react';
import { portfolioApi, profileApi } from '../../api/services.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Backdrop } from '../../components/ui/Backdrop.jsx';
import { ErrorState, Loader } from '../../components/ui/States.jsx';
import { PortfolioView } from '../../components/portfolio/PortfolioView.jsx';

export default function PreviewPage() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const { data, error, reload } = useAsync(() => portfolioApi.preview(), []);
  const [busy, setBusy] = useState(false);
  const [params] = useSearchParams();
  const embed = params.get('embed') === '1';
  const [liveDesign, setLiveDesign] = useState(null);

  useEffect(() => {
    document.title = 'Vista previa · Portfolio Studio';
  }, []);

  // Modo embebido: el editor de diseño manda el diseño en vivo por postMessage.
  useEffect(() => {
    if (!embed) return undefined;
    const onMessage = (e) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.type === 'ps-design') setLiveDesign(e.data.design);
      if (e.data?.type === 'ps-scroll') {
        // scrollIntoView también movería la página del editor: desplazamos solo este documento.
        const el = document.getElementById(e.data.id);
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [embed]);

  useEffect(() => {
    if (embed && data) window.parent?.postMessage({ type: 'ps-preview-ready' }, window.location.origin);
  }, [embed, data]);

  if (embed) {
    if (error) return <ErrorState error={error} onRetry={reload} />;
    if (!data) return <Loader label="Armando tu portfolio…" />;
    return <PortfolioView data={data} design={liveDesign} />;
  }

  const toggle = async () => {
    setBusy(true);
    try {
      const updated = await profileApi.setPublished(!user.isPublished);
      setUser(updated);
      toast.success(updated.isPublished ? '¡Portfolio publicado! 🚀' : 'Portfolio despublicado');
    } catch (err) {
      toast.error('No se pudo cambiar el estado', err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="preview-bar">
        <Link to="/admin" className="btn btn--ghost btn--sm">
          <ArrowLeft size={15} /> Volver al panel
        </Link>
        <span className="preview-bar__label">
          <Eye size={15} /> Vista previa {user?.isPublished ? '· publicado' : '· borrador'}
        </span>
        <Button size="sm" variant={user?.isPublished ? 'secondary' : 'primary'} icon={Rocket} loading={busy} onClick={toggle}>
          {user?.isPublished ? 'Despublicar' : 'Publicar'}
        </Button>
      </div>
      {error ? (
        <>
          <Backdrop />
          <ErrorState error={error} onRetry={reload} />
        </>
      ) : !data ? (
        <>
          <Backdrop />
          <Loader label="Armando tu portfolio…" />
        </>
      ) : (
        <PortfolioView data={data} preview />
      )}
    </>
  );
}
