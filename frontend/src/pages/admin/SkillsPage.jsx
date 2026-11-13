import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Save, Search, Trash2, WandSparkles } from 'lucide-react';
import { skillsApi } from '../../api/services.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useForm } from '../../hooks/useForm.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Button, IconButton } from '../../components/ui/Button.jsx';
import { Field, TextInput } from '../../components/ui/Field.jsx';
import { GlowCard } from '../../components/ui/GlowCard.jsx';
import { ConfirmDialog, Modal } from '../../components/ui/Modal.jsx';
import { Alert, EmptyState, ErrorState, Skeleton } from '../../components/ui/States.jsx';
import { SkillIcon } from '../../components/ui/Media.jsx';
import { SKILL_CATEGORIES, SKILL_LEVELS } from '../../utils/constants.js';
import { validateSkill } from '../../utils/validation.js';

const EMPTY = { name: '', category: '', level: 'intermedio', icon: '' };
const EMOJIS = ['⚛️', '🟨', '🔷', '🎨', '🟩', '🐬', '🐙', '🐳', '✏️', '🧪', '🚀', '☁️', '🔥', '🧠', '💬', '🌎'];

function LevelPicker({ value, onChange, error }) {
  return (
    <Field label="Nivel" required error={error}>
      {() => (
        <div className="level-picker" role="radiogroup" aria-label="Nivel">
          {Object.entries(SKILL_LEVELS).map(([key, { label }], idx) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={value === key}
              className="level-picker__opt"
              onClick={() => onChange(key)}
            >
              <span className="level-picker__dots">
                {[0, 1, 2, 3].map((d) => (
                  <i key={d} className={d <= idx ? 'on' : ''} />
                ))}
              </span>
              {label}
            </button>
          ))}
        </div>
      )}
    </Field>
  );
}

function SkillFormModal({ open, skill, onClose, onSubmit, categories }) {
  const form = useForm(EMPTY, validateSkill);
  const { setValues, setErrors } = form;

  useEffect(() => {
    if (open) {
      setValues(skill ? { name: skill.name, category: skill.category, level: skill.level, icon: skill.icon || '' } : EMPTY);
      setErrors({});
    }
  }, [open, skill, setValues, setErrors]);

  const allCategories = [...new Set([...SKILL_CATEGORIES, ...categories])];

  return (
    <Modal open={open} onClose={onClose} size="sm" title={skill ? 'Editar habilidad' : 'Nueva habilidad'}>
      <form onSubmit={form.handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {form.formError && <Alert>{form.formError}</Alert>}
        <TextInput label="Nombre" required maxLength={80} placeholder="Ej: React" {...form.bind('name')} />
        <TextInput label="Categoría" required list="skill-categories" maxLength={60} placeholder="Frontend, Backend, Diseño…" {...form.bind('category')} />
        <datalist id="skill-categories">
          {allCategories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <LevelPicker value={form.values.level} onChange={(v) => form.setField('level', v)} error={form.errors.level} />
        <div>
          <TextInput label="Ícono" hint="Un emoji o la URL de una imagen (opcional)" maxLength={500} placeholder="⚛️" {...form.bind('icon')} />
          <div className="emoji-row">
            {EMOJIS.map((e) => (
              <button key={e} type="button" onClick={() => form.setField('icon', e)} aria-label={`Usar ${e}`}>
                {e}
              </button>
            ))}
          </div>
        </div>
        <div className="form-actions">
          <Button variant="secondary" onClick={onClose} disabled={form.submitting}>
            Cancelar
          </Button>
          <Button type="submit" icon={Save} loading={form.submitting}>
            {skill ? 'Guardar' : 'Agregar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function SkillsPage() {
  const toast = useToast();
  const { data, error, reload } = useAsync(() => skillsApi.list(), []);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState({ open: false, skill: null });
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const categories = useMemo(() => [...new Set((data || []).map((s) => s.category))], [data]);

  const groups = useMemo(() => {
    const term = search.trim().toLowerCase();
    const map = new Map();
    for (const s of data || []) {
      if (category && s.category !== category) continue;
      if (term && !s.name.toLowerCase().includes(term)) continue;
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category).push(s);
    }
    return [...map.entries()];
  }, [data, category, search]);

  const handleSubmit = async (values) => {
    if (modal.skill) {
      await skillsApi.update(modal.skill.id, values);
      toast.success('Habilidad actualizada', values.name);
    } else {
      await skillsApi.create(values);
      toast.success('Habilidad agregada', values.name);
    }
    setModal({ open: false, skill: null });
    reload();
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await skillsApi.remove(toDelete.id);
      toast.success('Habilidad eliminada', toDelete.name);
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
          <TextInput icon={Search} placeholder="Buscar habilidad…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Buscar habilidad" />
        </div>
        <Button icon={Plus} onClick={() => setModal({ open: true, skill: null })}>
          Nueva habilidad
        </Button>
      </div>

      {categories.length > 1 && (
        <div className="chip-row" role="group" aria-label="Filtrar por categoría">
          <button className="chip chip-filter" aria-pressed={!category} onClick={() => setCategory('')}>
            Todas
          </button>
          {categories.map((c) => (
            <button key={c} className="chip chip-filter" aria-pressed={category === c} onClick={() => setCategory(c === category ? '' : c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      {!data ? (
        <div className="skill-groups">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={260} radius={24} />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="card">
          {data.length ? (
            <EmptyState icon={Search} title="Sin resultados" text="Ninguna habilidad coincide con la búsqueda." />
          ) : (
            <EmptyState
              icon={WandSparkles}
              title="Sumá tus habilidades"
              text="Agrupalas por categoría y mostrá tu nivel en cada una."
              action={
                <Button icon={Plus} onClick={() => setModal({ open: true, skill: null })}>
                  Agregar habilidad
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <div className="skill-groups">
          {groups.map(([cat, skills], gi) => (
            <GlowCard key={cat} className="skill-group" style={{ animationDelay: `${gi * 70}ms` }}>
              <div className="skill-group__head">
                <h3 className="skill-group__title">{cat}</h3>
                <span className="skill-group__count">{skills.length}</span>
              </div>
              {skills.map((s) => (
                <div key={s.id} className="skill-row">
                  <SkillIcon skill={s} />
                  <div className="skill-row__main">
                    <div className="skill-row__name">
                      {s.name}
                      <span className="skill-row__level">{SKILL_LEVELS[s.level]?.label}</span>
                    </div>
                    <div className="level-bar">
                      <div className="level-bar__fill" style={{ width: `${SKILL_LEVELS[s.level]?.value}%` }} />
                    </div>
                  </div>
                  <div className="skill-row__actions">
                    <IconButton size="sm" icon={Pencil} label={`Editar ${s.name}`} onClick={() => setModal({ open: true, skill: s })} />
                    <IconButton size="sm" icon={Trash2} label={`Eliminar ${s.name}`} variant="danger" onClick={() => setToDelete(s)} />
                  </div>
                </div>
              ))}
            </GlowCard>
          ))}
        </div>
      )}

      <SkillFormModal
        open={modal.open}
        skill={modal.skill}
        categories={categories}
        onClose={() => setModal({ open: false, skill: null })}
        onSubmit={handleSubmit}
      />
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="¿Eliminar habilidad?"
        message={toDelete ? `"${toDelete.name}" dejará de mostrarse en tu portfolio.` : ''}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </>
  );
}
