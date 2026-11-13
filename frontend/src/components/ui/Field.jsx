import { useId } from 'react';
import { CircleAlert } from 'lucide-react';

/** Envoltorio de campo: etiqueta, ayuda, contador y mensaje de error accesible. */
export function Field({ label, required, hint, error, counter, className = '', children, id: idProp }) {
  const autoId = useId();
  const id = idProp || autoId;
  const errId = `${id}-error`;
  return (
    <div className={`field ${error ? 'field--error' : ''} ${className}`}>
      {label && (
        <label className="field__label" htmlFor={id}>
          <span>
            {label}
            {required && <span className="field__req">*</span>}
          </span>
          {counter && <span className="field__counter">{counter}</span>}
        </label>
      )}
      {children({ id, 'aria-invalid': Boolean(error) || undefined, 'aria-describedby': error ? errId : undefined })}
      {error ? (
        <span className="field__error" id={errId} role="alert">
          <CircleAlert size={14} /> {error}
        </span>
      ) : (
        hint && <span className="field__hint">{hint}</span>
      )}
    </div>
  );
}

export function TextInput({ label, required, hint, error, className, icon: Icon, maxLength, value, ...props }) {
  const counter = maxLength && value ? `${String(value).length}/${maxLength}` : undefined;
  return (
    <Field label={label} required={required} hint={hint} error={error} className={className} counter={counter}>
      {(a11y) =>
        Icon ? (
          <div className="input-icon">
            <Icon size={17} />
            <input className="input" value={value} maxLength={maxLength} {...a11y} {...props} />
          </div>
        ) : (
          <input className="input" value={value} maxLength={maxLength} {...a11y} {...props} />
        )
      }
    </Field>
  );
}

export function TextArea({ label, required, hint, error, className, maxLength, value, ...props }) {
  const counter = maxLength ? `${String(value || '').length}/${maxLength}` : undefined;
  return (
    <Field label={label} required={required} hint={hint} error={error} className={className} counter={counter}>
      {(a11y) => <textarea className="textarea" value={value} maxLength={maxLength} {...a11y} {...props} />}
    </Field>
  );
}

export function Select({ label, required, hint, error, className, options, placeholder, ...props }) {
  return (
    <Field label={label} required={required} hint={hint} error={error} className={className}>
      {(a11y) => (
        <select className="select" {...a11y} {...props}>
          {placeholder !== undefined && <option value="">{placeholder}</option>}
          {options.map((o) => {
            const { value, label: text } = typeof o === 'string' ? { value: o, label: o } : o;
            return (
              <option key={value} value={value}>
                {text}
              </option>
            );
          })}
        </select>
      )}
    </Field>
  );
}

export function Toggle({ label, checked, onChange, ...props }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={Boolean(checked)} onChange={onChange} {...props} />
      <span className="toggle__track">
        <span className="toggle__thumb" />
      </span>
      {label}
    </label>
  );
}
