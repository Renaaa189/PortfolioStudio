import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { ArrowRight, Eye, EyeOff, FolderKanban, Lock, Mail, Palette, Rocket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useForm } from '../../hooks/useForm.js';
import { isEmail } from '../../utils/validation.js';
import { Backdrop, Sparkles } from '../../components/ui/Backdrop.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { TextInput } from '../../components/ui/Field.jsx';
import { Alert } from '../../components/ui/States.jsx';
import { Logo, ThemeToggle } from '../../components/ui/Misc.jsx';

const validate = ({ email, password }) => ({
  email: !email.trim() ? 'Ingresá tu email' : !isEmail(email) ? 'El email no es válido' : undefined,
  password: !password ? 'Ingresá tu contraseña' : undefined,
});

export default function LoginPage() {
  const { login, status } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPass, setShowPass] = useState(false);
  const form = useForm({ email: '', password: '' }, validate);

  useEffect(() => {
    document.title = 'Ingresar · Portfolio Studio';
  }, []);

  if (status === 'authenticated') return <Navigate to={location.state?.from || '/admin'} replace />;

  const onSubmit = form.handleSubmit(async ({ email, password }) => {
    const user = await login(email.trim(), password);
    toast.success(`¡Hola${user.firstName ? `, ${user.firstName}` : ''}!`, 'Bienvenida/o a tu panel.');
    navigate(location.state?.from || '/admin', { replace: true });
  });

  return (
    <div className="auth-page">
      <Backdrop sparkles={30} />

      <section className="auth-hero">
        <Link to="/">
          <Logo />
        </Link>
        <div>
          <h1>
            Volviste. <span className="gradient-text">Sigamos armando tu portfolio.</span>
          </h1>
          <p>Actualizá proyectos, habilidades y certificados y los cambios se publican al instante.</p>
          <div className="auth-features">
            {[
              [FolderKanban, 'Proyectos con búsqueda y filtros'],
              [Palette, 'Tema claro y oscuro'],
              [Rocket, 'Vista previa antes de publicar'],
            ].map(([Icon, text]) => (
              <div key={text} className="auth-feature">
                <span className="auth-feature__icon">
                  <Icon size={18} />
                </span>
                {text}
              </div>
            ))}
          </div>
        </div>
        <span className="muted" style={{ fontSize: 13 }}>
          © {new Date().getFullYear()} Portfolio Studio
        </span>
        <div className="auth-orb" />
      </section>

      <section className="auth-panel">
        <div style={{ position: 'absolute', top: 20, right: 20 }}>
          <ThemeToggle />
        </div>
        <div className="auth-card card spin-border">
          <Sparkles count={8} seed={3} />
          <h2>Iniciar sesión</h2>
          <p className="muted">Entrá a tu panel para editar tu portfolio.</p>
          <form onSubmit={onSubmit} noValidate>
            {form.formError && <Alert>{form.formError}</Alert>}
            <TextInput
              label="Email"
              type="email"
              icon={Mail}
              autoComplete="username"
              placeholder="vos@ejemplo.com"
              {...form.bind('email')}
            />
            <div style={{ position: 'relative' }}>
              <TextInput
                label="Contraseña"
                type={showPass ? 'text' : 'password'}
                icon={Lock}
                autoComplete="current-password"
                placeholder="••••••••"
                {...form.bind('password')}
              />
              <button
                type="button"
                className="icon-btn icon-btn--sm pass-toggle"
                style={{ top: 44, transform: 'none' }}
                onClick={() => setShowPass((s) => !s)}
                aria-label={showPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <Button type="submit" size="lg" block loading={form.submitting} iconRight={ArrowRight}>
              Entrar
            </Button>
          </form>
          <p className="auth-switch">
            ¿No tenés cuenta? <Link to="/registro">Creá tu portfolio gratis</Link>
          </p>
          {import.meta.env.DEV && (
            <div className="auth-demo">
              Cuenta demo: <code>demo@portfoliostudio.dev</code> · <code>Demo1234!</code>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
