import {
  CheckCircle2,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useSelector } from "react-redux";

import Badge from "../../../components/common/Badge";
import Card from "../../../components/common/Card";

function Profile() {
  const { user } = useSelector((state) => state.auth);

  const initials =
    user?.name
      ?.trim()
      ?.split(/\s+/)
      ?.slice(0, 2)
      ?.map((part) => part.charAt(0).toUpperCase())
      ?.join("") || "U";

  const displayName = user?.name || "Customer";
  const email = user?.email || "No email available";
  const phone = user?.phone || "Not provided";
  const status = user?.status || "active";

  return (
    <main className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-slate-500">
            Account
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Profile
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            View your ServNOW account information and account status.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {/* Profile identity card */}
          <Card className="rounded-3xl p-6">
            <div className="flex flex-col items-center text-center">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-950 text-xl font-bold text-white shadow-lg shadow-slate-950/10"
                aria-label={`Profile initials for ${displayName}`}
              >
                {initials}
              </div>

              <h2 className="mt-5 text-lg font-semibold text-slate-950">
                {displayName}
              </h2>

              <p className="mt-1 max-w-full truncate text-sm text-slate-500">
                {email}
              </p>

              <div className="mt-4">
                <Badge
                  variant={
                    status === "active"
                      ? "success"
                      : "warning"
                  }
                >
                  {status}
                </Badge>
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-5">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Account protected
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Your account uses authenticated access through
                    ServNOW.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Account information */}
          <div className="space-y-6">
            <Card className="rounded-3xl p-6 sm:p-8">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Personal information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Information associated with your ServNOW account.
                </p>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                {/* Name */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors duration-200 hover:border-slate-300">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                      aria-hidden="true"
                    >
                      <UserRound className="h-4 w-4" />
                    </span>

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-400">
                        Full name
                      </p>

                      <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                        {displayName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors duration-200 hover:border-slate-300">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                      aria-hidden="true"
                    >
                      <Mail className="h-4 w-4" />
                    </span>

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-400">
                        Email address
                      </p>

                      <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                        {email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors duration-200 hover:border-slate-300">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                      aria-hidden="true"
                    >
                      <Phone className="h-4 w-4" />
                    </span>

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-400">
                        Phone number
                      </p>

                      <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                        {phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account role */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 transition-colors duration-200 hover:border-slate-300">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                      aria-hidden="true"
                    >
                      <ShieldCheck className="h-4 w-4" />
                    </span>

                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-400">
                        Account type
                      </p>

                      <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                        {user?.role || "customer"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Account status */}
            <Card className="rounded-3xl p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50"
                  aria-hidden="true"
                >
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-slate-950">
                    Account status
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    Your current account status is{" "}
                    <span className="font-medium text-slate-700">
                      {status}
                    </span>
                    .
                  </p>
                </div>
              </div>
            </Card>

            {/* Future profile editing placeholder */}
            <Card className="rounded-3xl border-dashed p-6 sm:p-8">
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Profile management
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Profile editing can be enabled once a customer
                  self-service profile update endpoint is available.
                  The current backend user-management endpoints are
                  restricted to CRM administrators.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Profile;