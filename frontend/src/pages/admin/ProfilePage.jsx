import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { AtSign, Eye, Globe, KeyRound, Link2, MapPin, Rocket, Save, UserRound } from 'lucide-react';
import { authApi, profileApi } from '../../api/services.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAsync } from '../../hooks/useAsync.js';
import { useForm } from '../../hooks/useForm.js';
import { Button } from '../../components/ui/Button.jsx';
import { TextArea, TextInput, Toggle } from '../../components/ui/Field.jsx';
import { FileUpload } from '../../components/ui/FileUpload.jsx';
import { Sparkles } from '../../components/ui/Backdrop.jsx';
import { Alert, ErrorState, Loader } from '../../components/ui/States.jsx';
import { Avatar } from '../../components/ui/Misc.jsx';
import { GithubIcon, LinkedinIcon } from '../../components/ui/BrandIcons.jsx';
import { fullName } from '../../utils/format.js';
import { validatePassword, validateProfile } from '../../utils/validation.js';

const FIELDS = ['username', 'firstName', 'lastName', 'photo', 'role', 'bio', 'location', 'email', 'github', 'linkedin', 'website'];
const pick = (p) => Object.fromEntries(FIELDS.map((k) => [k, p?.[k] ?? '']));

function PasswordForm() {
  const toast = useToast();
  const form = useForm({ currentPassword: '', newPassword: '', confirm: '' }, validatePassword);
  const onSubmit = form.handleSubmit(async ({ currentPassword, newPassword }) => {
    await authApi.changePassword(currentPassword, newPassword);
    form.setValues({ currentPassword: '', newPassword: '', confirm: '' });
    toast.success('Contraseña actualizada', 'Usala la próxima vez que inicies sesión.');
  });
  return (
    <form className="card card--pad" onSubmit={onSubmit} noValidate>
      <h3 className="section-title">
        <KeyRound size={18} /> Seguridad
      </h3>
      <div className="form-grid">
        {form.formError && !form.errors.currentPassword && (
          <div className="span-2">
            <Alert>{form.formError}</Alert>
          </div>
        )}
        <TextInput className="span-2" label="Contraseña actual" type="password" autoComplete="current-password" {...form.bind('currentPassword')} />
        <TextInput label="Nueva contraseña" type="password" autoComplete="new-password" hint="Mínimo 8 caracteres, con letras y números" {...form.bind('newPassword')} />
        <TextInput label="Repetir contraseña" type="password" autoComplete="new-password" {...form.bind('confirm')} />
      </div>
      <div className="form-actions">
        <Button type="submit" variant="secondary" loading={form.submitting}>
          Cambiar contraseña
        </Button>
      </div>
    </form>
  );
}

