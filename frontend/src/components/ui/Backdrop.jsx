import { useMemo } from 'react';

const COLORS = ['#ffffff', '#f0abfc', '#c4b5fd', '#fdba74', '#f9a8d4'];

/** Estrella de 4 puntas (destello). */
export function SparkleIcon({ size = 12, color = 'currentColor', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} aria-hidden="true" {...props}>
      <path d="M12 0c.9 6.6 4.5 10.2 12 12-7.5 1.8-11.1 5.4-12 12-.9-6.6-4.5-10.2-12-12C7.5 10.2 11.1 6.6 12 0z" />
    </svg>
  );
}

// Pseudoaleatorio determinístico: los destellos no "saltan" entre renders.
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function Sparkles({ count = 24, seed = 7, className = '' }) {
  const items = useMemo(() => {
    const rand = seeded(seed);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${rand() * 100}%`,
      top: `${rand() * 100}%`,
      size: 6 + rand() * 12,
      color: COLORS[Math.floor(rand() * COLORS.length)],
      delay: `${(rand() * 6).toFixed(2)}s`,
      dur: `${(2.5 + rand() * 3.5).toFixed(2)}s`,
    }));
  }, [count, seed]);

  return (
    <div className={`sparkles ${className}`} aria-hidden="true">
      {items.map((s) => (
        <span
          key={s.id}
          className="sparkle"
          style={{ left: s.left, top: s.top, color: s.color, '--delay': s.delay, '--dur': s.dur }}
        >
          <SparkleIcon size={s.size} />
        </span>
      ))}
    </div>
  );
}

/**
 * Fondo global. Variantes: aurora (por defecto), destellos, degradado, grilla, puntos y liso.
 */
export function Backdrop({ sparkles = 28, variant = 'aurora' }) {
  const showBlobs = variant === 'aurora';
  const stars = variant === 'destellos' ? 90 : variant === 'aurora' ? sparkles : variant === 'degradado' ? 12 : 0;
  return (
    <div className={`backdrop backdrop--${variant}`} aria-hidden="true">
      {showBlobs && (
        <>
          <div className="backdrop__blob backdrop__blob--1" />
          <div className="backdrop__blob backdrop__blob--2" />
          <div className="backdrop__blob backdrop__blob--3" />
        </>
      )}
      {(variant === 'aurora' || variant === 'grilla') && <div className="backdrop__grid" />}
      {variant === 'puntos' && <div className="backdrop__dots" />}
      {variant !== 'liso' && <div className="backdrop__noise" />}
      {stars > 0 && <Sparkles count={stars} seed={11} />}
    </div>
  );
}
