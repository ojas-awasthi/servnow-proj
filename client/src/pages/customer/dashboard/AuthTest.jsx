import { useSelector } from "react-redux";

function AuthTest() {
  const { user } = useSelector((state) => state.auth);

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-medium text-slate-500">
            Authentication test
          </p>

          <h1 className="mt-2 text-2xl font-bold text-slate-950">
            Welcome, {user?.name}
          </h1>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Email
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {user?.email}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Role
              </p>
              <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AuthTest;