import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Award, Check, Copy, ExternalLink, Eye, FolderKanban, Plus, Star, WandSparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext.jsx';
import { dashboardApi } from '../../api/services.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { GlowCard } from '../../components/ui/GlowCard.jsx';
import { Sparkles } from '../../components/ui/Backdrop.jsx';
import { ErrorState, Skeleton } from '../../components/ui/States.jsx';
import { StatusBadge } from '../../components/ui/Misc.jsx';
import { PROJECT_STATUS, SKILL_LEVELS } from '../../utils/constants.js';
import { gradientFor, relativeTime } from '../../utils/format.js';

function useCountUp(target, duration = 1100) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function StatCard({ label, value, icon: Icon, tone, foot }) {
  const n = useCountUp(value);
  return (
    <GlowCard className={`stat stat--${tone}`}>
      <div className="stat__top">
        <span className="stat__label">{label}</span>
        <span className="stat__icon">
          <Icon size={20} />
        </span>
      </div>
      <span className="stat__value">{n}</span>
      {foot && <span className="stat__foot">{foot}</span>}
      <span className="stat__orb" />
    </GlowCard>
  );
}

const STATUS_COLORS = { finalizado: '#34d399', en_progreso: '#fb923c', pausado: '#a78bfa' };

function Donut({ data, total }) {
  const r = 74;
  const c = 2 * Math.PI * r;
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, []);
  let offset = 0;
  return (
    <div className="donut-wrap">
      <div className="donut">
        <svg width="180" height="180" viewBox="0 0 180 180" role="img" aria-label="Proyectos por estado">
          <circle cx="90" cy="90" r={r} fill="none" stroke="var(--surface-3)" strokeWidth="16" />
          {total > 0 &&
            data.map(({ key, value }) => {
              const len = (value / total) * c;
              const el = (
                <circle
                  key={key}
                  cx="90"
                  cy="90"
                  r={r}
                  fill="none"
                  stroke={STATUS_COLORS[key]}
                  strokeWidth="16"
                  strokeLinecap="butt"
                  strokeDasharray={`${ready ? Math.max(0, len - 3) : 0} ${c}`}
                  strokeDashoffset={-offset}
                  style={{ filter: `drop-shadow(0 0 8px ${STATUS_COLORS[key]}88)` }}
                />
              );
              offset += len;
              return el;
            })}
        </svg>
        <div className="donut__center">
          <div>
            <strong>{total}</strong>
            <span>proyectos</span>
          </div>
        </div>
      </div>
      <div className="legend">
        {data.map(({ key, value }) => (
          <div key={key} className="legend__item">
            <span className="legend__swatch" style={{ background: STATUS_COLORS[key] }} />
            {PROJECT_STATUS[key]}
            <span className="legend__value">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function HBars({ items }) {
  const max = Math.max(1, ...items.map((i) => i.total));
  if (!items.length) return <p className="muted">Todavía no hay datos.</p>;
  return (
    <div className="hbars">
      {items.map((i, idx) => (
        <div key={i.name} className="hbar__row">
          <span className="hbar__label" title={i.name}>
            {i.name}
          </span>
          <div className="hbar__track">
            <div className="hbar__fill" style={{ width: `${(i.total / max) * 100}%`, animationDelay: `${idx * 70}ms` }} />
          </div>
          <span className="hbar__value">{i.total}</span>
        </div>
      ))}
    </div>
  );
}

function VBars({ items }) {
  const max = Math.max(1, ...items.map((i) => i.total));
  if (!items.length) return <p className="muted">Todavía no hay datos.</p>;
  return (
    <div className="vbars">
      {items.map((i, idx) => (
        <div key={i.year} className="vbar">
          <div className="vbar__col" style={{ height: `${(i.total / max) * 100}%`, animationDelay: `${idx * 90}ms` }}>
            <span>{i.total}</span>
          </div>
          <span className="vbar__label">{i.year}</span>
        </div>
      ))}
    </div>
  );
}

function PortfolioLink({ username, published }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/p/${username}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Link copiado', 'Ya podés compartirlo.');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('No se pudo copiar', url);
    }
  };
  return (
    <div className="share-link">
      <span className="share-link__label">{published ? 'Tu portfolio está en' : 'Cuando publiques, tu portfolio va a estar en'}</span>
      <div className="share-link__row">
        <code className="share-link__url">{url}</code>
        <button className="icon-btn icon-btn--sm" onClick={copy} aria-label="Copiar link" title="Copiar link">
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
        {published && (
          <a className="icon-btn icon-btn--sm" href={url} target="_blank" rel="noreferrer" aria-label="Abrir portfolio" title="Abrir">
            <ExternalLink size={15} />
          </a>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, error, loading, reload } = useAsync(() => dashboardApi.stats(), []);

  if (error) return <ErrorState error={error} onRetry={reload} />;

  if (loading || !data) {
    return (
      <>
        <Skeleton height={130} radius={32} style={{ marginBottom: 22 }} />
        <div className="stats-grid">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} height={150} radius={24} />
          ))}
        </div>
        <div className="dash-grid">
          <Skeleton height={280} radius={24} style={{ gridColumn: 'span 7' }} />
          <Skeleton height={280} radius={24} style={{ gridColumn: 'span 5' }} />
        </div>
      </>
    );
  }

  const { totals, projectsByStatus } = data;
  const statusData = Object.keys(PROJECT_STATUS).map((key) => ({ key, value: projectsByStatus[key] || 0 }));
  const skillsLevel = Object.entries(SKILL_LEVELS).map(([key, { label }]) => ({
    name: label,
    total: data.skillsByLevel.find((s) => s.name === key)?.total || 0,
  }));

  return (
    <>
      <section className="welcome">
        <Sparkles count={14} seed={5} />
        <div style={{ position: 'relative' }}>
          <h2>¡Hola{user?.firstName ? `, ${user.firstName}` : ''}! ✨</h2>
          <p>
            {user?.isPublished
              ? 'Tu portfolio está en línea. Cada cambio que hagas se ve al instante.'
              : 'Tu portfolio todavía es un borrador. Cargá tus datos, revisalo en la vista previa y publicalo cuando esté listo.'}
          </p>
          {user?.username && <PortfolioLink username={user.username} published={user.isPublished} />}
        </div>
        <div className="welcome__actions">
          <Link to="/admin/preview" className="btn btn--secondary">
            <Eye size={18} /> Vista previa
          </Link>
          <Link to="/admin/projects?new=1" className="btn btn--primary">
            <Plus size={18} /> Nuevo proyecto
          </Link>
        </div>
      </section>

      <div className="stats-grid">
        <StatCard label="Proyectos" value={totals.projects} icon={FolderKanban} tone="violet" foot={`${totals.technologies} tecnologías usadas`} />
        <StatCard label="Destacados" value={totals.featured} icon={Star} tone="orange" foot="Aparecen primero en tu portfolio" />
        <StatCard label="Habilidades" value={totals.skills} icon={WandSparkles} tone="pink" foot={`${data.skillsByCategory.length} categorías`} />
        <StatCard label="Certificados" value={totals.certificates} icon={Award} tone="lilac" foot="Cursos y credenciales" />
      </div>

      <div className="dash-grid">
        <GlowCard className="panel col-7">
          <div className="panel__head">
            <h3 className="panel__title">Tecnologías más usadas</h3>
            <span className="panel__sub">Top 8 en tus proyectos</span>
          </div>
          <HBars items={data.topTechnologies} />
        </GlowCard>

        <GlowCard className="panel col-5">
          <div className="panel__head">
            <h3 className="panel__title">Proyectos por estado</h3>
          </div>
          <Donut data={statusData} total={totals.projects} />
        </GlowCard>

        <GlowCard className="panel col-4">
          <div className="panel__head">
            <h3 className="panel__title">Proyectos por año</h3>
          </div>
          <VBars items={data.projectsByYear} />
        </GlowCard>

        <GlowCard className="panel col-4">
          <div className="panel__head">
            <h3 className="panel__title">Habilidades por nivel</h3>
          </div>
          <HBars items={skillsLevel} />
        </GlowCard>

        <GlowCard className="panel col-4">
          <div className="panel__head">
            <h3 className="panel__title">Actividad reciente</h3>
            <Link to="/admin/projects" className="panel__sub" style={{ color: 'var(--accent)' }}>
              Ver todo
            </Link>
          </div>
          {data.recentProjects.length ? (
            <div className="recent">
              {data.recentProjects.map((p) => (
                <Link key={p.id} to={`/admin/projects?edit=${p.id}`} className="recent__item">
                  <span className="recent__dot" style={{ background: gradientFor(p.name) }} />
                  <span className="recent__name">
                    {p.name}
                    <span className="recent__time" style={{ display: 'block', fontWeight: 400 }}>
                      {relativeTime(p.updatedAt)}
                    </span>
                  </span>
                  <StatusBadge status={p.status} />
                </Link>
              ))}
            </div>
          ) : (
            <p className="muted">Todavía no cargaste proyectos.</p>
          )}
        </GlowCard>
      </div>
    </>
  );
}
