import {
  Bell,
  Menu,
  Search,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";

function CRMTopbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const { user } = useSelector((state) => state.auth);

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open CRM navigation"
              className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 lg:hidden"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>

            <div className="hidden min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:flex">
              <Search
                className="h-4 w-4 text-slate-400"
                aria-hidden="true"
              />

              <span className="text-sm text-slate-400">
                Search CRM...
              </span>

              <kbd className="ml-8 hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400 md:inline">
                /
              </kbd>
            </div>

            <div className="sm:hidden">
              <p className="text-sm font-semibold text-slate-950">
                ServNOW CRM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="View notifications"
              title="Notifications"
              className="relative rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
            >
              <Bell
                className="h-5 w-5"
                aria-hidden="true"
              />

              <span
                className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500"
                aria-hidden="true"
              />
            </button>

            <div className="ml-1 hidden h-8 w-px bg-slate-200 sm:block" />

            <div className="ml-2 hidden items-center gap-2 sm:flex">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white"
                aria-hidden="true"
              >
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>

              <div className="hidden lg:block">
                <p className="max-w-32 truncate text-xs font-semibold text-slate-900">
                  {user?.name || "Administrator"}
                </p>

                <p className="text-[11px] capitalize text-slate-400">
                  {user?.role || "admin"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <MobileCRMNavigation
          onClose={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}

function MobileCRMNavigation({ onClose }) {
  return (
    <div className="fixed inset-0 z-40 lg:hidden">
      <button
        type="button"
        aria-label="Close CRM navigation"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40"
      />

      <div className="absolute inset-y-0 left-0 w-72 bg-white shadow-xl">
        <div className="p-5">
          <p className="text-lg font-bold text-slate-950">
            ServNOW
          </p>

          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
            CRM Console
          </p>
        </div>

        <p className="px-5 py-4 text-sm text-slate-500">
          CRM navigation will be connected here.
        </p>
      </div>
    </div>
  );
}

export default CRMTopbar;