import { gradientFor, isImageUrl } from '../../utils/format.js';

/** Portada de proyecto: la imagen o un arte con degradado generado a partir del nombre. */
export function ProjectCover({ project, className = '' }) {
  if (project.image) return <img src={project.image} alt={`Portada de ${project.name}`} loading="lazy" className={className} />;
  const letters = project.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <div className={`cover-art ${className}`} style={{ background: gradientFor(project.name) }} aria-hidden="true">
      <span className="cover-art__text">{letters}</span>
    </div>
  );
}

/** Ícono de habilidad: emoji, imagen o iniciales. */
export function SkillIcon({ skill, size }) {
  const style = size ? { width: size, height: size } : undefined;
  if (skill.icon && isImageUrl(skill.icon)) {
    return (
      <span className="skill-icon" style={style}>
        <img src={skill.icon} alt="" loading="lazy" />
      </span>
    );
  }
  if (skill.icon) return <span className="skill-icon" style={style}>{skill.icon}</span>;
  return <span className="skill-icon skill-icon--text" style={style}>{skill.name.slice(0, 2).toUpperCase()}</span>;
}
