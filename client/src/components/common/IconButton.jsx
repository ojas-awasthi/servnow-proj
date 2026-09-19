function IconButton({
  icon,
  label,
  variant = "ghost",
  size = "md",
  className = "",
  onClick,
  type = "button",
  disabled = false,
  ...props
}) {
  const variants = {
    ghost:
      "text-slate-500 hover:bg-slate-100 hover:text-slate-950",
    bordered:
      "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950",
    dark:
      "bg-slate-950 text-white hover:bg-slate-800",
  };

  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-11 w-11",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={[
        "inline-flex items-center justify-center rounded-xl",
        "transition-all duration-200 ease-out",
        "active:scale-95",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-slate-950 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      ].join(" ")}
      {...props}
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  );
}

export default IconButton;