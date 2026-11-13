export function Button({
  variant = 'primary',
  size,
  block,
  loading,
  icon: Icon,
  iconRight: IconRight,
  children,
  className = '',
  as: Comp = 'button',
  ...props
}) {
  const cls = ['btn', `btn--${variant}`, size && `btn--${size}`, block && 'btn--block', className]
    .filter(Boolean)
    .join(' ');
  const extra = Comp === 'button' ? { type: props.type || 'button', disabled: loading || props.disabled } : {};
  return (
    <Comp className={cls} {...props} {...extra}>
      {loading ? <span className="spinner" /> : Icon && <Icon size={size === 'sm' ? 15 : 18} />}
      {children}
      {IconRight && !loading && <IconRight size={size === 'sm' ? 15 : 18} />}
    </Comp>
  );
}

export function IconButton({ label, icon: Icon, variant, size, className = '', ...props }) {
  const cls = ['icon-btn', variant && `icon-btn--${variant}`, size && `icon-btn--${size}`, className].filter(Boolean).join(' ');
  return (
    <button type="button" className={cls} aria-label={label} title={label} {...props}>
      <Icon size={size === 'sm' ? 15 : 17} />
    </button>
  );
}
