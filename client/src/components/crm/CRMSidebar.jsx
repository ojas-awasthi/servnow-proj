import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChevronLeft,
  ClipboardList,
  FolderTree,
  Headphones,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  ShoppingBag,
  TicketCheck,
  Users,
  UserRoundCog,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";

import CRMNavItem from "./CRMNavItem";

const navigation = [
  {
    label: "Overview",
    items: [
      {
        to: "/crm",
        label: "Dashboard",
        icon: LayoutDashboard,
        end: true,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        to: "/crm/customers",
        label: "Customers",
        icon: Users,
      },
      {
        to: "/crm/providers",
        label: "Providers",
        icon: BriefcaseBusiness,
      },
      {
        to: "/crm/services",
        label: "Services",
        icon: ShoppingBag,
      },
      {
        to: "/crm/categories",
        label: "Categories",
        icon: FolderTree,
      },
      {
        to: "/crm/bookings",
        label: "Bookings",
        icon: CalendarDays,
      },
    ],
  },
  {
    label: "CRM",
    items: [
      {
        to: "/crm/leads",
        label: "Leads",
        icon: BarChart3,
      },
      {
        to: "/crm/transactions",
        label: "Transactions",
        icon: ClipboardList,
      },
      {
        to: "/crm/tickets",
        label: "Support tickets",
        icon: TicketCheck,
      },
      {
        to: "/crm/notifications",
        label: "Notifications",
        icon: Bell,
      },
    ],
  },
  {
    label: "Administration",
    items: [
      {
        to: "/crm/users",
        label: "Users & roles",
        icon: UserRoundCog,
      },
    ],
  },
];

function CRMSidebar({ mobileOpen, onClose }) {
  const { user } = useSelector((state) => state.auth);

  const displayName = user?.name || "Administrator";
  const role = user?.role || "admin";

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close CRM navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col",
          "border-r border-slate-200 bg-white",
          "transition-transform duration-200 lg:static lg:z-auto lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        aria-label="CRM navigation"
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div>
            <p className="text-lg font-bold tracking-tight text-slate-950">
              ServNOW
            </p>

            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
              CRM Console
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close CRM navigation"
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 lg:hidden"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-6">
            {navigation.map((section) => (
              <div key={section.label}>
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  {section.label}
                </p>

                <div className="space-y-1">
                  <div className="space-y-1">
  {section.items.map((item) => (
    <CRMNavItem
      key={item.to}
      to={item.to}
      label={item.label}
      icon={item.icon}
      end={item.end}
    />
  ))}
</div>
                </div>
              </div>
            ))}
          </div>
        </nav>

        <div className="border-t border-slate-200 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white"
              aria-hidden="true"
            >
              {displayName.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {displayName}
              </p>

              <p className="truncate text-xs capitalize text-slate-500">
                {role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default CRMSidebar;