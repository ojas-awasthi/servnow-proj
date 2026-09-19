const variants = {
  primary:
    "bg-slate-950 text-white shadow-sm hover:bg-slate-800 hover:shadow-md",
  secondary:
    "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
  danger:
    "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
};

function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  className = "",
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl",
        "font-medium",
        "transition-all duration-200 ease-out",
        "active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-slate-950 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />

          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;