import { ArrowUpRight, Mail, MapPin } from 'lucide-react';
import { Sparkles, SparkleIcon } from '../../ui/Backdrop.jsx';
import { GlowCard } from '../../ui/GlowCard.jsx';
import { Socials, socialLinks } from '../shared.jsx';

const TITLE = '¿Tenés una idea? Hagámosla realidad.';
const TEXT = 'Disponible para proyectos, colaboraciones y nuevas oportunidades.';

/** Contacto: 5 plantillas. */
export function ContactSection({ layout, profile }) {
  const mail = profile.email && `mailto:${profile.email}`;

  if (layout === 'dividida') {
    return (
      <section className="pf-section" id="contacto">
        <div className="pf-contact-split">
          <div className="reveal">
            <span className="pf-eyebrow">
              <SparkleIcon size={11} /> Contacto
            </span>
            <h2 className="pf-section__title" style={{ marginTop: 14 }}>
              Hablemos de tu <span className="gradient-text">próximo proyecto</span>
            </h2>
            <p className="pf-section__text" style={{ marginTop: 14 }}>
              {TEXT}
            </p>
            {profile.location && (
              <p className="muted" style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 14 }}>
                <MapPin size={15} /> {profile.location}
              </p>
            )}
          </div>
          <div className="pf-contact-split__links">
            {socialLinks(profile, 20).map((l, i) => (
              <GlowCard
                key={l.label}
                as="a"
                href={l.href}
                target={l.href.startsWith('mailto') ? undefined : '_blank'}
                rel="noreferrer"
                className="pf-contact-link reveal"
                style={{ '--delay': `${i * 70}ms` }}
              >
                <span className="pf-contact-link__icon">{l.icon}</span>
                <span className="pf-contact-link__text">
                  <strong>{l.label}</strong>
                  <small>{l.href.replace(/^mailto:|^https?:\/\/(www\.)?/, '')}</small>
                </span>
                <ArrowUpRight size={18} />
              </GlowCard>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'minimal') {
    return (
      <section className="pf-section pf-contact-minimal" id="contacto">
        <p className="pf-contact-minimal__kicker reveal">¿Trabajamos juntos?</p>
        {mail ? (
          <a href={mail} className="pf-contact-minimal__mail gradient-text reveal">
            {profile.email}
          </a>
        ) : (
          <h2 className="pf-contact-minimal__mail gradient-text reveal">Hablemos</h2>
        )}
        <Socials profile={profile} className="reveal" />
      </section>
    );
  }

  if (layout === 'tarjeta') {
    return (
      <section className="pf-section" id="contacto">
        <div className="pf-contact-card card spin-border reveal">
          <Sparkles count={10} seed={41} />
          <span className="pf-eyebrow">
            <SparkleIcon size={11} /> Contacto
          </span>
          <h2 className="pf-section__title">{TITLE}</h2>
          <p className="pf-section__text">{TEXT}</p>
          <div className="pf-contact-card__buttons">
            {socialLinks(profile, 18).map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith('mailto') ? undefined : '_blank'}
                rel="noreferrer"
                className={`btn ${l.label === 'Email' ? 'btn--primary' : 'btn--secondary'} btn--lg`}
              >
                {l.icon} {l.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'franja') {
    return (
      <section className="pf-band" id="contacto">
        <Sparkles count={16} seed={47} />
        <div className="pf-band__inner reveal">
          <div>
            <h2 className="pf-band__title">¿Tenés una idea?</h2>
            <p className="pf-band__text">{TEXT}</p>
          </div>
          <div className="pf-band__actions">
            {mail && (
              <a href={mail} className="btn btn--lg pf-contact__btn">
                <Mail size={18} /> Escribime
              </a>
            )}
            <Socials profile={profile} />
          </div>
        </div>
      </section>
    );
  }

  // degradado (por defecto)
  return (
    <section className="pf-section" id="contacto">
      <div className="pf-contact reveal">
        <Sparkles count={22} seed={33} />
        <div className="pf-contact__glow" />
        <span className="pf-eyebrow pf-eyebrow--light">
          <SparkleIcon size={11} /> Contacto
        </span>
        <h2 className="pf-contact__title">{TITLE}</h2>
        <p className="pf-contact__text">{TEXT}</p>
        {mail && (
          <a href={mail} className="btn btn--lg pf-contact__btn">
            <Mail size={18} /> {profile.email}
          </a>
        )}
        <Socials profile={profile} />
      </div>
    </section>
  );
}
