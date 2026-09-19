import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  UserRound,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import {
  clearAuthError,
  registerUser,
} from "../../features/auth/authSlice";

function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.auth
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

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

    const result = await dispatch(registerUser(form));

    if (registerUser.fulfilled.match(result)) {
      navigate("/", { replace: true });
    }
  };

  const passwordLengthValid = form.password.length >= 6;

  const isFormValid =
    form.name.trim().length > 0 &&
    form.email.trim().length > 0 &&
    passwordLengthValid;

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-144px)] max-w-lg items-center justify-center">
        <section className="w-full">
          <div className="mb-8 text-center">
            <div
              className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/10"
              aria-hidden="true"
            >
              <UserRound
                className="h-5 w-5"
                aria-hidden="true"
              />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Create your account
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Get started with ServNOW in less than a minute.
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
                id="register-name"
                name="name"
                label="Full name"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />

              <Input
                id="register-email"
                name="email"
                type="email"
                label="Email address"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />

              <Input
                id="register-phone"
                name="phone"
                type="tel"
                label="Phone number"
                placeholder="Optional"
                value={form.phone}
                onChange={handleChange}
                autoComplete="tel"
              />

              <div>
                <div className="relative">
                  <Input
                    id="register-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    placeholder="At least 6 characters"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="new-password"
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

                <div
                  className={`mt-2 flex items-center gap-1.5 text-xs ${
                    passwordLengthValid
                      ? "text-emerald-600"
                      : "text-slate-400"
                  }`}
                  aria-live="polite"
                >
                  <Check
                    className={`h-3.5 w-3.5 ${
                      passwordLengthValid
                        ? "opacity-100"
                        : "opacity-40"
                    }`}
                    aria-hidden="true"
                  />

                  <span>
                    Use at least 6 characters
                  </span>
                </div>
              </div>

              <p className="text-xs leading-5 text-slate-400">
                By creating an account, you agree to use ServNOW
                responsibly and provide accurate information.
              </p>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={loading}
                disabled={!isFormValid || loading}
              >
                Create account

                {!loading && (
                  <ArrowRight
                    className="h-4 w-4"
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
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-slate-950 underline decoration-slate-300 underline-offset-4 transition-colors hover:decoration-slate-950"
              >
                Sign in
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Register;