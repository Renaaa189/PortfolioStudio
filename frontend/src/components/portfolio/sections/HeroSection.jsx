import { ArrowRight, MapPin, Sparkles as SparklesIcon } from 'lucide-react';
import { Sparkles, SparkleIcon } from '../../ui/Backdrop.jsx';
import { Socials } from '../shared.jsx';
import { initials } from '../../../utils/format.js';

function Pill({ profile }) {
  return (
    <span className="pf-pill">
      <span className="pf-pill__dot" />
      {profile.location ? (
        <>
          <MapPin size={13} /> {profile.location}
        </>
      ) : (
        'Disponible para nuevos proyectos'
      )}
    </span>
  );
}

function Ctas({ hasProjects, center }) {
  return (
    <div className="pf-hero__ctas" style={center ? { justifyContent: 'center' } : undefined}>
      {hasProjects && (
        <a href="#proyectos" className="btn btn--primary btn--lg">
          Ver mis proyectos <ArrowRight size={18} />
        </a>
      )}
      <a href="#contacto" className="btn btn--secondary btn--lg">
        Contactame
      </a>
    </div>
  );
}

function Stats({ stats, className = '' }) {
  return (
    <div className={`pf-stats ${className}`}>
      {stats.map(([n, label]) => (
        <div key={label} className="pf-stat">
          <strong className="gradient-text">{n}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function Photo({ profile, className = '' }) {
  return (
    <div className={`pf-photo ${className}`}>
      {profile.photo ? <img src={profile.photo} alt="" /> : <span>{initials(profile.firstName, profile.lastName)}</span>}
    </div>
  );
}

/** Portada: 5 plantillas. */
export function HeroSection({ layout, profile, projects, certificates, topTechs }) {
  const firstName = profile.firstName || '';
  const stats = [
    [projects.length, 'Proyectos'],
    [new Set(projects.flatMap((p) => p.technologies)).size, 'Tecnologías'],
    [certificates.length, 'Certificados'],
  ];
  const hasProjects = projects.length > 0;
  const bio = profile.bio && <p className="pf-hero__bio">{profile.bio}</p>;
  const role = profile.role && <p className="pf-hero__role">{profile.role}</p>;

  if (layout === 'centrada') {
    return (
      <section className="pf-hero pf-hero--centrada" id="inicio">
        <div className="pf-hero__avatar-ring">
          <Photo profile={profile} />
        </div>
        <Pill profile={profile} />
        <h1 className="pf-hero__title">
          Hola, soy <span className="gradient-text">{firstName}</span>
        </h1>
        {role}
        {bio}
        <Ctas hasProjects={hasProjects} center />
        <Socials profile={profile} />
        <Stats stats={stats} />
      </section>
    );
  }

  if (layout === 'minimal') {
    return (
      <section className="pf-hero pf-hero--minimal" id="inicio">
        <span className="pf-hero__kicker">{profile.role || 'Portfolio'}</span>
        <h1 className="pf-hero__giant">
          {profile.firstName}
          <br />
          <span className="gradient-text">{profile.lastName}</span>
          <span className="pf-hero__dot">.</span>
        </h1>
        <div className="pf-hero__minimal-row">
          {bio}
          <div className="pf-hero__minimal-side">
            {profile.location && (
              <span className="muted" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                <MapPin size={14} /> {profile.location}
              </span>
            )}
            <div className="pf-hero__inline-stats">
              {stats.map(([n, l]) => (
                <span key={l}>
                  <strong>{n}</strong> {l.toLowerCase()}
                </span>
              ))}
            </div>
            <Socials profile={profile} />
          </div>
        </div>
      </section>
    );
  }

  if (layout === 'tarjeta') {
    return (
      <section className="pf-hero pf-hero--tarjeta" id="inicio">
        <div className="pf-hero-card card spin-border">
          <Sparkles count={10} seed={23} />
          <Photo profile={profile} className="pf-photo--square" />
          <div className="pf-hero-card__body">
            <Pill profile={profile} />
            <h1 className="pf-hero__title pf-hero__title--md">
              {profile.firstName} <span className="gradient-text">{profile.lastName}</span>
            </h1>
            {role}
            {bio}
            <Ctas hasProjects={hasProjects} />
            <Socials profile={profile} />
          </div>
        </div>
        <Stats stats={stats} className="pf-stats--wide" />
      </section>
    );
  }

  if (layout === 'banner') {
    return (
      <section className="pf-hero pf-hero--banner" id="inicio">
        <div className="pf-banner">
          <Sparkles count={18} seed={29} />
          <div className="pf-banner__grid" />
          {topTechs.slice(0, 5).map((t, i) => (
            <span key={t} className={`pf-banner__tag pf-banner__tag--${i + 1}`}>
              <SparkleIcon size={11} /> {t}
            </span>
          ))}
        </div>
        <div className="pf-banner__info">
          <Photo profile={profile} className="pf-photo--banner" />
          <div className="pf-banner__text">
            <h1 className="pf-hero__title pf-hero__title--md">
              {profile.firstName} <span className="gradient-text">{profile.lastName}</span>
            </h1>
            {role}
            {profile.location && (
              <span className="muted" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                <MapPin size={14} /> {profile.location}
              </span>
            )}
          </div>
          <Socials profile={profile} className="pf-banner__socials" />
        </div>
        <div className="pf-banner__bottom">
          {bio}
          <Stats stats={stats} />
        </div>
      </section>
    );
  }

  // dividida (por defecto)
  return (
    <section className="pf-hero" id="inicio">
      <div className="pf-hero__text">
        <Pill profile={profile} />
        <h1 className="pf-hero__title">
          Hola, soy <span className="gradient-text">{firstName}</span>
          <SparkleIcon size={34} className="pf-hero__spark" />
        </h1>
        {role}
        {bio}
        <Ctas hasProjects={hasProjects} />
        <Socials profile={profile} />
      </div>
      <div className="pf-hero__visual" aria-hidden="true">
        <div className="pf-orb">
          <div className="pf-orb__ring" />
          <div className="pf-orb__ring pf-orb__ring--2" />
          <div className="pf-orb__core">
            {profile.photo ? <img src={profile.photo} alt="" /> : <span>{initials(profile.firstName, profile.lastName)}</span>}
          </div>
          <Sparkles count={12} seed={21} />
          {topTechs.slice(0, 4).map((t, i) => (
            <span key={t} className={`pf-float pf-float--${i + 1}`}>
              <SparklesIcon size={13} /> {t}
            </span>
          ))}
        </div>
        <Stats stats={stats} />
      </div>
    </section>
  );
}
