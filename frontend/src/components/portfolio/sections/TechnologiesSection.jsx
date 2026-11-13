import { SparkleIcon } from '../../ui/Backdrop.jsx';
import { SectionHead } from '../shared.jsx';

function repeat(list, min = 10) {
  let base = [...list];
  while (base.length && base.length < min) base = base.concat(list);
  return base;
}

function Marquee({ items, reverse, outline }) {
  const base = repeat(items);
  const all = [...base, ...base];
  return (
    <div className={`pf-marquee ${outline ? 'pf-marquee--outline' : ''}`}>
      <div className={`pf-marquee__track ${reverse ? 'pf-marquee__track--reverse' : ''}`}>
        {all.map((t, i) => (
          <span key={i} className="pf-marquee__item" aria-hidden={i >= base.length || undefined}>
            <SparkleIcon size={outline ? 22 : 12} /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * Tecnologías: 5 plantillas.
 * `counts` es una lista [[nombre, cantidad de proyectos]] ordenada de mayor a menor.
 */
export function TechnologiesSection({ layout, counts }) {
  const names = counts.map(([t]) => t);

  if (layout === 'doble') {
    const half = Math.ceil(names.length / 2);
    const a = names.slice(0, half);
    const b = names.slice(half).length ? names.slice(half) : names;
    return (
      <section className="pf-tech pf-tech--doble" id="tecnologias" aria-label="Tecnologías">
        <Marquee items={a} />
        <Marquee items={b} reverse />
      </section>
    );
  }

  if (layout === 'contorno') {
    return (
      <section className="pf-tech pf-tech--contorno" id="tecnologias" aria-label="Tecnologías">
        <Marquee items={names} outline />
      </section>
    );
  }

  if (layout === 'nube') {
    const max = Math.max(...counts.map(([, n]) => n));
    return (
      <section className="pf-section" id="tecnologias">
        <SectionHead center eyebrow="Tecnologías" title={<>Con qué <span className="gradient-text">trabajo</span></>} />
        <div className="pf-cloud reveal">
          {counts.map(([t, n]) => (
            <span key={t} className="pf-cloud__item" style={{ '--s': 0.85 + (n / max) * 0.9 }}>
              {t}
            </span>
          ))}
        </div>
      </section>
    );
  }

  if (layout === 'contador') {
    const max = Math.max(...counts.map(([, n]) => n));
    return (
      <section className="pf-section" id="tecnologias">
        <SectionHead eyebrow="Tecnologías" title={<>Mi <span className="gradient-text">stack</span> en números</>} />
        <div className="pf-counter">
          {counts.slice(0, 12).map(([t, n], i) => (
            <div key={t} className="pf-counter__item reveal" style={{ '--delay': `${(i % 4) * 70}ms` }}>
              <strong className="gradient-text">{n}</strong>
              <span className="pf-counter__name">{t}</span>
              <span className="pf-counter__label">{n === 1 ? 'proyecto' : 'proyectos'}</span>
              <span className="pf-counter__bar">
                <i style={{ '--w': `${(n / max) * 100}%` }} />
              </span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // cinta (por defecto)
  return (
    <section className="pf-tech" id="tecnologias" aria-label="Tecnologías">
      <Marquee items={names} />
    </section>
  );
}
