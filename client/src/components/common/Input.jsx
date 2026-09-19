function Input({
  id,
  name,
  label,
  error,
  hint,
  className = "",
  ...props
}) {
  const descriptionId = error
    ? `${id}-error`
    : hint
      ? `${id}-hint`
      : undefined;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={descriptionId}
        className={[
          "h-11 w-full rounded-xl border",
          "bg-white px-3.5",
          "text-sm text-slate-900",
          "shadow-sm",
          "outline-none",
          "placeholder:text-slate-400",
          "transition-all duration-200",
          error
            ? "border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-500/10"
            : "border-slate-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-950/5",
        ].join(" ")}
        {...props}
      />

      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-xs font-medium text-red-600"
        >
          {error}
        </p>
      )}

      {!error && hint && (
        <p
          id={`${id}-hint`}
          className="mt-1.5 text-xs text-slate-400"
        >
          {hint}
        </p>
      )}
    </div>
  );
}

export default Input;