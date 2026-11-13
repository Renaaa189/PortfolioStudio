import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { PROJECT_STATUS } from '../../utils/constants.js';
import { initials } from '../../utils/format.js';
import { SparkleIcon } from './Backdrop.jsx';

export function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      className={`icon-btn theme-toggle ${className}`}
      onClick={toggle}
      aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={isDark ? 'Tema claro' : 'Tema oscuro'}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export function StatusBadge({ status }) {
  return <span className={`badge badge--${status}`}>{PROJECT_STATUS[status] || status}</span>;
}

export function Avatar({ src, firstName, lastName, size = 40 }) {
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {src ? <img src={src} alt="" /> : initials(firstName, lastName)}
    </span>
  );
}

export function Logo({ compact }) {
  return (
    <span className="logo">
      <span className="logo__mark">
        <SparkleIcon size={18} color="#fff" />
      </span>
      {!compact && (
        <span className="logo__text">
          Portfolio<span className="gradient-text">Studio</span>
        </span>
      )}
    </span>
  );
}
