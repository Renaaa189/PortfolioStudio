/** Tarjeta con brillo que sigue al cursor. */
export function GlowCard({ as: Comp = 'div', className = '', children, ...props }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <Comp className={`glow-card ${className}`} onMouseMove={onMove} {...props}>
      {children}
    </Comp>
  );
}
