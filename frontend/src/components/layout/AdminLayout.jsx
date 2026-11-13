import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router';
import {
  Award, Brush, Eye, FolderKanban, Globe, LayoutDashboard, LogOut, Menu, UserRound, WandSparkles, X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { Backdrop } from '../ui/Backdrop.jsx';
import { Avatar, Logo, ThemeToggle } from '../ui/Misc.jsx';
import { Loader } from '../ui/States.jsx';
import { fullName } from '../../utils/format.js';

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Proyectos', icon: FolderKanban },
  { to: '/admin/skills', label: 'Habilidades', icon: WandSparkles },
  { to: '/admin/certificates', label: 'Certificados', icon: Award },
  { to: '/admin/profile', label: 'Perfil', icon: UserRound },
  { to: '/admin/design', label: 'Diseño', icon: Brush },
];

const TITLES = {
  '/admin': ['Dashboard', 'Un vistazo a tu portfolio'],
  '/admin/projects': ['Proyectos', 'Creá, editá y destacá tu trabajo'],
  '/admin/skills': ['Habilidades', 'Lo que sabés hacer, por categoría y nivel'],
  '/admin/certificates': ['Certificados', 'Tus cursos y credenciales'],
  '/admin/profile': ['Perfil', 'Cómo te presentás al mundo'],
  '/admin/design': ['Diseño', 'Colores, fondo, tipografía y plantillas de cada sección'],
};

export function AdminLayout() {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [title, subtitle] = TITLES[pathname.replace(/\/$/, '')] || TITLES['/admin'];

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    document.title = `${title} · Portfolio Studio`;
  }, [title]);

  return (
    <div className="admin">
      <Backdrop sparkles={14} />

      <aside className={`sidebar ${menuOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__head">
          <Link to="/admin" aria-label="Ir al dashboard">
            <Logo />
          </Link>
          <button className="icon-btn sidebar__close" onClick={() => setMenuOpen(false)} aria-label="Cerrar menú">
            <X size={17} />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Secciones">
          <span className="sidebar__section">Contenido</span>
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className="nav-link">
              <span className="nav-link__icon">
                <Icon size={18} />
              </span>
              {label}
            </NavLink>
          ))}
          <span className="sidebar__section">Publicación</span>
          <Link to="/admin/preview" className="nav-link">
            <span className="nav-link__icon">
              <Eye size={18} />
            </span>
            Vista previa
          </Link>
          <a href={`/p/${user?.username}`} target="_blank" rel="noreferrer" className="nav-link">
            <span className="nav-link__icon">
              <Globe size={18} />
            </span>
            Mi portfolio público
          </a>
        </nav>

        <div className="sidebar__foot">
          <div className={`publish-pill ${user?.isPublished ? 'publish-pill--on' : ''}`}>
            <span className="publish-pill__dot" />
            {user?.isPublished ? 'Portfolio publicado' : 'Borrador (no publicado)'}
          </div>
          <div className="user-card">
            <Avatar src={user?.photo} firstName={user?.firstName} lastName={user?.lastName} size={40} />
            <div className="user-card__info">
              <strong>{fullName(user) || 'Administrador'}</strong>
              <span>@{user?.username}</span>
            </div>
            <button className="icon-btn icon-btn--sm" onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión">
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
      {menuOpen && <div className="sidebar-scrim" onClick={() => setMenuOpen(false)} />}

      <div className="admin__main">
        <header className="topbar">
          <button className="icon-btn topbar__menu" onClick={() => setMenuOpen(true)} aria-label="Abrir menú">
            <Menu size={18} />
          </button>
          <div className="topbar__titles">
            <h1 className="topbar__title">{title}</h1>
            <p className="topbar__subtitle">{subtitle}</p>
          </div>
          <div className="topbar__actions">
            <Link to="/admin/preview" className="btn btn--secondary btn--sm topbar__preview">
              <Eye size={15} /> Vista previa
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <main className="admin__content" key={pathname}>
          <Suspense fallback={<Loader />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
