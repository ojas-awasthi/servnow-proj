import { NavLink } from "react-router-dom";

function CRMNavItem({
  to,
  icon: Icon,
  label,
  end = false,
  onClick,
}) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "group flex items-center gap-3 rounded-xl px-3 py-2.5",
          "text-sm font-medium transition-colors duration-150",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-slate-950 focus-visible:ring-offset-2",
          isActive
            ? "bg-slate-950 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
        ].join(" ")
      }
    >
      <Icon
        className="h-4.5 w-4.5 shrink-0"
        aria-hidden="true"
      />

      <span>{label}</span>
    </NavLink>
  );
}

export default CRMNavItem;