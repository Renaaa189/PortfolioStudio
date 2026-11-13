import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Calendar, ExternalLink, FolderKanban, Pencil, Plus, Search, SlidersHorizontal, Star, Trash2, X } from 'lucide-react';
import { projectsApi } from '../../api/services.js';
import { useAsync } from '../../hooks/useAsync.js';
import { useDebounce } from '../../hooks/useDebounce.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Button, IconButton } from '../../components/ui/Button.jsx';
import { Select, TextInput, Toggle } from '../../components/ui/Field.jsx';
import { GlowCard } from '../../components/ui/GlowCard.jsx';
import { ConfirmDialog } from '../../components/ui/Modal.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';
import { EmptyState, ErrorState, Skeleton } from '../../components/ui/States.jsx';
import { StatusBadge } from '../../components/ui/Misc.jsx';
import { GithubIcon } from '../../components/ui/BrandIcons.jsx';
import { ProjectCover } from '../../components/ui/Media.jsx';
import { PROJECT_STATUS } from '../../utils/constants.js';
import { formatMonthYear } from '../../utils/format.js';
import { ProjectFormModal } from './ProjectFormModal.jsx';

const PAGE_SIZE = 9;
const FILTER_KEYS = ['technology', 'year', 'status', 'category', 'featured'];

function ProjectCard({ project, index, onEdit, onDelete, onToggleFeatured }) {
  const extra = project.technologies.length - 4;
  return (
    <GlowCard className="pcard" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="pcard__cover">
        <ProjectCover project={project} />
        <div className="pcard__badges">
          <StatusBadge status={project.status} />
          {project.featured && (
            <span className="badge badge--featured">
              <Star size={12} fill="currentColor" /> Destacado
            </span>
          )}
        </div>
      </div>
      <div className="pcard__body">
        <div className="pcard__meta">
          <span>{project.category || 'Sin categoría'}</span>
          <span style={{ display: 'inline-flex', gap: 5, alignItems: 'center' }}>
            <Calendar size={13} /> {formatMonthYear(project.date)}
          </span>
        </div>
        <h3 className="pcard__title">{project.name}</h3>
        <p className="pcard__desc">{project.description}</p>
        <div className="pcard__techs">
          {project.technologies.slice(0, 4).map((t) => (
            <span key={t} className="chip chip--tech">
              {t}
            </span>
          ))}
          {extra > 0 && <span className="chip">+{extra}</span>}
        </div>
        <div className="pcard__foot">
          <div className="pcard__links">
            {project.githubUrl && (
              <a className="icon-btn icon-btn--sm" href={project.githubUrl} target="_blank" rel="noreferrer" aria-label="Ver en GitHub" title="GitHub">
                <GithubIcon size={15} />
              </a>
            )}
            {project.demoUrl && (
              <a className="icon-btn icon-btn--sm" href={project.demoUrl} target="_blank" rel="noreferrer" aria-label="Ver demo" title="Demo">
                <ExternalLink size={15} />
              </a>
            )}
          </div>
          <IconButton
            size="sm"
            icon={Star}
            label={project.featured ? 'Quitar de destacados' : 'Destacar'}
            variant={project.featured ? 'active' : undefined}
            onClick={() => onToggleFeatured(project)}
          />
          <IconButton size="sm" icon={Pencil} label="Editar" onClick={() => onEdit(project)} />
          <IconButton size="sm" icon={Trash2} label="Eliminar" variant="danger" onClick={() => onDelete(project)} />
        </div>
      </div>
    </GlowCard>
  );
}

