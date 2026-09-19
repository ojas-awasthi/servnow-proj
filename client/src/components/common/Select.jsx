import { ChevronDown } from "lucide-react";

function Select({
  label,
  options = [],
  error,
  hint,
  id,
  className = "",
  ...props
}) {
  const selectId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-medium text-slate-700"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error
              ? `${selectId}-error`
              : hint
                ? `${selectId}-hint`
                : undefined
          }
          className={[
            "h-11 w-full appearance-none rounded-xl border",
            "bg-white px-3.5 pr-10 text-sm text-slate-900",
            "shadow-sm outline-none",
            "transition-all duration-200",
            "focus:border-slate-400 focus:ring-4 focus:ring-slate-950/5",
            error
              ? "border-red-300"
              : "border-slate-200",
            "disabled:cursor-not-allowed disabled:bg-slate-50",
            className,
          ].join(" ")}
          {...props}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
      </div>

      {error && (
        <p
          id={`${selectId}-error`}
          className="mt-1.5 text-xs font-medium text-red-600"
        >
          {error}
        </p>
      )}

      {!error && hint && (
        <p
          id={`${selectId}-hint`}
          className="mt-1.5 text-xs text-slate-500"
        >
          {hint}
        </p>
      )}
    </div>
  );
}

export default Select;