/**
 * Opciones de personalización del portfolio (mismas claves que backend/src/utils/design.js).
 */

export const PALETTES = {
  aurora: { label: 'Aurora', colors: ['#8b5cf6', '#ec4899', '#fb923c'] },
  atardecer: { label: 'Atardecer', colors: ['#f43f5e', '#fb923c', '#facc15'] },
  oceano: { label: 'Océano', colors: ['#3b82f6', '#06b6d4', '#2dd4bf'] },
  bosque: { label: 'Bosque', colors: ['#059669', '#22c55e', '#a3e635'] },
  lavanda: { label: 'Lavanda', colors: ['#a78bfa', '#e879f9', '#f9a8d4'] },
  fuego: { label: 'Fuego', colors: ['#dc2626', '#f97316', '#fbbf24'] },
  neon: { label: 'Neón', colors: ['#d946ef', '#22d3ee', '#a3e635'] },
  grafito: { label: 'Grafito', colors: ['#64748b', '#94a3b8', '#f472b6'] },
};

export const BACKGROUNDS = {
  aurora: { label: 'Aurora', description: 'Manchas de color en movimiento con destellos' },
  destellos: { label: 'Destellos', description: 'Cielo oscuro lleno de estrellas que titilan' },
  degradado: { label: 'Degradado', description: 'Degradado suave y fijo de la paleta' },
  grilla: { label: 'Grilla', description: 'Cuadrícula técnica con un brillo arriba' },
  puntos: { label: 'Puntos', description: 'Patrón de puntos sutil' },
  liso: { label: 'Liso', description: 'Fondo limpio, sin efectos' },
};

export const FONTS = {
  moderna: { label: 'Moderna', display: 'Sora', body: 'Inter', families: ['Sora:wght@500;600;700;800', 'Inter:wght@400;500;600;700'] },
  elegante: {
    label: 'Elegante',
    display: 'Playfair Display',
    body: 'Lato',
    families: ['Playfair+Display:wght@600;700;800', 'Lato:wght@400;700'],
  },
  tecnica: {
    label: 'Técnica',
    display: 'Space Grotesk',
    body: 'IBM Plex Sans',
    families: ['Space+Grotesk:wght@500;600;700', 'IBM+Plex+Sans:wght@400;500;600'],
  },
  amigable: { label: 'Amigable', display: 'Fredoka', body: 'Nunito', families: ['Fredoka:wght@500;600;700', 'Nunito:wght@400;600;700'] },
  codigo: {
    label: 'Código',
    display: 'JetBrains Mono',
    body: 'IBM Plex Sans',
    families: ['JetBrains+Mono:wght@500;700;800', 'IBM+Plex+Sans:wght@400;500;600'],
  },
};

export const SECTION_LABELS = {
  hero: 'Portada',
  technologies: 'Tecnologías',
  featured: 'Destacados',
  projects: 'Proyectos',
  skills: 'Habilidades',
  certificates: 'Certificados y cursos',
  contact: 'Contacto',
};

