import { Search, X } from "lucide-react";

function SearchInput({
  value = "",
  onChange,
  onClear,
  placeholder = "Search...",
  className = "",
  label,
}) {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <div className="relative">
        {/* Search icon */}
        <span
          className="pointer-events-none absolute left-3.5 top-0 flex h-11 items-center"
          aria-hidden="true"
        >
          <Search className="h-5 w-5 text-slate-400" strokeWidth={2} />
        </span>

        {/* Search input */}
        <input
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-label={label || placeholder}
          className={[
            "h-11 w-full",
            "rounded-xl border border-slate-200",
            "bg-white",
            "pl-11 pr-10",
            "text-sm text-slate-900",
            "shadow-sm",
            "outline-none",
            "placeholder:text-slate-400",
            "transition-all duration-200",
            "focus:border-slate-400",
            "focus:ring-4 focus:ring-slate-950/5",
          ].join(" ")}
        />

        {/* Clear button */}
        {value && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            title="Clear search"
            className={[
              "absolute right-2 top-1/2",
              "flex h-7 w-7 -translate-y-1/2",
              "items-center justify-center",
              "rounded-lg",
              "text-slate-400",
              "transition-colors duration-200",
              "hover:bg-slate-100 hover:text-slate-700",
              "focus-visible:outline-none",
              "focus-visible:ring-2",
              "focus-visible:ring-slate-950",
              "focus-visible:ring-offset-1",
            ].join(" ")}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}

export default SearchInput;