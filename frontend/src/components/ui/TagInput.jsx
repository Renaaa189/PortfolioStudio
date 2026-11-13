import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Field } from './Field.jsx';

/** Input de etiquetas: Enter o coma agregan, Backspace borra la última. */
export function TagInput({ label, required, hint, error, value = [], onChange, suggestions = [], placeholder, max = 20 }) {
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const filtered = useMemo(() => {
    const q = text.trim().toLowerCase();
    const taken = new Set(value.map((v) => v.toLowerCase()));
    return suggestions.filter((s) => !taken.has(s.toLowerCase()) && (!q || s.toLowerCase().includes(q))).slice(0, 8);
  }, [text, value, suggestions]);

  const add = (raw) => {
    const parts = String(raw).split(',').map((s) => s.trim().replace(/\s+/g, ' ')).filter(Boolean);
    if (!parts.length) return;
    const next = [...value];
    for (const p of parts) {
      if (next.length >= max) break;
      if (!next.some((v) => v.toLowerCase() === p.toLowerCase())) next.push(p.slice(0, 60));
    }
    onChange(next);
    setText('');
    setActive(0);
  };

  const remove = (tag) => onChange(value.filter((t) => t !== tag));

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (open && filtered[active] && !text.includes(',')) add(filtered[active]);
      else add(text);
    } else if (e.key === 'Backspace' && !text && value.length) {
      remove(value[value.length - 1]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <Field label={label} required={required} hint={hint} error={error} counter={`${value.length}/${max}`}>
      {(a11y) => (
        <div className="tag-input">
          {value.map((tag) => (
            <span key={tag} className="chip chip--tech">
              {tag}
              <button type="button" onClick={() => remove(tag)} aria-label={`Quitar ${tag}`}>
                <X size={13} />
              </button>
            </span>
          ))}
          <input
            {...a11y}
            className="tag-input__input"
            value={text}
            placeholder={value.length ? '' : placeholder}
            onChange={(e) => {
              setText(e.target.value);
              setOpen(true);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              setTimeout(() => setOpen(false), 120);
              if (text.trim()) add(text);
            }}
            role="combobox"
            aria-expanded={open && filtered.length > 0}
            aria-autocomplete="list"
          />
          {open && filtered.length > 0 && (
            <div className="tag-input__suggestions" role="listbox">
              {filtered.map((s, i) => (
                <button
                  type="button"
                  key={s}
                  role="option"
                  aria-selected={i === active}
                  className="tag-input__suggestion"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    add(s);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </Field>
  );
}
