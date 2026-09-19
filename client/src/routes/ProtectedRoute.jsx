import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoute() {
  const location = useLocation();

  const { isAuthenticated, loading, token } = useSelector(
    (state) => state.auth
  );

  if (token && loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-slate-50">
        <div
          className="flex items-center gap-3 text-sm text-slate-500"
          role="status"
          aria-live="polite"
        >
          <span
            className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950"
            aria-hidden="true"
          />
          Checking your account...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;