import { useCallback, useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Search,
  X,
} from "lucide-react";

import api from "../../services/api";

function Providers() {
  const [users, setUsers] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedProvider, setSelectedProvider] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  const loadProviders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/users", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
        },
      });

      setUsers(response.data?.data || []);

      setPagination((current) => ({
        ...current,
        ...(response.data?.pagination || {}),
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load providers. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  const providers = useMemo(() => {
    const providerUsers = users.filter(
      (user) => user.role === "provider"
    );

    const normalizedSearch = search.trim().toLowerCase();

    return providerUsers.filter((provider) => {
      const matchesSearch =
        !normalizedSearch ||
        provider.name?.toLowerCase().includes(normalizedSearch) ||
        provider.email?.toLowerCase().includes(normalizedSearch) ||
        provider.phone?.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        provider.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  const providerCount = users.filter(
    (user) => user.role === "provider"
  ).length;

  const activeProviderCount = users.filter(
    (user) =>
      user.role === "provider" &&
      user.status === "active"
  ).length;

  const visibleProviderCount = providers.length;

  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (!parts.length) return "?";

    return parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleViewProvider = async (providerId) => {
    try {
      setDetailsLoading(true);
      setActionError("");

      const response = await api.get(`/users/${providerId}`);

      setSelectedProvider(response.data?.data || null);
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Unable to load provider details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseProvider = () => {
    if (actionLoading) return;

    setSelectedProvider(null);
    setActionError("");
  };

  const handleStatusChange = async (status) => {
    if (!selectedProvider?._id) return;

    try {
      setActionLoading(true);
      setActionError("");

      await api.patch(
        `/users/${selectedProvider._id}/status`,
        { status }
      );

      setSelectedProvider((current) =>
        current
          ? {
              ...current,
              status,
            }
          : current
      );

      await loadProviders();
    } catch (err) {
      setActionError(
        err.response?.data?.message ||
          "Unable to update provider status."
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrevious = () => {
    if (pagination.page <= 1) return;

    setPagination((current) => ({
      ...current,
      page: current.page - 1,
    }));
  };

  const handleNext = () => {
    if (pagination.page >= pagination.totalPages) return;

    setPagination((current) => ({
      ...current,
      page: current.page + 1,
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-28 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200" />
          <div className="h-28 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200" />
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="h-14 animate-pulse bg-slate-100" />

          <div className="space-y-4 p-6">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <section
        className="flex min-h-[420px] items-center justify-center rounded-2xl border border-red-100 bg-white p-8 shadow-sm"
        aria-live="polite"
      >
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <BriefcaseBusiness size={22} aria-hidden="true" />
          </div>

          <h2 className="text-lg font-semibold text-slate-950">
            Providers could not be loaded
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error}
          </p>

          <button
            type="button"
            onClick={loadProviders}
            className="mt-5 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 active:scale-[0.98]"
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              CRM Management
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Providers
            </h1>

            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Manage service providers, contact details, and account status.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <BriefcaseBusiness
              size={17}
              className="text-slate-500"
              aria-hidden="true"
            />

            <span className="text-sm font-semibold text-slate-950">
              {providerCount}
            </span>

            <span className="text-sm text-slate-500">
              total providers
            </span>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Providers
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                {providerCount}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <BriefcaseBusiness
                size={19}
                aria-hidden="true"
              />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Provider accounts in the system
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Active
              </p>

              <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                {activeProviderCount}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2
                size={19}
                aria-hidden="true"
              />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            Currently active provider accounts
          </p>
        </div>
      </div>

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />

            <label htmlFor="provider-search" className="sr-only">
              Search providers
            </label>

            <input
              id="provider-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, or phone..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-950 placeholder:text-slate-400 transition focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-950/10"
            />
          </div>

          <div className="flex items-center gap-3">
            <label
              htmlFor="provider-status"
              className="text-sm font-medium text-slate-600"
            >
              Status
            </label>

            <select
              id="provider-status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-950/10"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>
        </div>
      </section>

      {/* Provider table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-1 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-950">
              Provider Accounts
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Showing {visibleProviderCount} provider
              {visibleProviderCount === 1 ? "" : "s"} from the current
              page.
            </p>
          </div>
        </div>

        {providers.length === 0 ? (
          <div className="flex min-h-[280px] items-center justify-center px-6 py-12">
            <div className="max-w-sm text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <BriefcaseBusiness
                  size={21}
                  aria-hidden="true"
                />
              </div>

              <h3 className="font-semibold text-slate-950">
                No providers found
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Try changing your search term or status filter.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left">
                <caption className="sr-only">
                  Provider account management table
                </caption>

                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      Provider
                    </th>

                    <th
                      scope="col"
                      className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      Contact
                    </th>

                    <th
                      scope="col"
                      className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      Status
                    </th>

                    <th
                      scope="col"
                      className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      Joined
                    </th>

                    <th
                      scope="col"
                      className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {providers.map((provider) => (
                    <tr
                      key={provider._id}
                      className="transition-colors duration-150 hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {provider.avatar ? (
                            <img
                              src={provider.avatar}
                              alt={`${provider.name}'s avatar`}
                              className="h-10 w-10 rounded-xl object-cover ring-1 ring-slate-200"
                            />
                          ) : (
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-700"
                              aria-hidden="true"
                            >
                              {getInitials(provider.name)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-950">
                              {provider.name || "Unnamed provider"}
                            </p>

                            <p className="truncate text-xs text-slate-500">
                              {provider.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail
                              size={14}
                              className="shrink-0 text-slate-400"
                              aria-hidden="true"
                            />

                            <span>
                              {provider.email || "—"}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Phone
                              size={14}
                              className="shrink-0 text-slate-400"
                              aria-hidden="true"
                            />

                            <span>
                              {provider.phone || "No phone"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            provider.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : provider.status === "blocked"
                                ? "bg-red-50 text-red-700"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              provider.status === "active"
                                ? "bg-emerald-500"
                                : provider.status === "blocked"
                                  ? "bg-red-500"
                                  : "bg-slate-400"
                            }`}
                            aria-hidden="true"
                          />

                          {formatStatus(provider.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-500">
                        {formatDate(provider.createdAt)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            handleViewProvider(provider._id)
                          }
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 active:scale-[0.98]"
                        >
                          View
                          <span className="sr-only">
                            {" "}
                            details for {provider.name}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page{" "}
                <span className="font-semibold text-slate-700">
                  {pagination.page}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {pagination.totalPages}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={pagination.page <= 1}
                  aria-label="Previous page"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={17} aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    pagination.page >= pagination.totalPages
                  }
                  aria-label="Next page"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight size={17} aria-hidden="true" />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Provider details modal */}
      {selectedProvider && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseProvider();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="provider-details-title"
            className="w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
          >
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-5 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Provider details
                </p>

                <h2
                  id="provider-details-title"
                  className="mt-1 text-xl font-bold tracking-tight text-slate-950"
                >
                  {selectedProvider.name || "Provider"}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleCloseProvider}
                disabled={actionLoading}
                aria-label="Close provider details"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X size={19} aria-hidden="true" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto px-5 py-6 sm:px-6">
              {detailsLoading ? (
                <div
                  className="flex min-h-[260px] items-center justify-center"
                  role="status"
                  aria-live="polite"
                >
                  <div className="flex items-center gap-3 text-sm text-slate-500">
                    <span
                      className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950"
                      aria-hidden="true"
                    />

                    Loading provider details...
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    {selectedProvider.avatar ? (
                      <img
                        src={selectedProvider.avatar}
                        alt={`${selectedProvider.name}'s avatar`}
                        className="h-16 w-16 rounded-2xl object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div
                        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-lg font-bold text-slate-700"
                        aria-hidden="true"
                      >
                        {getInitials(selectedProvider.name)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-semibold text-slate-950">
                        {selectedProvider.name ||
                          "Unnamed provider"}
                      </h3>

                      <p className="truncate text-sm text-slate-500">
                        {selectedProvider.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-400">
                        Email
                      </p>

                      <p className="mt-1 break-all text-sm font-medium text-slate-900">
                        {selectedProvider.email || "—"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-400">
                        Phone
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {selectedProvider.phone || "Not provided"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-400">
                        Provider ID
                      </p>

                      <p className="mt-1 break-all font-mono text-xs text-slate-700">
                        {selectedProvider._id}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-400">
                        Joined
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {formatDate(selectedProvider.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">
                          Account status
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Manage this provider's account access.
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          selectedProvider.status === "active"
                            ? "bg-emerald-50 text-emerald-700"
                            : selectedProvider.status === "blocked"
                              ? "bg-red-50 text-red-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            selectedProvider.status === "active"
                              ? "bg-emerald-500"
                              : selectedProvider.status === "blocked"
                                ? "bg-red-500"
                                : "bg-slate-400"
                          }`}
                          aria-hidden="true"
                        />

                        {formatStatus(selectedProvider.status)}
                      </span>
                    </div>

                    {actionError && (
                      <p
                        className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700"
                        role="alert"
                      >
                        {actionError}
                      </p>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {selectedProvider.status !== "active" && (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() =>
                            handleStatusChange("active")
                          }
                          className="rounded-lg bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Activate
                        </button>
                      )}

                      {selectedProvider.status !== "inactive" && (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() =>
                            handleStatusChange("inactive")
                          }
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Deactivate
                        </button>
                      )}

                      {selectedProvider.status !== "blocked" && (
                        <button
                          type="button"
                          disabled={actionLoading}
                          onClick={() =>
                            handleStatusChange("blocked")
                          }
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Block
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default Providers;