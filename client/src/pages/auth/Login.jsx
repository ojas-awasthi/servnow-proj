import { useEffect, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import {
  clearAuthError,
  loginUser,
} from "../../features/auth/authSlice";

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const redirectPath = location.state?.from || "/";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, {
        replace: true,
      });
    }
  }, [isAuthenticated, navigate, redirectPath]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      dispatch(clearAuthError());
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await dispatch(loginUser(form));

    if (loginUser.fulfilled.match(result)) {
      navigate(redirectPath, {
        replace: true,
      });
    }
  };

  const isFormValid =
    form.email.trim().length > 0 &&
    form.password.length > 0;

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-144px)] max-w-md items-center justify-center">
        <section className="w-full">
          <div className="mb-8 text-center">
            <div
              className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-lg font-bold text-white shadow-lg shadow-slate-950/10"
              aria-hidden="true"
            >
              S
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to manage your services and bookings.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md sm:p-8">
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
              noValidate
            >
              {error && (
                <div
                  role="alert"
                  aria-live="assertive"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {error}
                </div>
              )}

              <Input
                id="login-email"
                name="email"
                type="email"
                label="Email address"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />

              <div>
                <div className="relative">
                  <Input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                  />

                  {form.password && (
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((visible) => !visible)
                      }
                      className="absolute right-3 top-[2.35rem] flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      ) : (
                        <Eye
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  )}
                </div>

                <div className="mt-2 text-right">
                  <span className="text-xs font-medium text-slate-400">
                    Forgot password will be added later
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={loading}
                disabled={!isFormValid || loading}
              >
                Sign in

                {!loading && (
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                )}
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div
                className="h-px flex-1 bg-slate-100"
                aria-hidden="true"
              />

              <span className="text-xs text-slate-400">
                OR
              </span>

              <div
                className="h-px flex-1 bg-slate-100"
                aria-hidden="true"
              />
            </div>

            <p className="text-center text-sm text-slate-500">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-slate-950 underline decoration-slate-300 underline-offset-4 transition-colors hover:decoration-slate-950"
              >
                Create one
              </Link>
            </p>
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
            <LockKeyhole
              className="h-3.5 w-3.5"
              aria-hidden="true"
            />

            <span>
              Your account is protected with secure authentication.
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;