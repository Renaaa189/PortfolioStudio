import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Backdrop } from '../ui/Backdrop.jsx';
import { ThemeToggle } from '../ui/Misc.jsx';
import { useReveal } from '../../hooks/useReveal.js';
import { applyDesign, withDefaults } from '../../utils/design.js';
import { fullName, initials } from '../../utils/format.js';
import { ProjectDetail } from './shared.jsx';
import { HeroSection } from './sections/HeroSection.jsx';
import { TechnologiesSection } from './sections/TechnologiesSection.jsx';
import { FeaturedSection } from './sections/FeaturedSection.jsx';
import { ProjectsSection } from './sections/ProjectsSection.jsx';
import { SkillsSection } from './sections/SkillsSection.jsx';
import { CertificatesSection } from './sections/CertificatesSection.jsx';
import { ContactSection } from './sections/ContactSection.jsx';

const NAV_LABELS = {
  technologies: ['#tecnologias', 'Tecnologías'],
  featured: ['#destacados', 'Destacados'],
  projects: ['#proyectos', 'Proyectos'],
  skills: ['#habilidades', 'Habilidades'],
  certificates: ['#certificados', 'Certificados'],
  contact: ['#contacto', 'Contacto'],
};

/**
 * Portfolio público. El diseño (paleta, fondo, tipografía, plantilla de cada
 * sección, orden y secciones ocultas) viene de `data.profile.design` o de
 * `design` (para la vista previa en vivo del editor).
 */
export function PortfolioView({ data, design: designOverride, preview = false }) {
  const { profile, projects, skills, certificates } = data;
  const design = useMemo(() => withDefaults(designOverride || profile.design), [designOverride, profile.design]);
  const [selected, setSelected] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const name = fullName(profile);

  useLayoutEffect(() => applyDesign(design), [design]);

  const techCounts = useMemo(() => {
    const count = new Map();
    projects.flatMap((p) => p.technologies).forEach((t) => count.set(t, (count.get(t) || 0) + 1));
    return [...count.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [projects]);
  const featured = projects.filter((p) => p.featured);

  // Qué secciones tienen contenido para mostrar.
  const hasContent = {
    technologies: techCounts.length > 0,
    featured: featured.length > 0,
    projects: projects.length > 0,
    skills: skills.length > 0,
    certificates: certificates.length > 0,
    contact: true,
  };
  const visible = design.order.filter((s) => !design.hidden.includes(s) && hasContent[s]);

  useReveal([data, design]);

  useEffect(() => {
    document.title = name ? `${name} · ${profile.role || 'Portfolio'}` : 'Portfolio';
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [name, profile.role]);

  const renderSection = (key) => {
    const layout = design.layouts[key];
    switch (key) {
      case 'technologies':
        return <TechnologiesSection key={key} layout={layout} counts={techCounts} />;
      case 'featured':
        return <FeaturedSection key={key} layout={layout} projects={featured} onOpen={setSelected} />;
      case 'projects':
        return <ProjectsSection key={key} layout={layout} projects={projects} onOpen={setSelected} />;
      case 'skills':
        return <SkillsSection key={key} layout={layout} skills={skills} />;
      case 'certificates':
        return <CertificatesSection key={key} layout={layout} certificates={certificates} />;
      case 'contact':
        return <ContactSection key={key} layout={layout} profile={profile} />;
      default:
        return null;
    }
  };

  // Las tecnologías en formato cinta no tienen título, no van en el menú.
  const navItems = visible
    .filter((s) => !(s === 'technologies' && ['cinta', 'doble', 'contorno'].includes(design.layouts.technologies)))
    .map((s) => NAV_LABELS[s]);

  return (
    <div className={`pf pf--font-${design.font} ${preview ? 'pf--preview' : ''}`}>
      <Backdrop variant={design.background} sparkles={34} />

      <header className={`pf-nav ${scrolled ? 'pf-nav--scrolled' : ''}`}>
        <a href="#inicio" className="pf-nav__brand">
          <span className="pf-nav__mark">{initials(profile.firstName, profile.lastName)}</span>
          <span className="pf-nav__name">{name}</span>
        </a>
        <nav className="pf-nav__links" aria-label="Secciones">
          {navItems.map(([href, label]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <div className="pf-nav__actions">
          <ThemeToggle />
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="btn btn--primary btn--sm pf-nav__cta">
              Hablemos
            </a>
          )}
        </div>
      </header>

      <main>
        <HeroSection
          layout={design.layouts.hero}
          profile={profile}
          projects={projects}
          certificates={certificates}
          topTechs={techCounts.map(([t]) => t)}
        />
        {visible.map(renderSection)}
      </main>

      <footer className="pf-footer">
        <span>
          © {new Date().getFullYear()} {name}
        </span>
        <a href="/" className="muted">
          Hecho con <span className="gradient-text" style={{ fontWeight: 700 }}>Portfolio Studio</span> · Creá el tuyo
        </a>
      </footer>

      <ProjectDetail project={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
