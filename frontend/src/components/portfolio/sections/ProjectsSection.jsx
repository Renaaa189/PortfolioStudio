import { useMemo, useState } from 'react';
import { ArrowUpRight, ExternalLink, Search, Star } from 'lucide-react';
import { GlowCard } from '../../ui/GlowCard.jsx';
import { StatusBadge } from '../../ui/Misc.jsx';
import { GithubIcon } from '../../ui/BrandIcons.jsx';
import { ProjectCover } from '../../ui/Media.jsx';
import { EmptyState } from '../../ui/States.jsx';
import { useReveal } from '../../../hooks/useReveal.js';
import { formatMonthYear } from '../../../utils/format.js';
import { SectionHead, TechChips, openable } from '../shared.jsx';

function Filters({ projects, value, onChange }) {
  const categories = useMemo(() => [...new Set(projects.map((p) => p.category).filter(Boolean))], [projects]);
  const techs = useMemo(() => [...new Set(projects.flatMap((p) => p.technologies))].sort(), [projects]);
  const set = (k) => (v) => onChange({ ...value, [k]: v });
  return (
    <div className="pf-filters reveal">
      <div className="chip-row" style={{ marginBottom: 0 }} role="group" aria-label="Filtrar por categoría">
        <button className="chip chip-filter" aria-pressed={!value.category} onClick={() => set('category')('')}>
          Todos
        </button>
        {categories.map((c) => (
          <button key={c} className="chip chip-filter" aria-pressed={value.category === c} onClick={() => set('category')(c === value.category ? '' : c)}>
            {c}
          </button>
        ))}
      </div>
      <div className="pf-filters__right">
        <div className="input-icon">
          <Search size={16} />
          <input className="input" placeholder="Buscar…" value={value.q} onChange={(e) => set('q')(e.target.value)} aria-label="Buscar proyectos" />
        </div>
        <select className="select" value={value.tech} onChange={(e) => set('tech')(e.target.value)} aria-label="Filtrar por tecnología">
          <option value="">Todas las tecnologías</option>
          {techs.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

const ext = (e) => e.stopPropagation();

function IconLinks({ p }) {
  return (
    <span className="pf-icon-links">
      {p.githubUrl && (
        <a className="icon-btn icon-btn--sm" href={p.githubUrl} target="_blank" rel="noreferrer" onClick={ext} aria-label="Código">
          <GithubIcon size={14} />
        </a>
      )}
      {p.demoUrl && (
        <a className="icon-btn icon-btn--sm" href={p.demoUrl} target="_blank" rel="noreferrer" onClick={ext} aria-label="Demo">
          <ExternalLink size={14} />
        </a>
      )}
    </span>
  );
}

function Grid({ list, onOpen }) {
  return (
    <div className="pf-grid">
      {list.map((p, i) => (
        <GlowCard key={p.id} as="article" className="pcard pf-card reveal" style={{ '--delay': `${(i % 3) * 90}ms` }} {...openable(onOpen, p)}>
          <div className="pcard__cover">
            <ProjectCover project={p} />
            <div className="pcard__badges">
              <StatusBadge status={p.status} />
              {p.featured && (
                <span className="badge badge--featured">
                  <Star size={12} fill="currentColor" />
                </span>
              )}
            </div>
            <span className="pf-card__open">
              <ArrowUpRight size={18} />
            </span>
          </div>
          <div className="pcard__body">
            <div className="pcard__meta">
              <span>{p.category}</span>
              <span>{formatMonthYear(p.date)}</span>
            </div>
            <h3 className="pcard__title">{p.name}</h3>
            <p className="pcard__desc">{p.description}</p>
            <TechChips list={p.technologies} max={4} />
          </div>
        </GlowCard>
      ))}
    </div>
  );
}

function List({ list, onOpen }) {
  return (
    <div className="pf-plist">
      {list.map((p, i) => (
        <GlowCard key={p.id} as="article" className="pf-plist__row reveal" style={{ '--delay': `${(i % 4) * 60}ms` }} {...openable(onOpen, p)}>
          <div className="pf-plist__thumb">
            <ProjectCover project={p} />
          </div>
          <div className="pf-plist__body">
            <div className="pcard__meta">
              <span>
                {p.category} · {formatMonthYear(p.date)}
              </span>
              <StatusBadge status={p.status} />
            </div>
            <h3 className="pcard__title">{p.name}</h3>
            <p className="pcard__desc">{p.description}</p>
            <div className="pf-plist__foot">
              <TechChips list={p.technologies} max={5} />
              <IconLinks p={p} />
            </div>
          </div>
        </GlowCard>
      ))}
    </div>
  );
}

function Gallery({ list, onOpen }) {
  return (
    <div className="pf-gallery">
      {list.map((p, i) => (
        <article key={p.id} className={`pf-gallery__tile reveal ${i % 5 === 0 ? 'pf-gallery__tile--big' : ''}`} {...openable(onOpen, p)}>
          <ProjectCover project={p} />
          <div className="pf-gallery__info">
            <span className="pf-gallery__cat">{p.category}</span>
            <h3>{p.name}</h3>
            <TechChips list={p.technologies} max={3} />
          </div>
        </article>
      ))}
    </div>
  );
}

function Compact({ list, onOpen }) {
  return (
    <div className="pf-table card reveal" role="table" aria-label="Proyectos">
      <div className="pf-table__row pf-table__row--head" role="row">
        <span role="columnheader">Proyecto</span>
        <span role="columnheader">Tecnologías</span>
        <span role="columnheader">Estado</span>
        <span role="columnheader">Año</span>
        <span role="columnheader" className="sr-only">
          Enlaces
        </span>
      </div>
      {list.map((p) => (
        <div key={p.id} className="pf-table__row" role="row" {...openable(onOpen, p)}>
          <span role="cell" className="pf-table__name">
            <strong>{p.name}</strong>
            <small>{p.category}</small>
          </span>
          <span role="cell">
            <TechChips list={p.technologies} max={3} />
          </span>
          <span role="cell">
            <StatusBadge status={p.status} />
          </span>
          <span role="cell" className="muted">
            {String(p.date).slice(0, 4)}
          </span>
          <span role="cell">
            <IconLinks p={p} />
          </span>
        </div>
      ))}
    </div>
  );
}

function Timeline({ list, onOpen }) {
  const byYear = useMemo(() => {
    const map = new Map();
    [...list]
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .forEach((p) => {
        const y = String(p.date).slice(0, 4);
        if (!map.has(y)) map.set(y, []);
        map.get(y).push(p);
      });
    return [...map.entries()];
  }, [list]);
  return (
    <div className="pf-ptimeline">
      {byYear.map(([year, items]) => (
        <div key={year} className="pf-ptimeline__year">
          <span className="pf-ptimeline__label gradient-text reveal">{year}</span>
          <div className="pf-ptimeline__items">
            {items.map((p) => (
              <GlowCard key={p.id} as="article" className="pf-ptimeline__card reveal" {...openable(onOpen, p)}>
                <span className="pf-ptimeline__dot" />
                <div className="pcard__meta">
                  <span>
                    {formatMonthYear(p.date)} · {p.category}
                  </span>
                  <StatusBadge status={p.status} />
                </div>
                <h3 className="pcard__title">{p.name}</h3>
                <p className="pcard__desc">{p.description}</p>
                <TechChips list={p.technologies} max={5} />
              </GlowCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const LAYOUT_COMPONENTS = { grilla: Grid, lista: List, galeria: Gallery, compacta: Compact, linea: Timeline };

/** Todos los proyectos: 5 plantillas, todas con búsqueda y filtros. */
export function ProjectsSection({ layout, projects, onOpen }) {
  const [filters, setFilters] = useState({ category: '', tech: '', q: '' });
  const q = filters.q.trim().toLowerCase();
  const filtered = projects.filter(
    (p) =>
      (!filters.category || p.category === filters.category) &&
      (!filters.tech || p.technologies.includes(filters.tech)) &&
      (!q || p.name.toLowerCase().includes(q) || p.technologies.some((t) => t.toLowerCase().includes(q))),
  );
  useReveal([filtered.length, filters.category, filters.tech, layout]);
  const Layout = LAYOUT_COMPONENTS[layout] || Grid;

  return (
    <section className="pf-section" id="proyectos">
      <SectionHead
        eyebrow="Trabajo"
        title={<>Todos los <span className="gradient-text">proyectos</span></>}
        text="Filtrá por categoría o tecnología para encontrar lo que buscás."
      />
      <Filters projects={projects} value={filters} onChange={setFilters} />
      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="Nada por acá" text="Ningún proyecto coincide con esos filtros." />
      ) : (
        <Layout list={filtered} onOpen={onOpen} />
      )}
    </section>
  );
}
