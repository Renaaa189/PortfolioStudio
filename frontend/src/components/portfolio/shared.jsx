import { ArrowUpRight, Globe, Mail, Star } from 'lucide-react';
import { SparkleIcon } from '../ui/Backdrop.jsx';
import { Modal } from '../ui/Modal.jsx';
import { StatusBadge } from '../ui/Misc.jsx';
import { GithubIcon, LinkedinIcon } from '../ui/BrandIcons.jsx';
import { ProjectCover } from '../ui/Media.jsx';
import { formatMonthYear } from '../../utils/format.js';

/** Piezas reutilizadas por todas las plantillas del portfolio. */

export function socialLinks(profile, size = 18) {
  return [
    profile.github && { href: profile.github, label: 'GitHub', icon: <GithubIcon size={size} /> },
    profile.linkedin && { href: profile.linkedin, label: 'LinkedIn', icon: <LinkedinIcon size={size} /> },
    profile.website && { href: profile.website, label: 'Sitio web', icon: <Globe size={size} /> },
    profile.email && { href: `mailto:${profile.email}`, label: 'Email', icon: <Mail size={size} /> },
  ].filter(Boolean);
}

export function Socials({ profile, size = 18, className = '' }) {
  return (
    <div className={`pf-socials ${className}`}>
      {socialLinks(profile, size).map((l) => (
        <a
          key={l.label}
          href={l.href}
          target={l.href.startsWith('mailto') ? undefined : '_blank'}
          rel="noreferrer"
          className="pf-social"
          aria-label={l.label}
          title={l.label}
        >
          {l.icon}
        </a>
      ))}
    </div>
  );
}

export function SectionHead({ eyebrow, title, text, center }) {
  return (
    <div className={`pf-section__head reveal ${center ? 'pf-section__head--center' : ''}`}>
      <span className="pf-eyebrow">
        <SparkleIcon size={11} /> {eyebrow}
      </span>
      <h2 className="pf-section__title">{title}</h2>
      {text && <p className="pf-section__text">{text}</p>}
    </div>
  );
}

export function TechChips({ list, max }) {
  const shown = max ? list.slice(0, max) : list;
  return (
    <div className="pcard__techs">
      {shown.map((t) => (
        <span key={t} className="chip chip--tech">
          {t}
        </span>
      ))}
      {max && list.length > max && <span className="chip">+{list.length - max}</span>}
    </div>
  );
}

export function ProjectLinks({ project, size = 'sm' }) {
  const stop = (e) => e.stopPropagation();
  return (
    <div className="pf-links">
      {project.demoUrl && (
        <a className={`btn btn--primary btn--${size}`} href={project.demoUrl} target="_blank" rel="noreferrer" onClick={stop}>
          Ver demo <ArrowUpRight size={15} />
        </a>
      )}
      {project.githubUrl && (
        <a className={`btn btn--secondary btn--${size}`} href={project.githubUrl} target="_blank" rel="noreferrer" onClick={stop}>
          <GithubIcon size={15} /> Código
        </a>
      )}
    </div>
  );
}

export function FeaturedBadge({ label = true }) {
  return (
    <span className="badge badge--featured">
      <Star size={12} fill="currentColor" /> {label && 'Destacado'}
    </span>
  );
}

export function ProjectDetail({ project, onClose }) {
  return (
    <Modal
      open={Boolean(project)}
      onClose={onClose}
      title={project?.name}
      subtitle={project && `${project.category || 'Proyecto'} · ${formatMonthYear(project.date)}`}
    >
      {project && (
        <div className="pf-detail">
          <div className="pf-detail__cover">
            <ProjectCover project={project} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <StatusBadge status={project.status} />
            {project.featured && <FeaturedBadge />}
          </div>
          <p className="pf-detail__desc">{project.description}</p>
          <TechChips list={project.technologies} />
          <ProjectLinks project={project} />
        </div>
      )}
    </Modal>
  );
}

/** Props para que un elemento abra el detalle con click o Enter. */
export const openable = (onOpen, project) => ({
  role: 'button',
  tabIndex: 0,
  onClick: () => onOpen(project),
  onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onOpen(project)),
  'aria-label': `Ver detalles de ${project.name}`,
});
