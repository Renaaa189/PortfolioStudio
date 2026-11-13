import { Award, Calendar, FileText } from 'lucide-react';
import { GlowCard } from '../../ui/GlowCard.jsx';
import { formatDate, formatMonthYear } from '../../../utils/format.js';
import { SectionHead } from '../shared.jsx';

function CertImage({ c, size = 30 }) {
  return <div className="cert-card__img">{c.image ? <img src={c.image} alt="" loading="lazy" /> : <Award size={size} />}</div>;
}

function PdfLink({ c }) {
  if (!c.pdfFile) return null;
  return (
    <a href={c.pdfFile} target="_blank" rel="noreferrer" className="pf-cert__pdf">
      <FileText size={14} /> Ver certificado
    </a>
  );
}

/** Certificados y cursos: 5 plantillas. */
export function CertificatesSection({ layout, certificates }) {
  const head = <SectionHead eyebrow="Formación" title={<>Certificados y <span className="gradient-text">cursos</span></>} />;
  const delay = (i, n = 3) => ({ '--delay': `${(i % n) * 80}ms` });

  if (layout === 'grilla') {
    return (
      <section className="pf-section" id="certificados">
        {head}
        <div className="pf-cgrid">
          {certificates.map((c, i) => (
            <GlowCard key={c.id} as="article" className="pf-cgrid__card reveal" style={delay(i)}>
              <div className="pf-cgrid__img">{c.image ? <img src={c.image} alt="" loading="lazy" /> : <Award size={42} />}</div>
              <div className="pf-cgrid__body">
                <span className="pf-cert__date">
                  <Calendar size={13} /> {formatDate(c.date)}
                </span>
                <h3 className="cert-card__title">{c.name}</h3>
                <span className="cert-card__inst">{c.institution}</span>
                {c.description && <p className="pf-cert__desc">{c.description}</p>}
                <PdfLink c={c} />
              </div>
            </GlowCard>
          ))}
        </div>
      </section>
    );
  }

  if (layout === 'lista') {
    return (
      <section className="pf-section" id="certificados">
        {head}
        <div className="pf-clist card reveal">
          {certificates.map((c) => (
            <div key={c.id} className="pf-clist__row">
              <span className="pf-clist__icon">
                <Award size={18} />
              </span>
              <div className="pf-clist__main">
                <strong>{c.name}</strong>
                <span className="cert-card__inst">{c.institution}</span>
              </div>
              <span className="pf-clist__date">{formatMonthYear(c.date)}</span>
              {c.pdfFile ? (
                <a href={c.pdfFile} target="_blank" rel="noreferrer" className="icon-btn icon-btn--sm" aria-label={`Ver PDF de ${c.name}`}>
                  <FileText size={14} />
                </a>
              ) : (
                <span style={{ width: 32 }} />
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (layout === 'medallas') {
    return (
      <section className="pf-section" id="certificados">
        {head}
        <div className="pf-medals">
          {certificates.map((c, i) => (
            <div key={c.id} className="pf-medal reveal" style={delay(i, 5)}>
              <div className="pf-medal__badge">
                <div className="pf-medal__inner">{c.image ? <img src={c.image} alt="" loading="lazy" /> : <Award size={34} />}</div>
              </div>
              <strong className="pf-medal__name">{c.name}</strong>
              <span className="cert-card__inst">{c.institution}</span>
              <span className="pf-clist__date">{formatMonthYear(c.date)}</span>
              <PdfLink c={c} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (layout === 'carrusel') {
    return (
      <section className="pf-section" id="certificados">
        {head}
        <div className="pf-carousel reveal">
          {certificates.map((c) => (
            <GlowCard key={c.id} as="article" className="pf-carousel__card pf-carousel__card--cert">
              <CertImage c={c} size={34} />
              <span className="pf-cert__date">
                <Calendar size={13} /> {formatDate(c.date)}
              </span>
              <h3 className="cert-card__title">{c.name}</h3>
              <span className="cert-card__inst">{c.institution}</span>
              {c.description && <p className="pf-cert__desc pcard__desc">{c.description}</p>}
              <PdfLink c={c} />
            </GlowCard>
          ))}
        </div>
      </section>
    );
  }

  // linea (por defecto)
  return (
    <section className="pf-section" id="certificados">
      {head}
      <ol className="pf-timeline">
        {certificates.map((c, i) => (
          <li key={c.id} className="pf-timeline__item reveal" style={{ '--delay': `${i * 60}ms` }}>
            <span className="pf-timeline__dot" />
            <GlowCard className="pf-cert">
              <CertImage c={c} />
              <div className="cert-card__body">
                <span className="pf-cert__date">
                  <Calendar size={13} /> {formatDate(c.date)}
                </span>
                <h3 className="cert-card__title">{c.name}</h3>
                <span className="cert-card__inst">{c.institution}</span>
                {c.description && <p className="pf-cert__desc">{c.description}</p>}
                <PdfLink c={c} />
              </div>
            </GlowCard>
          </li>
        ))}
      </ol>
    </section>
  );
}