export default function ProfilePage() {
  const toast = useToast();
  const { user, setUser } = useAuth();
  const { data, error, reload } = useAsync(() => profileApi.get(), []);
  const form = useForm(pick(data), validateProfile);
  const [publishing, setPublishing] = useState(false);
  const { setValues } = form;

  useEffect(() => {
    if (data) setValues(pick(data));
  }, [data, setValues]);

  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!data) return <Loader />;

  const v = form.values;

  const onSubmit = form.handleSubmit(async (values) => {
    const updated = await profileApi.update(values);
    setUser(updated);
    toast.success('Perfil guardado', 'Tu información ya está actualizada.');
  });

  const togglePublish = async (published) => {
    setPublishing(true);
    try {
      const updated = await profileApi.setPublished(published);
      setUser(updated);
      toast.success(published ? '¡Portfolio publicado! 🚀' : 'Portfolio despublicado', published ? 'Ya es visible para todo el mundo.' : 'Ahora solo vos podés verlo.');
    } catch (err) {
      toast.error('No se pudo cambiar el estado', err.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="profile-layout">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        <form className="card card--pad" onSubmit={onSubmit} noValidate>
          <h3 className="section-title">
            <UserRound size={18} /> Datos personales
          </h3>
          <div className="form-grid">
            {form.formError && (
              <div className="span-2">
                <Alert>{form.formError}</Alert>
              </div>
            )}
            <div className="span-2">
              <FileUpload label="Foto de perfil" round value={v.photo} onChange={(x) => form.setField('photo', x)} error={form.errors.photo} />
            </div>
            <TextInput
              className="span-2"
              label="Nombre de usuario"
              required
              icon={AtSign}
              maxLength={30}
              {...form.bind('username')}
              onChange={(e) => form.setField('username', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              hint={
                <span className="url-preview">
                  <Link2 size={13} /> Tu link: {window.location.host}/p/<strong>{v.username || 'tu-nombre'}</strong>
                </span>
              }
            />
            <TextInput label="Nombre" required maxLength={80} {...form.bind('firstName')} />
            <TextInput label="Apellido" required maxLength={80} {...form.bind('lastName')} />
            <TextInput label="Cargo" maxLength={120} placeholder="Ej: Desarrolladora Full Stack" {...form.bind('role')} />
            <TextInput label="Ubicación" icon={MapPin} maxLength={120} placeholder="Ciudad, País" {...form.bind('location')} />
            <TextArea className="span-2" label="Biografía" maxLength={3000} rows={5} placeholder="Contá quién sos, qué hacés y qué te apasiona." {...form.bind('bio')} />
            <TextInput
              className="span-2"
              label="Email"
              required
              type="email"
              hint="Es tu email de contacto y también el de acceso a tu cuenta."
              {...form.bind('email')}
            />
            <TextInput label="GitHub" type="url" placeholder="https://github.com/usuario" {...form.bind('github')} />
            <TextInput label="LinkedIn" type="url" placeholder="https://linkedin.com/in/usuario" {...form.bind('linkedin')} />
            <TextInput className="span-2" label="Sitio web" type="url" icon={Globe} placeholder="https://…" {...form.bind('website')} />
          </div>
          <div className="form-actions">
            <Button type="submit" icon={Save} loading={form.submitting}>
              Guardar perfil
            </Button>
          </div>
        </form>

        <PasswordForm />
      </div>

      <aside className="profile-aside">
        <div className="card profile-preview">
          <div className="profile-preview__banner">
            <Sparkles count={10} seed={9} />
          </div>
          <div className="profile-preview__avatar">
            <Avatar src={v.photo} firstName={v.firstName} lastName={v.lastName} size={84} />
          </div>
          <div className="profile-preview__body">
            <strong className="profile-preview__name">{fullName(v) || 'Tu nombre'}</strong>
            <span className="profile-preview__role">{v.role || 'Tu cargo'}</span>
            {v.location && (
              <span className="muted" style={{ fontSize: 13, display: 'inline-flex', gap: 5, alignItems: 'center' }}>
                <MapPin size={13} /> {v.location}
              </span>
            )}
            <p className="profile-preview__bio">{v.bio || 'Tu biografía aparecerá acá.'}</p>
            <div className="profile-preview__socials">
              {v.github && (
                <span className="icon-btn icon-btn--sm">
                  <GithubIcon size={15} />
                </span>
              )}
              {v.linkedin && (
                <span className="icon-btn icon-btn--sm">
                  <LinkedinIcon size={15} />
                </span>
              )}
              {v.website && (
                <span className="icon-btn icon-btn--sm">
                  <Globe size={15} />
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="card publish-card">
          <h3 className="section-title" style={{ marginBottom: 0 }}>
            <Rocket size={18} /> Publicación
          </h3>
          <p>
            {user?.isPublished
              ? `Tu portfolio es público en /p/${user.username}. Cualquiera con el enlace puede verlo.`
              : 'Tu portfolio es un borrador. Revisalo en la vista previa y publicalo cuando quieras.'}
          </p>
          <Toggle
            label={user?.isPublished ? 'Publicado' : 'No publicado'}
            checked={user?.isPublished}
            disabled={publishing}
            onChange={(e) => togglePublish(e.target.checked)}
          />
          <Link to="/admin/preview" className="btn btn--secondary btn--sm">
            <Eye size={15} /> Abrir vista previa
          </Link>
          {user?.isPublished && (
            <a href={`/p/${user.username}`} target="_blank" rel="noreferrer" className="btn btn--ghost btn--sm">
              <Globe size={15} /> Ver portfolio público
            </a>
          )}
        </div>
      </aside>
    </div>
  );
}
