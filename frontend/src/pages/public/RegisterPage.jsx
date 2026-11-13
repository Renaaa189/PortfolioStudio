import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import { ArrowRight, AtSign, Eye, EyeOff, Link2, Lock, Mail, Rocket, Share2, UserRound, WandSparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useForm } from '../../hooks/useForm.js';
import { slugify, validateRegister } from '../../utils/validation.js';
import { Backdrop, Sparkles } from '../../components/ui/Backdrop.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { TextInput } from '../../components/ui/Field.jsx';
import { Alert } from '../../components/ui/States.jsx';
import { Logo, ThemeToggle } from '../../components/ui/Misc.jsx';

const EMPTY = { firstName: '', lastName: '', username: '', email: '', password: '' };

export default function RegisterPage() {
  const { register, status } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [usernameTouched, setUsernameTouched] = useState(false);
  const form = useForm(EMPTY, validateRegister);
  const { values, setField } = form;

  useEffect(() => {
    document.title = 'Crear cuenta · Portfolio Studio';
  }, []);

  // Sugiere el usuario a partir del nombre hasta que la persona lo edite a mano.
  useEffect(() => {
    if (!usernameTouched) setField('username', slugify(`${values.firstName} ${values.lastName}`));
  }, [values.firstName, values.lastName, usernameTouched, setField]);

  if (status === 'authenticated') return <Navigate to="/admin" replace />;

  const onSubmit = form.handleSubmit(async (data) => {
    const user = await register({ ...data, email: data.email.trim() });
    toast.success(`¡Bienvenida/o, ${user.firstName}! ✨`, 'Tu cuenta está lista. Empezá a armar tu portfolio.');
    navigate('/admin', { replace: true });
  });

  const usernameField = form.bind('username');

  return (
    <div className="auth-page">
      <Backdrop sparkles={30} />

      <section className="auth-hero">
        <Link to="/">
          <Logo />
        </Link>
        <div>
          <h1>
            Creá tu portfolio <span className="gradient-text">en minutos.</span>
          </h1>
          <p>Cargá tus proyectos, habilidades y certificados desde un panel. Nosotros lo convertimos en un sitio profesional.</p>
          <div className="auth-features">
            {[
              [WandSparkles, 'Diseño profesional sin escribir código'],
              [Rocket, 'Publicás cuando quieras, con vista previa'],
              [Share2, 'Un link propio para compartir'],
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
          <Sparkles count={8} seed={4} />
          <h2>Crear cuenta</h2>
          <p className="muted">Es gratis y no necesitás tarjeta.</p>
          <form onSubmit={onSubmit} noValidate>
            {form.formError && <Alert>{form.formError}</Alert>}
            <div className="form-grid">
              <TextInput label="Nombre" icon={UserRound} autoComplete="given-name" maxLength={80} {...form.bind('firstName')} />
              <TextInput label="Apellido" autoComplete="family-name" maxLength={80} {...form.bind('lastName')} />
            </div>
            <TextInput
              label="Nombre de usuario"
              icon={AtSign}
              autoComplete="username"
              maxLength={30}
              placeholder="tu-nombre"
              {...usernameField}
              onChange={(e) => {
                setUsernameTouched(true);
                setField('username', e.target.value.toLowerCase().replace(/\s+/g, '-'));
              }}
              hint={
                <span className="url-preview">
                  <Link2 size={13} /> {window.location.host}/p/<strong>{values.username || 'tu-nombre'}</strong>
                </span>
              }
            />
            <TextInput label="Email" type="email" icon={Mail} autoComplete="email" placeholder="vos@ejemplo.com" {...form.bind('email')} />
            <div style={{ position: 'relative' }}>
              <TextInput
                label="Contraseña"
                type={showPass ? 'text' : 'password'}
                icon={Lock}
                autoComplete="new-password"
                hint="Mínimo 8 caracteres, con letras y números"
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
              Crear mi portfolio
            </Button>
          </form>
          <p className="auth-switch">
            ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
          </p>
        </div>
      </section>
    </div>
  );
}
