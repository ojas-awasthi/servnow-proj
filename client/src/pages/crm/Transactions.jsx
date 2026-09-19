import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  CreditCard,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  X,
  WalletCards,
  XCircle,
} from "lucide-react";

import api from "../../services/api";
import CRMPageHeader from "../../components/crm/CRMPageHeader";

const STATUS_OPTIONS = [
  "all",
  "pending",
  "success",
  "failed",
  "refunded",
];

const PAYMENT_METHOD_OPTIONS = [
  "all",
  "card",
  "upi",
  "netbanking",
  "wallet",
  "mock",
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "amount_high", label: "Amount: high to low" },
  { value: "amount_low", label: "Amount: low to high" },
];

const formatCurrency = (amount) => {
  const value = Number(amount || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatShortDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(date);
};

const getStatusClasses = (status) => {
  switch (status) {
    case "success":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";

    case "pending":
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";

    case "failed":
      return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200";

    case "refunded":
      return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";

    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "success":
      return CheckCircle2;

    case "failed":
      return XCircle;

    default:
      return ClipboardList;
  }
};

const getPaymentMethodLabel = (method) => {
  switch (method) {
    case "netbanking":
      return "Net banking";

    case "mock":
      return "Mock payment";

    default:
      return method
        ? method.charAt(0).toUpperCase() + method.slice(1)
        : "—";
  }
};

function Transactions() {
  const [transactions, setTransactions] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [paymentMethod, setPaymentMethod] = useState("all");
  const [sort, setSort] = useState("newest");

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTransaction, setSelectedTransaction] =
    useState(null);

  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        status:
          status !== "all" ? status : undefined,
        paymentMethod:
          paymentMethod !== "all"
            ? paymentMethod
            : undefined,
        sort,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      };

      const response = await api.get(
        "/transactions/admin",
        { params }
      );

      const responseData = response.data;

      setTransactions(
        Array.isArray(responseData?.data)
          ? responseData.data
          : []
      );

      setPagination(
        responseData?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error(
        "Failed to load transactions:",
        err
      );

      setTransactions([]);

      setError(
        err.response?.data?.message ||
          "Unable to load transactions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [
    page,
    search,
    status,
    paymentMethod,
    sort,
    dateFrom,
    dateTo,
  ]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
    setPage(1);
  };

  const handleSortChange = (event) => {
    setSort(event.target.value);
    setPage(1);
  };

  const handleDateFromChange = (event) => {
    setDateFrom(event.target.value);
    setPage(1);
  };

  const handleDateToChange = (event) => {
    setDateTo(event.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setPaymentMethod("all");
    setSort("newest");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const hasActiveFilters = useMemo(() => {
    return (
      search.trim() ||
      status !== "all" ||
      paymentMethod !== "all" ||
      sort !== "newest" ||
      dateFrom ||
      dateTo
    );
  }, [
    search,
    status,
    paymentMethod,
    sort,
    dateFrom,
    dateTo,
  ]);

  const openDetails = async (transaction) => {
    try {
      setDetailsLoading(true);
      setSelectedTransaction(transaction);

      const response = await api.get(
        `/transactions/admin/${transaction._id}`
      );

      setSelectedTransaction(
        response.data?.data || transaction
      );
    } catch (err) {
      console.error(
        "Failed to load transaction details:",
        err
      );

      setSelectedTransaction(transaction);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    if (detailsLoading) return;

    setSelectedTransaction(null);
  };

  const canGoPrevious = pagination.page > 1;
  const canGoNext =
    pagination.page < pagination.totalPages;

  return (
    <div className="space-y-6">
      <CRMPageHeader
        eyebrow="Finance"
        title="Transactions"
        description="Review payments, transaction status, customers, and booking details."
      />

      <section
        aria-label="Transaction filters"
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />

              <input
                type="search"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search transaction, customer, email, or service..."
                aria-label="Search transactions"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <button
              type="button"
              onClick={fetchTransactions}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Refresh transactions"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
                aria-hidden="true"
              />
              Refresh
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-500">
                Status
              </span>

              <select
                value={status}
                onChange={handleStatusChange}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option === "all"
                      ? "All statuses"
                      : option.charAt(0).toUpperCase() +
                        option.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-500">
                Payment method
              </span>

              <select
                value={paymentMethod}
                onChange={handlePaymentMethodChange}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                {PAYMENT_METHOD_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option === "all"
                        ? "All methods"
                        : getPaymentMethodLabel(option)}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-500">
                Sort
              </span>

              <select
                value={sort}
                onChange={handleSortChange}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                {SORT_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-500">
                From
              </span>

              <input
                type="date"
                value={dateFrom}
                onChange={handleDateFromChange}
                aria-label="Filter transactions from date"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-500">
                To
              </span>

              <input
                type="date"
                value={dateTo}
                onChange={handleDateToChange}
                aria-label="Filter transactions to date"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500">
                Filters are applied automatically.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-950"
              >
                <X
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          />

          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              Unable to load transactions
            </p>

            <p className="mt-1 text-rose-600">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={fetchTransactions}
            className="shrink-0 rounded-lg px-2 py-1 font-medium transition hover:bg-rose-100"
          >
            Retry
          </button>
        </div>
      )}

      <section
        aria-label="Transactions"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Payment transactions
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {pagination.total}{" "}
              {pagination.total === 1
                ? "transaction"
                : "transactions"}
            </p>
          </div>

          <CreditCard
            className="h-5 w-5 text-slate-400"
            aria-hidden="true"
          />
        </div>

        {loading ? (
          <div
            className="flex min-h-64 items-center justify-center"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Loader2
                className="h-5 w-5 animate-spin"
                aria-hidden="true"
              />
              Loading transactions...
            </div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <WalletCards
                className="h-6 w-6 text-slate-400"
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No transactions found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Transaction
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Service
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Method
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {transactions.map(
                    (transaction) => {
                      const StatusIcon =
                        getStatusIcon(
                          transaction.status
                        );

                      return (
                        <tr
                          key={transaction._id}
                          className="transition hover:bg-slate-50/70"
                        >
                          <td className="px-5 py-4">
                            <p className="font-mono text-xs font-semibold text-slate-900">
                              {transaction.transactionId ||
                                "—"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatShortDate(
                                transaction.createdAt
                              )}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-medium text-slate-900">
                              {transaction.customer
                                ?.name || "Unknown customer"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {transaction.customer
                                ?.email || "—"}
                            </p>
                          </td>

                          <td className="max-w-[220px] px-5 py-4">
                            <p className="truncate text-sm text-slate-700">
                              {transaction.booking
                                ?.service?.title ||
                                "Booking"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Booking:{" "}
                              {transaction.booking
                                ?.status || "—"}
                            </p>
                          </td>

                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-slate-900">
                              {formatCurrency(
                                transaction.amount
                              )}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {getPaymentMethodLabel(
                              transaction.paymentMethod
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                                transaction.status
                              )}`}
                            >
                              <StatusIcon
                                className="h-3.5 w-3.5"
                                aria-hidden="true"
                              />

                              {transaction.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                openDetails(
                                  transaction
                                )
                              }
                              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                              aria-label={`View transaction ${transaction.transactionId || ""}`}
                            >
                              <Eye
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-slate-100 md:hidden">
              {transactions.map(
                (transaction) => {
                  const StatusIcon =
                    getStatusIcon(
                      transaction.status
                    );

                  return (
                    <article
                      key={transaction._id}
                      className="p-4 transition active:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-mono text-xs font-semibold text-slate-900">
                            {transaction.transactionId ||
                              "—"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatDate(
                              transaction.createdAt
                            )}
                          </p>
                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                            transaction.status
                          )}`}
                        >
                          <StatusIcon
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          {transaction.status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500">
                            Customer
                          </p>

                          <p className="mt-1 truncate text-sm font-medium text-slate-900">
                            {transaction.customer
                              ?.name ||
                              "Unknown customer"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Amount
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {formatCurrency(
                              transaction.amount
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Service
                          </p>

                          <p className="mt-1 truncate text-sm text-slate-700">
                            {transaction.booking
                              ?.service?.title ||
                              "Booking"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500">
                            Method
                          </p>

                          <p className="mt-1 text-sm text-slate-700">
                            {getPaymentMethodLabel(
                              transaction.paymentMethod
                            )}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          openDetails(transaction)
                        }
                        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Eye
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        View transaction
                      </button>
                    </article>
                  );
                }
              )}
            </div>
          </>
        )}

        {!loading &&
          transactions.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-slate-500">
                Page {pagination.page} of{" "}
                {pagination.totalPages}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.max(current - 1, 1)
                    )
                  }
                  disabled={!canGoPrevious}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  Previous
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setPage((current) =>
                      Math.min(
                        current + 1,
                        pagination.totalPages
                      )
                    )
                  }
                  disabled={!canGoNext}
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Next page"
                >
                  Next
                  <ChevronRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          )}
      </section>

      {/* Transaction details modal */}
      {selectedTransaction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDetails();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-details-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Transaction details
                </p>

                <h2
                  id="transaction-details-title"
                  className="mt-1 truncate font-mono text-sm font-semibold text-slate-900"
                >
                  {selectedTransaction.transactionId ||
                    "Transaction"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close transaction details"
              >
                <X
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>

            {detailsLoading && (
              <div
                className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500"
                role="status"
              >
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Loading latest transaction details...
              </div>
            )}

            <div className="space-y-6 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Amount
                  </p>

                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {formatCurrency(
                      selectedTransaction.amount
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${getStatusClasses(
                      selectedTransaction.status
                    )}`}
                  >
                    {selectedTransaction.status}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Payment
                </h3>

                <dl className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <dt className="text-sm text-slate-500">
                      Payment method
                    </dt>

                    <dd className="text-sm font-medium text-slate-900">
                      {getPaymentMethodLabel(
                        selectedTransaction.paymentMethod
                      )}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <dt className="text-sm text-slate-500">
                      Created
                    </dt>

                    <dd className="text-right text-sm font-medium text-slate-900">
                      {formatDate(
                        selectedTransaction.createdAt
                      )}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between gap-4 px-4 py-3">
                    <dt className="text-sm text-slate-500">
                      Paid at
                    </dt>

                    <dd className="text-right text-sm font-medium text-slate-900">
                      {formatDate(
                        selectedTransaction.paidAt
                      )}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Customer
                </h3>

                <div className="mt-3 rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedTransaction.customer
                      ?.name || "Unknown customer"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedTransaction.customer
                      ?.email || "—"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedTransaction.customer
                      ?.phone || "—"}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Booking
                </h3>

                <div className="mt-3 rounded-xl border border-slate-200 p-4">
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedTransaction.booking
                      ?.service?.title ||
                      "Booking"}
                  </p>

                  <dl className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <dt className="text-xs text-slate-500">
                        Booking status
                      </dt>

                      <dd className="mt-1 text-sm font-medium capitalize text-slate-900">
                        {selectedTransaction.booking
                          ?.status || "—"}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs text-slate-500">
                        Payment status
                      </dt>

                      <dd className="mt-1 text-sm font-medium capitalize text-slate-900">
                        {selectedTransaction.booking
                          ?.paymentStatus || "—"}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs text-slate-500">
                        Booking date
                      </dt>

                      <dd className="mt-1 text-sm font-medium text-slate-900">
                        {formatDate(
                          selectedTransaction.booking
                            ?.bookingDate
                        )}
                      </dd>
                    </div>

                    <div>
                      <dt className="text-xs text-slate-500">
                        Booking amount
                      </dt>

                      <dd className="mt-1 text-sm font-medium text-slate-900">
                        {formatCurrency(
                          selectedTransaction.booking
                            ?.amount
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={closeDetails}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Transactions;