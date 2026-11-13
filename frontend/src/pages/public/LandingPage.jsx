import { useEffect } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight, Award, Eye, FolderKanban, LayoutDashboard, Link2, MoonStar, Search, Smartphone, UserPlus, WandSparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useReveal } from '../../hooks/useReveal.js';
import { Backdrop, Sparkles, SparkleIcon } from '../../components/ui/Backdrop.jsx';
import { GlowCard } from '../../components/ui/GlowCard.jsx';
import { Logo, ThemeToggle } from '../../components/ui/Misc.jsx';

const STEPS = [
  { icon: UserPlus, title: 'Creá tu cuenta', text: 'Elegí tu nombre de usuario: va a ser el link de tu portfolio.' },
  { icon: FolderKanban, title: 'Cargá tu trabajo', text: 'Sumá proyectos, habilidades y certificados desde un panel simple.' },
  { icon: Link2, title: 'Publicá y compartí', text: 'Revisá la vista previa, publicá y compartí tu link donde quieras.' },
];

const FEATURES = [
  { icon: FolderKanban, title: 'Proyectos', text: 'Con imagen, tecnologías, links a GitHub y demo, estado y destacados.' },
  { icon: WandSparkles, title: 'Habilidades', text: 'Agrupadas por categoría y con tu nivel en cada una.' },
  { icon: Award, title: 'Certificados', text: 'Con imagen y PDF descargable, ordenados en una línea de tiempo.' },
  { icon: LayoutDashboard, title: 'Dashboard', text: 'Estadísticas de tu portfolio: tecnologías, estados y años.' },
  { icon: Eye, title: 'Vista previa', text: 'Mirá cómo queda antes de publicarlo. Publicás cuando quieras.' },
  { icon: Search, title: 'Búsqueda y filtros', text: 'Encontrá cualquier proyecto por nombre, tecnología, año o estado.' },
  { icon: MoonStar, title: 'Tema claro y oscuro', text: 'Tu portfolio se ve increíble en los dos modos.' },
  { icon: Smartphone, title: 'Responsive', text: 'Perfecto en computadora, tablet y celular.' },
];

const AUDIENCE = ['Desarrolladores', 'Diseñadores UX/UI', 'Estudiantes', 'Freelancers', 'Full Stack', 'Profesionales'];

/** Mini maqueta de un portfolio, hecha con CSS, para el hero. */
function PortfolioMockup() {
  return (
    <div className="mock" aria-hidden="true">
      <div className="mock__bar">
        <span />
        <span />
        <span />
        <div className="mock__url">
          <Link2 size={11} /> portfoliostudio.app/p/<b>tu-nombre</b>
        </div>
      </div>
      <div className="mock__body">
        <Sparkles count={10} seed={17} />
        <div className="mock__hero">
          <div className="mock__avatar">TN</div>
          <div className="mock__lines">
            <i className="mock__line mock__line--title" />
            <i className="mock__line mock__line--accent" />
            <i className="mock__line" />
            <i className="mock__line mock__line--short" />
          </div>
        </div>
        <div className="mock__chips">
          {['React', 'Node.js', 'Figma', 'MySQL'].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className="mock__grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`mock__card mock__card--${i}`}>
              <div className="mock__cover" />
              <i className="mock__line" />
              <i className="mock__line mock__line--short" />
            </div>
          ))}
        </div>
      </div>
      <span className="mock__float mock__float--1">
        <SparkleIcon size={12} /> ¡Portfolio publicado!
      </span>
      <span className="mock__float mock__float--2">
        <Eye size={13} /> Vista previa
      </span>
    </div>
  );
}

