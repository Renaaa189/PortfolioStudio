import { useRef, useState } from 'react';
import { FileText, ImagePlus, Link2, Trash2, Upload } from 'lucide-react';
import { uploadsApi } from '../../api/services.js';
import { Field } from './Field.jsx';
import { Button } from './Button.jsx';

const KINDS = {
  image: { accept: 'image/jpeg,image/png,image/webp,image/gif', max: 5, mimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] },
  pdf: { accept: 'application/pdf', max: 10, mimes: ['application/pdf'] },
};

/**
 * Sube un archivo a /api/uploads o permite pegar una URL.
 * `value` es la URL resultante (http(s) o /uploads/...).
 */
export function FileUpload({ label, hint, error, value, onChange, kind = 'image', round }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState('');
  const [drag, setDrag] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const cfg = KINDS[kind];

  const handleFile = async (file) => {
    if (!file) return;
    setLocalError('');
    if (!cfg.mimes.includes(file.type)) {
      setLocalError(kind === 'pdf' ? 'Solo se aceptan archivos PDF' : 'Usá una imagen JPG, PNG, WEBP o GIF');
      return;
    }
    if (file.size > cfg.max * 1024 * 1024) {
      setLocalError(`El archivo supera los ${cfg.max} MB`);
      return;
    }
    setBusy(true);
    try {
      const { url } = await uploadsApi.upload(kind, file);
      onChange(url);
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const Icon = kind === 'pdf' ? FileText : ImagePlus;

  return (
    <Field label={label} hint={hint || `${kind === 'pdf' ? 'PDF' : 'JPG, PNG, WEBP o GIF'} · máx. ${cfg.max} MB`} error={localError || error}>
      {(a11y) => (
        <div
          className={`upload ${drag ? 'upload--drag' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDrag(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
        >
          <div className={`upload__preview ${round ? 'upload__preview--round' : ''}`}>
            {value && kind === 'image' ? <img src={value} alt="Vista previa" /> : <Icon size={26} />}
          </div>
          <div className="upload__body">
            {urlMode ? (
              <input
                {...a11y}
                className="input"
                placeholder="https://…"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
              />
            ) : (
              <span className="upload__name">
                {value ? (
                  kind === 'pdf' ? (
                    <a href={value} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
                      Ver archivo actual
                    </a>
                  ) : (
                    'Imagen cargada'
                  )
                ) : (
                  'Arrastrá un archivo o elegilo desde tu equipo'
                )}
              </span>
            )}
            <div className="upload__actions">
              <input ref={inputRef} type="file" accept={cfg.accept} hidden onChange={(e) => handleFile(e.target.files?.[0])} />
              <Button size="sm" variant="secondary" icon={Upload} loading={busy} onClick={() => inputRef.current?.click()}>
                {value ? 'Reemplazar' : 'Subir'}
              </Button>
              <Button size="sm" variant="ghost" icon={Link2} onClick={() => setUrlMode((m) => !m)}>
                {urlMode ? 'Listo' : 'Usar URL'}
              </Button>
              {value && (
                <Button size="sm" variant="ghost" icon={Trash2} onClick={() => onChange('')}>
                  Quitar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </Field>
  );
}
