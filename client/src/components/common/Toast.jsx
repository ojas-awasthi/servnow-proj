import { CheckCircle2, X, XCircle, Info } from "lucide-react";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const styles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-blue-200 bg-blue-50 text-blue-900",
};

function Toast({
  type = "info",
  title,
  message,
  onClose,
}) {
  const Icon = icons[type] || Info;

  return (
    <div
      role="status"
      className={[
        "flex w-full max-w-sm items-start gap-3 rounded-2xl border",
        "p-4 shadow-lg backdrop-blur-sm",
        styles[type] || styles.info,
        "animate-in",
      ].join(" ")}
    >
      <Icon
        className="mt-0.5 h-5 w-5 shrink-0"
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        {title && (
          <p className="text-sm font-semibold">
            {title}
          </p>
        )}

        {message && (
          <p className="mt-0.5 text-sm opacity-80">
            {message}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Close notification"
        className="rounded-lg p-1 opacity-60 transition-opacity hover:opacity-100"
      >
        <X
          className="h-4 w-4"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

export default Toast;