import { useEffect, useMemo, useState } from 'react';
import { Award, Calendar, FileText, Pencil, Plus, Save, Search, Trash2 } from 'lucide-react';
import { certificatesApi } from '../../api/services.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useForm } from '../../hooks/useForm.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Button, IconButton } from '../../components/ui/Button.jsx';
import { TextArea, TextInput } from '../../components/ui/Field.jsx';
import { FileUpload } from '../../components/ui/FileUpload.jsx';
import { GlowCard } from '../../components/ui/GlowCard.jsx';
import { ConfirmDialog, Modal } from '../../components/ui/Modal.jsx';
import { Alert, EmptyState, ErrorState, Skeleton } from '../../components/ui/States.jsx';
import { formatDate } from '../../utils/format.js';
import { todayISO, validateCertificate } from '../../utils/validation.js';

const EMPTY = { name: '', institution: '', date: '', description: '', image: '', pdfFile: '' };

function CertificateFormModal({ open, certificate, onClose, onSubmit }) {
  const form = useForm(EMPTY, validateCertificate);
  const { setValues, setErrors } = form;

  useEffect(() => {
    if (open) {
      setValues(
        certificate
          ? Object.fromEntries(Object.keys(EMPTY).map((k) => [k, certificate[k] ?? '']))
          : EMPTY,
      );
      setErrors({});
    }
  }, [open, certificate, setValues, setErrors]);

  return (
    <Modal open={open} onClose={onClose} title={certificate ? 'Editar certificado' : 'Nuevo certificado'}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="form-grid">
          {form.formError && (
            <div className="span-2">
              <Alert>{form.formError}</Alert>
            </div>
          )}
          <TextInput className="span-2" label="Nombre" required maxLength={150} placeholder="Ej: Desarrollo Full Stack" {...form.bind('name')} />
          <TextInput label="Institución" required maxLength={150} placeholder="Ej: Generación T" {...form.bind('institution')} />
          <TextInput label="Fecha de emisión" required type="date" max={todayISO()} {...form.bind('date')} />
          <TextArea className="span-2" label="Descripción" maxLength={2000} rows={3} placeholder="¿Qué aprendiste?" {...form.bind('description')} />
          <div className="span-2">
            <FileUpload label="Imagen" value={form.values.image} onChange={(v) => form.setField('image', v)} error={form.errors.image} />
          </div>
          <div className="span-2">
            <FileUpload kind="pdf" label="Certificado en PDF" value={form.values.pdfFile} onChange={(v) => form.setField('pdfFile', v)} error={form.errors.pdfFile} />
          </div>
        </div>
        <div className="form-actions">
          <Button variant="secondary" onClick={onClose} disabled={form.submitting}>
            Cancelar
          </Button>
          <Button type="submit" icon={Save} loading={form.submitting}>
            {certificate ? 'Guardar cambios' : 'Agregar certificado'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function CertificatesPage() {
  const toast = useToast();
  const { data, error, reload } = useAsync(() => certificatesApi.list(), []);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, certificate: null });
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase();
    return (data || []).filter((c) => !t || c.name.toLowerCase().includes(t) || c.institution.toLowerCase().includes(t));
  }, [data, search]);

  const handleSubmit = async (values) => {
    if (modal.certificate) {
      await certificatesApi.update(modal.certificate.id, values);
      toast.success('Certificado actualizado', values.name);
    } else {
      await certificatesApi.create(values);
      toast.success('Certificado agregado', values.name);
    }
    setModal({ open: false, certificate: null });
    reload();
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await certificatesApi.remove(toDelete.id);
      toast.success('Certificado eliminado', toDelete.name);
      setToDelete(null);
      reload();
    } catch (err) {
      toast.error('No se pudo eliminar', err.message);
    } finally {
      setDeleting(false);
    }
  };

  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <>
      <div className="toolbar">
        <div className="toolbar__search">
          <TextInput icon={Search} placeholder="Buscar por nombre o institución…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Buscar certificado" />
        </div>
        <Button icon={Plus} onClick={() => setModal({ open: true, certificate: null })}>
          Nuevo certificado
        </Button>
      </div>

      {!data ? (
        <div className="cards-grid">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={160} radius={24} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          {data.length ? (
            <EmptyState icon={Search} title="Sin resultados" text="Ningún certificado coincide con la búsqueda." />
          ) : (
            <EmptyState
              icon={Award}
              title="Mostrá lo que aprendiste"
              text="Cargá tus cursos y certificaciones con imagen y PDF."
              action={
                <Button icon={Plus} onClick={() => setModal({ open: true, certificate: null })}>
                  Agregar certificado
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <div className="cards-grid">
          {filtered.map((c, i) => (
            <GlowCard key={c.id} className="cert-card" style={{ animationDelay: `${i * 50}ms` }}>
              <div className="cert-card__img">{c.image ? <img src={c.image} alt="" loading="lazy" /> : <Award size={34} />}</div>
              <div className="cert-card__body">
                <h3 className="cert-card__title">{c.name}</h3>
                <span className="cert-card__inst">{c.institution}</span>
                {c.description && <p className="cert-card__desc">{c.description}</p>}
                <div className="cert-card__foot">
                  <span className="cert-card__date">
                    <Calendar size={13} /> {formatDate(c.date)}
                  </span>
                  {c.pdfFile && (
                    <a className="icon-btn icon-btn--sm" href={c.pdfFile} target="_blank" rel="noreferrer" aria-label="Ver PDF" title="Ver PDF">
                      <FileText size={15} />
                    </a>
                  )}
                  <IconButton size="sm" icon={Pencil} label="Editar" onClick={() => setModal({ open: true, certificate: c })} />
                  <IconButton size="sm" icon={Trash2} label="Eliminar" variant="danger" onClick={() => setToDelete(c)} />
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      )}

      <CertificateFormModal
        open={modal.open}
        certificate={modal.certificate}
        onClose={() => setModal({ open: false, certificate: null })}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="¿Eliminar certificado?"
        message={toDelete ? `"${toDelete.name}" se borrará de forma permanente.` : ''}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </>
  );
}