export default function ProjectsPage() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('q') || '');
  const [showFilters, setShowFilters] = useState(FILTER_KEYS.some((k) => params.get(k)));
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const q = useDebounce(search.trim(), 350);

  const page = Number(params.get('page')) || 1;
  const filters = Object.fromEntries(FILTER_KEYS.map((k) => [k, params.get(k) || '']));
  const sort = params.get('sort') || 'recent';
  const activeFilters = FILTER_KEYS.filter((k) => filters[k]).length;

  const query = { q, page, limit: PAGE_SIZE, sort, ...filters };
  const queryKey = JSON.stringify(query);
  const list = useAsync(() => projectsApi.list(JSON.parse(queryKey)), [queryKey]);
  const options = useAsync(() => projectsApi.filters(), []);

  const updateParams = (patch, resetPage = true) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v === '' || v === null || v === undefined || v === false) next.delete(k);
      else next.set(k, String(v));
    }
    if (resetPage) next.delete('page');
    setParams(next, { replace: true });
  };

  // Al cambiar la búsqueda, volvemos a la primera página.
  const [lastQ, setLastQ] = useState(q);
  if (q !== lastQ) {
    setLastQ(q);
    if (page !== 1) updateParams({ q: q || null });
  }

  // Modal: ?new=1 o ?edit=<id>
  const editId = params.get('edit');
  const isNew = params.get('new') === '1';
  const editing = useMemo(() => {
    if (!editId) return null;
    return list.data?.data.find((p) => String(p.id) === editId) || null;
  }, [editId, list.data]);
  const editFetch = useAsync(
    () => (editId && !editing ? projectsApi.get(editId) : Promise.resolve(null)),
    [editId, Boolean(editing)],
  );
  const modalProject = editing || editFetch.data;
  const modalOpen = isNew || Boolean(editId && modalProject);

  const closeModal = () => updateParams({ new: null, edit: null }, false);

  const refreshAll = () => {
    list.reload();
    options.reload();
  };

  const handleSubmit = async (values) => {
    if (modalProject) {
      await projectsApi.update(modalProject.id, values);
      toast.success('Proyecto actualizado', values.name);
    } else {
      await projectsApi.create(values);
      toast.success('Proyecto creado', `${values.name} ya forma parte de tu portfolio.`);
    }
    closeModal();
    refreshAll();
  };

  const toggleFeatured = async (project) => {
    const featured = !project.featured;
    list.setData((d) => ({ ...d, data: d.data.map((p) => (p.id === project.id ? { ...p, featured } : p)) }));
    try {
      await projectsApi.patch(project.id, { featured });
      toast.success(featured ? 'Proyecto destacado' : 'Ya no está destacado', project.name);
      if (filters.featured) list.reload();
    } catch (err) {
      list.setData((d) => ({ ...d, data: d.data.map((p) => (p.id === project.id ? { ...p, featured: !featured } : p)) }));
      toast.error('No se pudo actualizar', err.message);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await projectsApi.remove(toDelete.id);
      toast.success('Proyecto eliminado', toDelete.name);
      setToDelete(null);
      if (list.data?.data.length === 1 && page > 1) updateParams({ page: page - 1 }, false);
      else refreshAll();
    } catch (err) {
      toast.error('No se pudo eliminar', err.message);
    } finally {
      setDeleting(false);
    }
  };

  const opts = options.data || { technologies: [], years: [], categories: [] };
  const meta = list.data?.meta;
  const hasQuery = q || activeFilters;

  return (
    <>
      <div className="toolbar">
        <div className="toolbar__search">
          <TextInput
            icon={Search}
            placeholder="Buscar por nombre, tecnología, categoría o estado…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar proyectos"
          />
        </div>
        <Select
          aria-label="Ordenar"
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value === 'recent' ? null : e.target.value })}
          options={[
            { value: 'recent', label: 'Más recientes' },
            { value: 'oldest', label: 'Más antiguos' },
            { value: 'name', label: 'Nombre (A-Z)' },
            { value: 'updated', label: 'Última edición' },
          ]}
        />
        <Button variant={showFilters || activeFilters ? 'secondary' : 'ghost'} icon={SlidersHorizontal} onClick={() => setShowFilters((s) => !s)}>
          Filtros{activeFilters ? ` (${activeFilters})` : ''}
        </Button>
        <Button icon={Plus} onClick={() => updateParams({ new: 1, edit: null }, false)}>
          Nuevo proyecto
        </Button>
      </div>

      {showFilters && (
        <div className="filters-panel card">
          <Select
            label="Tecnología"
            placeholder="Todas"
            options={opts.technologies}
            value={filters.technology}
            onChange={(e) => updateParams({ technology: e.target.value })}
          />
          <Select
            label="Año"
            placeholder="Todos"
            options={opts.years.map(String)}
            value={filters.year}
            onChange={(e) => updateParams({ year: e.target.value })}
          />
          <Select
            label="Estado"
            placeholder="Todos"
            options={Object.entries(PROJECT_STATUS).map(([value, label]) => ({ value, label }))}
            value={filters.status}
            onChange={(e) => updateParams({ status: e.target.value })}
          />
          <Select
            label="Categoría"
            placeholder="Todas"
            options={opts.categories}
            value={filters.category}
            onChange={(e) => updateParams({ category: e.target.value })}
          />
          <div className="filters-panel__foot">
            <Toggle
              label="Solo destacados"
              checked={filters.featured === 'true'}
              onChange={(e) => updateParams({ featured: e.target.checked ? 'true' : null })}
            />
            {activeFilters > 0 && (
              <Button size="sm" variant="ghost" icon={X} onClick={() => updateParams(Object.fromEntries(FILTER_KEYS.map((k) => [k, null])))}>
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>
      )}

      {meta && !list.error && (
        <p className="result-count" style={{ marginBottom: 16 }}>
          <strong>{meta.total}</strong> {meta.total === 1 ? 'proyecto' : 'proyectos'}
          {hasQuery ? ' encontrados' : ''}
        </p>
      )}

      {list.error ? (
        <ErrorState error={list.error} onRetry={list.reload} />
      ) : !list.data ? (
        <div className="cards-grid">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} height={380} radius={24} />
          ))}
        </div>
      ) : list.data.data.length === 0 ? (
        <div className="card">
          {hasQuery ? (
            <EmptyState
              icon={Search}
              title="Sin resultados"
              text="No encontramos proyectos con esa búsqueda o filtros. Probá con otros términos."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSearch('');
                    updateParams(Object.fromEntries([...FILTER_KEYS, 'q'].map((k) => [k, null])));
                  }}
                >
                  Limpiar búsqueda
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={FolderKanban}
              title="Todavía no hay proyectos"
              text="Sumá tu primer proyecto y empezá a armar un portfolio que llame la atención."
              action={
                <Button icon={Plus} onClick={() => updateParams({ new: 1 }, false)}>
                  Crear el primero
                </Button>
              }
            />
          )}
        </div>
      ) : (
        <div className="cards-grid" style={{ opacity: list.loading ? 0.6 : 1, transition: 'opacity .2s' }}>
          {list.data.data.map((p, i) => (
            <ProjectCard
              key={p.id}
              project={p}
              index={i}
              onEdit={(proj) => updateParams({ edit: proj.id, new: null }, false)}
              onDelete={setToDelete}
              onToggleFeatured={toggleFeatured}
            />
          ))}
        </div>
      )}

      {meta && (
        <Pagination page={meta.page} totalPages={meta.totalPages} total={meta.total} onChange={(p) => {
          updateParams({ page: p }, false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }} />
      )}

      <ProjectFormModal
        open={modalOpen}
        project={isNew ? null : modalProject}
        onClose={closeModal}
        onSubmit={handleSubmit}
        techSuggestions={opts.technologies}
        categorySuggestions={opts.categories}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="¿Eliminar proyecto?"
        message={toDelete ? `"${toDelete.name}" se borrará de forma permanente.` : ''}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={deleting}
      />
    </>
  );
}
