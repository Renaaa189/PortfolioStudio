const monthYear = new Intl.DateTimeFormat('es', { month: 'short', year: 'numeric' });
const fullDate = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' });

/** Parsea 'YYYY-MM-DD' como fecha local (sin correrse un día por zona horaria). */
function parseISODate(value) {
  if (!value) return null;
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number);
  if (!y) return null;
  return new Date(y, (m || 1) - 1, d || 1);
}

export const formatMonthYear = (v) => {
  const d = parseISODate(v);
  return d ? monthYear.format(d).replace('.', '') : '';
};

export const formatDate = (v) => {
  const d = parseISODate(v);
  return d ? fullDate.format(d).replace('.', '') : '';
};

export const relativeTime = (v) => {
  const date = new Date(String(v).replace(' ', 'T'));
  const diff = (date.getTime() - Date.now()) / 1000;
  if (Number.isNaN(diff)) return '';
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
  }
  return 'recién';
};

export const initials = (...parts) =>
  parts
    .filter(Boolean)
    .map((p) => p.trim()[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '✦';

export const fullName = (p) => [p?.firstName, p?.lastName].filter(Boolean).join(' ');

/**
 * Degradado determinístico a partir de un texto (para portadas sin imagen).
 * Usa los colores de la paleta activa (--c1, --c2, --c3), así acompaña el diseño elegido.
 */
export function gradientFor(text = '') {
  let h = 0;
  for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const combos = [
    ['var(--c1)', 'var(--c2)', 'var(--c3)'],
    ['var(--c2)', 'var(--c1)', 'var(--c3)'],
    ['var(--c1)', 'var(--c3)', 'var(--c2)'],
    ['var(--c3)', 'var(--c2)', 'var(--c1)'],
    ['var(--c2)', 'var(--c3)', 'var(--c1)'],
  ];
  const [a, b, c] = combos[h % combos.length];
  const angle = 100 + (h % 120);
  const dark = 55 + (h % 4) * 8;
  return `radial-gradient(circle at ${20 + (h % 60)}% ${10 + (h % 50)}%, color-mix(in srgb, ${c} 70%, transparent) 0%, transparent 45%), linear-gradient(${angle}deg, color-mix(in srgb, ${a} ${dark}%, black), ${b})`;
}

export const isImageUrl = (v) => typeof v === 'string' && (/^https?:\/\//.test(v) || v.startsWith('/uploads/'));
