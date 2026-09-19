import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import AppRoutes from "./routes/AppRoutes";
import { fetchCurrentUser } from "./features/auth/authSlice";

function App() {
  const dispatch = useDispatch();

  const { token, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, token]);

  if (token && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div
          className="flex items-center gap-3 text-sm text-slate-500"
          role="status"
          aria-live="polite"
        >
          <span
            className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950"
            aria-hidden="true"
          />
          Restoring your session...
        </div>
      </div>
    );
  }

  return <AppRoutes />;
}

export default App;