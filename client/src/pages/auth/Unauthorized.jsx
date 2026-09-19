import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";

function Unauthorized() {
  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md text-center">
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600"
          aria-hidden="true"
        >
          <ShieldX className="h-6 w-6" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          Access restricted
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          You don't have permission to access this area.
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 active:scale-[0.98]"
        >
          Return home
        </Link>
      </section>
    </main>
  );
}

export default Unauthorized;