export default function LandingPage() {
  const { status } = useAuth();
  const loggedIn = status === 'authenticated';
  useReveal([]);

  useEffect(() => {
    document.title = 'Portfolio Studio · Creá tu portfolio profesional';
  }, []);

  const cta = loggedIn ? (
    <Link to="/admin" className="btn btn--primary btn--lg">
      Ir a mi panel <ArrowRight size={18} />
    </Link>
  ) : (
    <Link to="/registro" className="btn btn--primary btn--lg">
      Crear mi portfolio gratis <ArrowRight size={18} />
    </Link>
  );

  return (
    <div className="lp">
      <Backdrop sparkles={36} />

      <header className="lp-nav">
        <Link to="/" aria-label="Portfolio Studio">
          <Logo />
        </Link>
        <nav className="lp-nav__links" aria-label="Secciones">
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#funciones">Funciones</a>
        </nav>
        <div className="lp-nav__actions">
          <ThemeToggle />
          {loggedIn ? (
            <Link to="/admin" className="btn btn--primary btn--sm">
              Mi panel
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost btn--sm">
                Ingresar
              </Link>
              <Link to="/registro" className="btn btn--primary btn--sm lp-nav__signup">
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </header>

      <main>
        <section className="lp-hero">
          <div className="lp-hero__text">
            <span className="pf-pill">
              <SparkleIcon size={12} style={{ color: 'var(--c3)' }} /> Sin código · Sin deploys · Gratis
            </span>
            <h1 className="lp-hero__title">
              Tu portfolio profesional, <span className="gradient-text">listo en minutos.</span>
            </h1>
            <p className="lp-hero__sub">
              Portfolio Studio arma tu sitio por vos. Cargás proyectos, habilidades y certificados desde un panel, y obtenés un portfolio
              moderno con tu propio link, que actualizás cuando quieras sin tocar una línea de código.
            </p>
            <div className="pf-hero__ctas">
              {cta}
              {!loggedIn && (
                <Link to="/login" className="btn btn--secondary btn--lg">
                  Ya tengo cuenta
                </Link>
              )}
            </div>
            <div className="lp-audience">
              <span>Ideal para</span>
              {AUDIENCE.map((a) => (
                <span key={a} className="chip">
                  {a}
                </span>
              ))}
            </div>
          </div>
          <PortfolioMockup />
        </section>

        <section className="pf-section" id="como-funciona">
          <div className="pf-section__head reveal">
            <span className="pf-eyebrow">
              <SparkleIcon size={11} /> Cómo funciona
            </span>
            <h2 className="pf-section__title">
              De cero a publicado en <span className="gradient-text">3 pasos</span>
            </h2>
          </div>
          <div className="lp-steps">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <GlowCard key={title} className="lp-step reveal" style={{ '--delay': `${i * 100}ms` }}>
                <span className="lp-step__num">0{i + 1}</span>
                <span className="lp-step__icon">
                  <Icon size={22} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </GlowCard>
            ))}
          </div>
        </section>

        <section className="pf-section" id="funciones">
          <div className="pf-section__head reveal">
            <span className="pf-eyebrow">
              <SparkleIcon size={11} /> Funciones
            </span>
            <h2 className="pf-section__title">
              Todo lo que tu portfolio <span className="gradient-text">necesita</span>
            </h2>
            <p className="pf-section__text">Vos te ocupás del contenido. Del diseño, la publicación y el resto nos encargamos nosotros.</p>
          </div>
          <div className="lp-features">
            {FEATURES.map(({ icon: Icon, title, text }, i) => (
              <GlowCard key={title} className="lp-feature reveal" style={{ '--delay': `${(i % 4) * 80}ms` }}>
                <span className="lp-feature__icon">
                  <Icon size={20} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </GlowCard>
            ))}
          </div>
        </section>

        <section className="pf-section">
          <div className="pf-contact reveal">
            <Sparkles count={22} seed={33} />
            <div className="pf-contact__glow" />
            <h2 className="pf-contact__title">Mostrale al mundo lo que sabés hacer.</h2>
            <p className="pf-contact__text">Creá tu cuenta y tené tu portfolio online hoy mismo.</p>
            <Link to={loggedIn ? '/admin' : '/registro'} className="btn btn--lg pf-contact__btn">
              {loggedIn ? 'Ir a mi panel' : 'Empezar ahora'} <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="pf-footer">
        <Logo />
        <span>© {new Date().getFullYear()} Portfolio Studio</span>
      </footer>
    </div>
  );
}
