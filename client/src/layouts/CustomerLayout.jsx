import { useState } from "react";
import {
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  UserRound,
  X,
} from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { logout } from "../features/auth/authSlice";

const navigation = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Wishlist", to: "/wishlist" },
];

function CustomerLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, user } = useSelector(
    (state) => state.auth
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    setAccountMenuOpen(false);
    closeMobileMenu();
    navigate("/", { replace: true });
  };

  const userInitial = user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link
            to="/"
            onClick={() => {
              closeMobileMenu();
              setAccountMenuOpen(false);
            }}
            className="group flex items-center gap-2"
            aria-label="ServNOW home"
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
              aria-hidden="true"
            >
              S
            </div>

            <span className="text-lg font-semibold tracking-tight text-slate-950">
              ServNOW
            </span>
          </Link>

          {/* Desktop navigation */}
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Main navigation"
          >
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-slate-100 text-slate-950"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 md:flex">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-950"
                >
                  Sign in
                </Link>

                <Link
                  to="/register"
                  className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:translate-y-0"
                >
                  Get started
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setAccountMenuOpen((open) => !open)
                  }
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-left transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
                  aria-label="Open account menu"
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="menu"
                >
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-950 text-xs font-semibold text-white"
                    aria-hidden="true"
                  >
                    {userInitial}
                  </span>

                  <span className="hidden max-w-28 truncate text-sm font-medium text-slate-700 lg:block">
                    {user?.name || "Account"}
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                      accountMenuOpen ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  />
                </button>

                {accountMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-950/10"
                    role="menu"
                  >
                    <div className="border-b border-slate-100 px-3 py-2.5">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {user?.name || "Account"}
                      </p>

                      <p className="truncate text-xs text-slate-400">
                        {user?.email}
                      </p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setAccountMenuOpen(false)}
                      className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
                      role="menuitem"
                    >
                      <LayoutDashboard
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                      Dashboard
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-950"
                      role="menuitem"
                    >
                      <Heart
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                      Wishlist
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                      role="menuitem"
                    >
                      <LogOut
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen((open) => !open);
              setAccountMenuOpen(false);
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-950 active:scale-95 md:hidden"
            aria-label={
              mobileMenuOpen
                ? "Close navigation menu"
                : "Open navigation menu"
            }
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {mobileMenuOpen ? (
              <X
                className="h-5 w-5"
                aria-hidden="true"
              />
            ) : (
              <Menu
                className="h-5 w-5"
                aria-hidden="true"
              />
            )}
          </button>
        </div>

        {/* Mobile navigation */}
        <div
          id="mobile-navigation"
          className={`overflow-hidden border-t border-slate-200/70 bg-white transition-all duration-300 md:hidden ${
            mobileMenuOpen
              ? "max-h-[32rem] opacity-100"
              : "max-h-0 border-t-transparent opacity-0"
          }`}
        >
          <nav
            className="mx-auto max-w-7xl px-4 py-3 sm:px-6"
            aria-label="Mobile navigation"
          >
            <div className="space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-slate-100 text-slate-950"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="mt-3 border-t border-slate-100 pt-3">
                {!isAuthenticated ? (
                  <div className="flex gap-2">
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-slate-50 active:scale-[0.98]"
                    >
                      Sign in
                    </Link>

                    <Link
                      to="/register"
                      onClick={closeMobileMenu}
                      className="flex-1 rounded-lg bg-slate-950 px-4 py-2.5 text-center text-sm font-medium text-white transition-all duration-200 hover:bg-slate-800 active:scale-[0.98]"
                    >
                      Get started
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="mb-2 flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-3">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-xs font-semibold text-white"
                        aria-hidden="true"
                      >
                        {userInitial}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950">
                          {user?.name || "Account"}
                        </p>

                        <p className="truncate text-xs text-slate-400">
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    >
                      <LayoutDashboard
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                      Dashboard
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                    >
                      <Heart
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                      Wishlist
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default CustomerLayout;