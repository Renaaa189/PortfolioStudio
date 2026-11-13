import { ArrowUpRight } from 'lucide-react';
import { ProjectCover } from '../../ui/Media.jsx';
import { formatMonthYear } from '../../../utils/format.js';
import { ProjectLinks, SectionHead, TechChips, openable } from '../shared.jsx';

const pad = (n) => String(n + 1).padStart(2, '0');

function Meta({ project, index }) {
  return (
    <div className="pf-featured__meta">
      <span className="pf-featured__num">{pad(index)}</span>
      {project.category && <span>{project.category}</span>}
      <span>·</span>
      <span>{formatMonthYear(project.date)}</span>
    </div>
  );
}

/** Destacados: 5 plantillas. */
export function FeaturedSection({ layout, projects, onOpen }) {
  const head = <SectionHead eyebrow="Destacados" title={<>Proyectos que <span className="gradient-text">me enorgullecen</span></>} />;

  if (layout === 'vitrina') {
    const [main, ...rest] = projects;
    return (
      <section className="pf-section" id="destacados">
        {head}
        <div className={`pf-showcase ${rest.length ? '' : 'pf-showcase--single'}`}>
          <article className="pf-showcase__main reveal" {...openable(onOpen, main)}>
            <div className="pf-showcase__media">
              <ProjectCover project={main} />
            </div>
            <div className="pf-showcase__body">
              <Meta project={main} index={0} />
              <h3 className="pf-featured__title">{main.name}</h3>
              <p className="pf-featured__desc">{main.description}</p>
              <TechChips list={main.technologies} max={6} />
              <ProjectLinks project={main} />
            </div>
          </article>
          {rest.length > 0 && (
            <div className="pf-showcase__side">
              {rest.slice(0, 4).map((p, i) => (
                <article key={p.id} className="pf-showcase__item reveal" style={{ '--delay': `${i * 80}ms` }} {...openable(onOpen, p)}>
                  <div className="pf-showcase__thumb">
                    <ProjectCover project={p} />
                  </div>
                  <div>
                    <Meta project={p} index={i + 1} />
                    <h3 className="pf-showcase__name">{p.name}</h3>
                    <TechChips list={p.technologies} max={3} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  if (layout === 'carrusel') {
    return (
      <section className="pf-section" id="destacados">
        {head}
        <div className="pf-carousel reveal">
          {projects.map((p, i) => (
            <article key={p.id} className="pf-carousel__card glow-card" {...openable(onOpen, p)}>
              <div className="pf-carousel__media">
                <ProjectCover project={p} />
              </div>
              <div className="pf-carousel__body">
                <Meta project={p} index={i} />
                <h3 className="pf-showcase__name">{p.name}</h3>
                <p className="pcard__desc">{p.description}</p>
                <TechChips list={p.technologies} max={4} />
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (layout === 'superpuesta') {
    return (
      <section className="pf-section" id="destacados">
        {head}
        <div className="pf-overlay-grid">
          {projects.map((p, i) => (
            <article
              key={p.id}
              className={`pf-overlay reveal ${i === 0 && projects.length % 2 ? 'pf-overlay--wide' : ''}`}
              style={{ '--delay': `${(i % 2) * 90}ms` }}
              {...openable(onOpen, p)}
            >
              <ProjectCover project={p} />
              <div className="pf-overlay__shade" />
              <div className="pf-overlay__content">
                <Meta project={p} index={i} />
                <h3 className="pf-featured__title">{p.name}</h3>
                <p className="pf-overlay__desc">{p.description}</p>
                <TechChips list={p.technologies} max={4} />
              </div>
              <span className="pf-card__open">
                <ArrowUpRight size={18} />
              </span>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (layout === 'numerada') {
    return (
      <section className="pf-section" id="destacados">
        {head}
        <ol className="pf-numbered">
          {projects.map((p, i) => (
            <li key={p.id} className="pf-numbered__row reveal" style={{ '--delay': `${i * 60}ms` }} {...openable(onOpen, p)}>
              <span className="pf-numbered__num gradient-text">{pad(i)}</span>
              <div className="pf-numbered__body">
                <h3 className="pf-numbered__title">{p.name}</h3>
                <p className="pcard__desc">{p.description}</p>
                <TechChips list={p.technologies} max={5} />
              </div>
              <div className="pf-numbered__thumb">
                <ProjectCover project={p} />
              </div>
              <ArrowUpRight className="pf-numbered__arrow" size={26} />
            </li>
          ))}
        </ol>
      </section>
    );
  }

  // alternada (por defecto)
  return (
    <section className="pf-section" id="destacados">
      {head}
      <div className="pf-featured-list">
        {projects.map((p, i) => (
          <article key={p.id} className={`pf-featured reveal ${i % 2 ? 'pf-featured--alt' : ''}`}>
            <button className="pf-featured__media spin-border" onClick={() => onOpen(p)} aria-label={`Ver detalles de ${p.name}`}>
              <ProjectCover project={p} />
              <span className="pf-featured__shine" />
            </button>
            <div className="pf-featured__body">
              <Meta project={p} index={i} />
              <h3 className="pf-featured__title">{p.name}</h3>
              <p className="pf-featured__desc">{p.description}</p>
              <TechChips list={p.technologies} />
              <ProjectLinks project={p} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
