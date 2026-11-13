import { useEffect } from 'react';
import { Save } from 'lucide-react';
import { Modal } from '../../components/ui/Modal.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Select, TextArea, TextInput, Toggle } from '../../components/ui/Field.jsx';
import { TagInput } from '../../components/ui/TagInput.jsx';
import { FileUpload } from '../../components/ui/FileUpload.jsx';
import { Alert } from '../../components/ui/States.jsx';
import { useForm } from '../../hooks/useForm.js';
import { validateProject, todayISO } from '../../utils/validation.js';
import { PROJECT_CATEGORIES, PROJECT_STATUS } from '../../utils/constants.js';

const EMPTY = {
  name: '',
  description: '',
  category: '',
  technologies: [],
  image: '',
  githubUrl: '',
  demoUrl: '',
  date: todayISO(),
  status: 'en_progreso',
  featured: false,
};

const toForm = (p) => (p ? { ...EMPTY, ...Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v ?? EMPTY[k] ?? ''])) } : EMPTY);

export function ProjectFormModal({ open, project, onClose, onSubmit, techSuggestions = [], categorySuggestions = [] }) {
  const form = useForm(toForm(project), validateProject);
  const { setValues, setErrors } = form;

  useEffect(() => {
    if (open) {
      setValues(toForm(project));
      setErrors({});
    }
  }, [open, project, setValues, setErrors]);

  const categories = [...new Set([...PROJECT_CATEGORIES, ...categorySuggestions])];

  return (
    <Modal
      open={open}
      onClose={form.submitting ? undefined : onClose}
      title={project ? 'Editar proyecto' : 'Nuevo proyecto'}
      subtitle={project ? 'Los cambios se publican al guardar.' : 'Contá qué hiciste, con qué y cuándo.'}
    >
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="form-grid">
          {form.formError && (
            <div className="span-2">
              <Alert>{form.formError}</Alert>
            </div>
          )}
          <TextInput label="Nombre" required maxLength={120} placeholder="Ej: Nebula Commerce" {...form.bind('name')} />
          <TextInput label="Categoría" list="project-categories" maxLength={60} placeholder="Frontend, Backend…" {...form.bind('category')} />
          <datalist id="project-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>

          <TextArea
            className="span-2"
            label="Descripción"
            required
            maxLength={2000}
            rows={4}
            placeholder="¿Qué problema resuelve? ¿Qué parte hiciste vos?"
            {...form.bind('description')}
          />

          <div className="span-2">
            <TagInput
              label="Tecnologías"
              required
              hint="Escribí y presioná Enter o coma para agregar"
              placeholder="React, Node.js, MySQL…"
              suggestions={techSuggestions}
              value={form.values.technologies}
              onChange={(v) => form.setField('technologies', v)}
              error={form.errors.technologies}
            />
          </div>

          <TextInput label="Fecha" required type="date" max={todayISO()} {...form.bind('date')} />
          <Select
            label="Estado"
            required
            options={Object.entries(PROJECT_STATUS).map(([value, label]) => ({ value, label }))}
            {...form.bind('status')}
          />

          <div className="span-2">
            <FileUpload
              label="Imagen de portada"
              value={form.values.image}
              onChange={(v) => form.setField('image', v)}
              error={form.errors.image}
            />
          </div>

          <TextInput label="Repositorio en GitHub" type="url" placeholder="https://github.com/…" {...form.bind('githubUrl')} />
          <TextInput label="Demo en vivo" type="url" placeholder="https://…" {...form.bind('demoUrl')} />

          <div className="span-2">
            <Toggle
              label="Destacar en el portfolio"
              checked={form.values.featured}
              onChange={(e) => form.setField('featured', e.target.checked)}
            />
          </div>
        </div>

        <div className="form-actions">
          <Button variant="secondary" onClick={onClose} disabled={form.submitting}>
            Cancelar
          </Button>
          <Button type="submit" icon={Save} loading={form.submitting}>
            {project ? 'Guardar cambios' : 'Crear proyecto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