/** Plantillas por sección: [clave, nombre, descripción]. */
export const LAYOUTS = {
  hero: [
    ['dividida', 'Dividida', 'Texto a la izquierda y tu foto en un círculo animado'],
    ['centrada', 'Centrada', 'Todo centrado, con la foto arriba'],
    ['minimal', 'Minimalista', 'Tipografía gigante, sin adornos'],
    ['tarjeta', 'Tarjeta', 'Tu perfil dentro de una tarjeta de vidrio'],
    ['banner', 'Banner', 'Portada de color y foto superpuesta'],
  ],
  technologies: [
    ['cinta', 'Cinta', 'Las tecnologías pasan en una cinta animada'],
    ['doble', 'Doble cinta', 'Dos cintas en direcciones opuestas'],
    ['contorno', 'Contorno', 'Letras gigantes con borde, en movimiento'],
    ['nube', 'Nube', 'Etiquetas fijas, más grandes las que más usás'],
    ['contador', 'Contador', 'Cada tecnología con la cantidad de proyectos'],
  ],
  featured: [
    ['alternada', 'Alternada', 'Imagen y texto en zigzag'],
    ['vitrina', 'Vitrina', 'Uno grande y el resto al costado'],
    ['carrusel', 'Carrusel', 'Tarjetas que se deslizan de costado'],
    ['superpuesta', 'Superpuesta', 'Texto encima de la imagen'],
    ['numerada', 'Numerada', 'Lista grande con números'],
  ],
  projects: [
    ['grilla', 'Grilla', 'Tarjetas en 3 columnas con filtros'],
    ['lista', 'Lista', 'Filas con imagen a la izquierda'],
    ['galeria', 'Galería', 'Solo imágenes; el texto aparece al pasar el mouse'],
    ['compacta', 'Compacta', 'Tabla prolija sin imágenes'],
    ['linea', 'Línea de tiempo', 'Ordenados por año en una línea vertical'],
  ],
  skills: [
    ['barras', 'Barras', 'Grupos por categoría con barras de nivel'],
    ['chips', 'Etiquetas', 'Etiquetas por categoría con puntos de nivel'],
    ['mosaico', 'Mosaico', 'Ícono grande y nivel en una grilla'],
    ['anillos', 'Anillos', 'Círculos de progreso por habilidad'],
    ['niveles', 'Por nivel', 'Agrupadas de Experto a Básico'],
  ],
  certificates: [
    ['linea', 'Línea de tiempo', 'Ordenados en una línea vertical'],
    ['grilla', 'Grilla', 'Tarjetas con imagen arriba'],
    ['lista', 'Lista', 'Filas compactas'],
    ['medallas', 'Medallas', 'Insignias redondas'],
    ['carrusel', 'Carrusel', 'Tarjetas que se deslizan de costado'],
  ],
  contact: [
    ['degradado', 'Degradado', 'Gran panel de color con destellos'],
    ['dividida', 'Dividida', 'Texto y tarjetas de contacto lado a lado'],
    ['minimal', 'Minimalista', 'Tu email en grande y nada más'],
    ['tarjeta', 'Tarjeta', 'Tarjeta de vidrio con botones grandes'],
    ['franja', 'Franja', 'Banda de color de lado a lado'],
  ],
};

export const SECTIONS = ['technologies', 'featured', 'projects', 'skills', 'certificates', 'contact'];

export const DEFAULT_DESIGN = {
  palette: 'aurora',
  background: 'aurora',
  font: 'moderna',
  layouts: Object.fromEntries(Object.entries(LAYOUTS).map(([k, v]) => [k, v[0][0]])),
  order: [...SECTIONS],
  hidden: [],
};

export function withDefaults(d = {}) {
  const order = (d?.order || []).filter((s) => SECTIONS.includes(s));
  SECTIONS.forEach((s) => !order.includes(s) && order.push(s));
  return {
    ...DEFAULT_DESIGN,
    ...d,
    layouts: { ...DEFAULT_DESIGN.layouts, ...(d?.layouts || {}) },
    order,
    hidden: d?.hidden || [],
  };
}

const loadedFonts = new Set(['moderna']);

/** Carga la tipografía desde Google Fonts solo cuando se usa. */
function loadFont(key) {
  if (loadedFonts.has(key) || !FONTS[key]) return;
  loadedFonts.add(key);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${FONTS[key].families.map((f) => `family=${f}`).join('&')}&display=swap`;
  document.head.appendChild(link);
}

/**
 * Aplica paleta y tipografía al documento. Devuelve una función que restaura
 * los valores originales (para volver al panel con la paleta de siempre).
 */
export function applyDesign(design) {
  const root = document.documentElement;
  const [c1, c2, c3] = (PALETTES[design.palette] || PALETTES.aurora).colors;
  const font = FONTS[design.font] || FONTS.moderna;
  loadFont(design.font);
  const vars = {
    '--c1': c1,
    '--c2': c2,
    '--c3': c3,
    '--font-display': `'${font.display}', system-ui, sans-serif`,
    '--font-sans': `'${font.body}', system-ui, sans-serif`,
  };
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  return () => Object.keys(vars).forEach((k) => root.style.removeProperty(k));
}
