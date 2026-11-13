import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, LayoutTemplate, Monitor, Palette, RotateCcw, Save, Smartphone, Tablet, Rows3 } from 'lucide-react';
import { profileApi } from '../../api/services.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Thumb } from '../../components/design/Thumb.jsx';
import {
  BACKGROUNDS, DEFAULT_DESIGN, FONTS, LAYOUTS, PALETTES, SECTION_LABELS, withDefaults,
} from '../../utils/design.js';

const TABS = [
  ['estilo', 'Estilo', Palette],
  ['plantillas', 'Plantillas', LayoutTemplate],
  ['estructura', 'Estructura', Rows3],
];

const DEVICES = [
  ['desktop', Monitor, '100%'],
  ['tablet', Tablet, '820px'],
  ['mobile', Smartphone, '390px'],
];

const SECTION_IDS = {
  hero: 'inicio',
  technologies: 'tecnologias',
  featured: 'destacados',
  projects: 'proyectos',
  skills: 'habilidades',
  certificates: 'certificados',
  contact: 'contacto',
};

// Carga todas las tipografías para poder mostrarlas en las tarjetas.
function useAllFonts() {
  useEffect(() => {
    const id = 'ps-all-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${Object.values(FONTS)
      .flatMap((f) => f.families)
      .map((f) => `family=${f}`)
      .join('&')}&display=swap`;
    document.head.appendChild(link);
  }, []);
}

function OptionCard({ selected, onClick, children, label }) {
  return (
    <button type="button" className={`opt ${selected ? 'opt--on' : ''}`} onClick={onClick} aria-pressed={selected} aria-label={label}>
      {children}
    </button>
  );
}

export default function DesignPage() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  useAllFonts();

  const saved = useMemo(() => withDefaults(user?.design), [user?.design]);
  const [design, setDesign] = useState(saved);
  const [tab, setTab] = useState('estilo');
  const [section, setSection] = useState('hero');
  const [device, setDevice] = useState('desktop');
  const [saving, setSaving] = useState(false);
  const iframeRef = useRef(null);
  const readyRef = useRef(false);

  const dirty = JSON.stringify(design) !== JSON.stringify(saved);

  const post = useCallback((msg) => {
    if (readyRef.current) iframeRef.current?.contentWindow?.postMessage(msg, window.location.origin);
  }, []);

  // La vista previa avisa cuando está lista; ahí le mandamos el diseño actual.
  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== window.location.origin || e.data?.type !== 'ps-preview-ready') return;
      readyRef.current = true;
      post({ type: 'ps-design', design });
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [design, post]);

  useEffect(() => {
    post({ type: 'ps-design', design });
  }, [design, post]);

  // Avisar si se quiere cerrar la pestaña con cambios sin guardar.
  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (e) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  const update = (patch) => setDesign((d) => ({ ...d, ...patch }));
  const setLayout = (key, value) => {
    setDesign((d) => ({ ...d, layouts: { ...d.layouts, [key]: value } }));
    post({ type: 'ps-scroll', id: SECTION_IDS[key] });
  };
  const move = (index, dir) => {
    const order = [...design.order];
    const j = index + dir;
    if (j < 0 || j >= order.length) return;
    [order[index], order[j]] = [order[j], order[index]];
    update({ order });
  };
  const toggleHidden = (key) =>
    update({ hidden: design.hidden.includes(key) ? design.hidden.filter((k) => k !== key) : [...design.hidden, key] });

  const save = async () => {
    setSaving(true);
    try {
      const updated = await profileApi.updateDesign(design);
      setUser(updated);
      toast.success('Diseño guardado', user?.isPublished ? 'Tu portfolio público ya muestra los cambios.' : 'Se va a ver así cuando publiques.');
    } catch (err) {
      toast.error('No se pudo guardar', err.message);
    } finally {
      setSaving(false);
    }
  };

  const [c1, c2, c3] = PALETTES[design.palette].colors;

  return (
    <div className="design" style={{ '--c1': c1, '--c2': c2, '--c3': c3 }}>
      <div className="design__panel card">
        <div className="design__tabs" role="tablist">
          {TABS.map(([key, label, Icon]) => (
            <button key={key} role="tab" aria-selected={tab === key} className="design__tab" onClick={() => setTab(key)}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>

        <div className="design__scroll">
          {tab === 'estilo' && (
            <>
              <h3 className="design__title">Paleta de colores</h3>
              <div className="opt-grid opt-grid--4">
                {Object.entries(PALETTES).map(([key, p]) => (
                  <OptionCard key={key} selected={design.palette === key} onClick={() => update({ palette: key })} label={`Paleta ${p.label}`}>
                    <span className="swatch" style={{ background: `linear-gradient(135deg, ${p.colors.join(', ')})` }}>
                      {p.colors.map((c) => (
                        <i key={c} style={{ background: c }} />
                      ))}
                    </span>
                    <span className="opt__label">{p.label}</span>
                  </OptionCard>
                ))}
              </div>

              <h3 className="design__title">Fondo</h3>
              <div className="opt-grid opt-grid--3">
                {Object.entries(BACKGROUNDS).map(([key, b]) => (
                  <OptionCard key={key} selected={design.background === key} onClick={() => update({ background: key })} label={`Fondo ${b.label}`}>
                    <span className={`bg-preview bg-preview--${key}`} />
                    <span className="opt__label">{b.label}</span>
                    <span className="opt__desc">{b.description}</span>
                  </OptionCard>
                ))}
              </div>

              <h3 className="design__title">Tipografía</h3>
              <div className="opt-grid opt-grid--3">
                {Object.entries(FONTS).map(([key, f]) => (
                  <OptionCard key={key} selected={design.font === key} onClick={() => update({ font: key })} label={`Tipografía ${f.label}`}>
                    <span className="font-preview" style={{ fontFamily: `'${f.display}'` }}>
                      Aa
                    </span>
                    <span className="opt__label">{f.label}</span>
                    <span className="opt__desc">
                      {f.display} + {f.body}
                    </span>
                  </OptionCard>
                ))}
              </div>
            </>
          )}

          {tab === 'plantillas' && (
            <>
              <div className="chip-row" role="group" aria-label="Sección">
                {Object.keys(LAYOUTS).map((key) => (
                  <button key={key} className="chip chip-filter" aria-pressed={section === key} onClick={() => {
                    setSection(key);
                    post({ type: 'ps-scroll', id: SECTION_IDS[key] });
                  }}>
                    {SECTION_LABELS[key]}
                  </button>
                ))}
              </div>
              <h3 className="design__title">Plantilla de {SECTION_LABELS[section].toLowerCase()}</h3>
              <div className="opt-grid opt-grid--2">
                {LAYOUTS[section].map(([key, label, desc]) => (
                  <OptionCard key={key} selected={design.layouts[section] === key} onClick={() => setLayout(section, key)} label={`Plantilla ${label}`}>
                    <Thumb section={section} layout={key} />
                    <span className="opt__label">{label}</span>
                    <span className="opt__desc">{desc}</span>
                  </OptionCard>
                ))}
              </div>
              {section !== 'hero' && design.hidden.includes(section) && (
                <p className="design__note">
                  Esta sección está oculta. Activala en la pestaña <strong>Estructura</strong>.
                </p>
              )}
            </>
          )}

          {tab === 'estructura' && (
            <>
              <h3 className="design__title">Orden y visibilidad</h3>
              <p className="design__note" style={{ marginTop: 0 }}>
                La portada siempre va primero. Las secciones sin contenido (por ejemplo, sin certificados cargados) no se muestran.
              </p>
              <ol className="structure">
                <li className="structure__item structure__item--fixed">
                  <span className="structure__num">1</span>
                  <span className="structure__name">{SECTION_LABELS.hero}</span>
                  <span className="structure__fixed">Fija</span>
                </li>
                {design.order.map((key, i) => {
                  const hidden = design.hidden.includes(key);
                  return (
                    <li key={key} className={`structure__item ${hidden ? 'structure__item--hidden' : ''}`}>
                      <span className="structure__num">{i + 2}</span>
                      <span className="structure__name">{SECTION_LABELS[key]}</span>
                      <button className="icon-btn icon-btn--sm" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Subir ${SECTION_LABELS[key]}`}>
                        <ArrowUp size={14} />
                      </button>
                      <button
                        className="icon-btn icon-btn--sm"
                        onClick={() => move(i, 1)}
                        disabled={i === design.order.length - 1}
                        aria-label={`Bajar ${SECTION_LABELS[key]}`}
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        className={`icon-btn icon-btn--sm ${hidden ? '' : 'icon-btn--on'}`}
                        onClick={() => toggleHidden(key)}
                        aria-label={hidden ? `Mostrar ${SECTION_LABELS[key]}` : `Ocultar ${SECTION_LABELS[key]}`}
                        title={hidden ? 'Mostrar' : 'Ocultar'}
                      >
                        {hidden ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </>
          )}
        </div>

        <div className={`design__savebar ${dirty ? 'design__savebar--dirty' : ''}`}>
          <span className="design__status">{dirty ? 'Sin guardar' : 'Guardado ✓'}</span>
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={() => setDesign(DEFAULT_DESIGN)} title="Volver al diseño original">
            Original
          </Button>
          {dirty && (
            <Button variant="secondary" size="sm" onClick={() => setDesign(saved)}>
              Descartar
            </Button>
          )}
          <Button size="sm" icon={Save} loading={saving} disabled={!dirty} onClick={save}>
            Guardar
          </Button>
        </div>
      </div>

      <div className="design__preview">
        <div className="design__toolbar">
          <span className="design__live">
            <span className="publish-pill__dot" /> Vista previa en vivo
          </span>
          <div className="design__devices" role="group" aria-label="Tamaño de pantalla">
            {DEVICES.map(([key, Icon]) => (
              <button key={key} className={`icon-btn icon-btn--sm ${device === key ? 'icon-btn--on' : ''}`} onClick={() => setDevice(key)} aria-label={key} aria-pressed={device === key}>
                <Icon size={15} />
              </button>
            ))}
          </div>
        </div>
        <div className="design__frame-wrap">
          <iframe
            ref={iframeRef}
            className="design__frame"
            style={{ width: DEVICES.find(([k]) => k === device)[2] }}
            src="/admin/preview?embed=1"
            title="Vista previa del portfolio"
          />
        </div>
      </div>
    </div>
  );
}
