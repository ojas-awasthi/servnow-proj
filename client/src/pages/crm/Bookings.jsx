import { useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  CreditCard,
  FileText,
  Loader2,
  MapPin,
  Search,
  UserRound,
  X,
} from "lucide-react";

import api from "../../services/api";
import CRMPageHeader from "../../components/crm/CRMPageHeader";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingTransaction, setBookingTransaction] = useState(null);
const [transactionLoading, setTransactionLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
const [statusUpdateError, setStatusUpdateError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (status) {
        params.status = status;
      }

      if (paymentStatus) {
        params.paymentStatus = paymentStatus;
      }

      const response = await api.get("/bookings", {
        params,
      });

      const data = response.data.data;

      setBookings(data?.bookings || data || []);

      if (data?.pagination) {
        setPagination((current) => ({
          ...current,
          ...data.pagination,
        }));
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load bookings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [pagination.page, pagination.limit, status, paymentStatus]);

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount) => {
    if (amount === undefined || amount === null) {
      return "—";
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCustomerName = (booking) => {
    if (typeof booking.customer === "object") {
      return booking.customer?.name || "Unknown customer";
    }

    return "Unknown customer";
  };

  const getServiceName = (booking) => {
    if (typeof booking.service === "object") {
      return booking.service?.title || "Unknown service";
    }

    return "Unknown service";
  };

  const getProviderName = (booking) => {
    if (typeof booking.provider === "object") {
      return booking.provider?.name || "Unassigned";
    }

    return "Unassigned";
  };

  const getStatusClasses = (value) => {
    switch (value) {
      case "confirmed":
        return "bg-blue-50 text-blue-700";

      case "in_progress":
        return "bg-amber-50 text-amber-700";

      case "completed":
        return "bg-emerald-50 text-emerald-700";

      case "cancelled":
        return "bg-red-50 text-red-700";

      case "pending":
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getPaymentClasses = (value) => {
    switch (value) {
      case "paid":
        return "bg-emerald-50 text-emerald-700";

      case "failed":
        return "bg-red-50 text-red-700";

      case "refunded":
        return "bg-violet-50 text-violet-700";

      case "pending":
      default:
        return "bg-amber-50 text-amber-700";
    }
  };

  const formatStatus = (value) => {
    if (!value) return "Unknown";

    return value
      .replaceAll("_", " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
  };

  const normalizedSearch = search.trim().toLowerCase();

  const filteredBookings = bookings.filter((booking) => {
    if (!normalizedSearch) return true;

    const searchableText = [
      booking._id,
      getCustomerName(booking),
      getServiceName(booking),
      getProviderName(booking),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedSearch);
  });

  const handlePreviousPage = () => {
    if (pagination.page <= 1) return;

    setPagination((current) => ({
      ...current,
      page: current.page - 1,
    }));
  };

const handleStatusUpdate = async (nextStatus) => {
  if (!selectedBooking?._id) return;

  if (selectedBooking.status === nextStatus) return;

  try {
    setUpdatingStatus(true);
    setStatusUpdateError("");

    const response = await api.patch(
      `/bookings/${selectedBooking._id}/status`,
      {
        status: nextStatus,
      }
    );

    const updatedBooking = response.data.data;

    setBookings((current) =>
      current.map((booking) =>
        booking._id === updatedBooking._id
          ? updatedBooking
          : booking
      )
    );

    setSelectedBooking(updatedBooking);
  } catch (err) {
    setStatusUpdateError(
      err.response?.data?.message ||
        "Unable to update booking status. Please try again."
    );
  } finally {
    setUpdatingStatus(false);
  }
};


const fetchBookingTransaction = async (bookingId) => {
  try {
    setTransactionLoading(true);
    setBookingTransaction(null);

    const response = await api.get("/transactions", {
      params: {
        booking: bookingId,
      },
    });

    const data = response.data.data;

    const transactions = data?.transactions || data || [];

    setBookingTransaction(transactions[0] || null);
  } catch (err) {
    // Transaction information is supplementary to booking details.
    // Keep the booking view usable if transaction lookup fails.
    setBookingTransaction(null);
  } finally {
    setTransactionLoading(false);
  }
};

  const handleNextPage = () => {
    if (pagination.page >= pagination.pages) return;

    setPagination((current) => ({
      ...current,
      page: current.page + 1,
    }));
  };

  return (
    <div className="space-y-6">
      <CRMPageHeader
        eyebrow="Operations"
        title="Bookings"
        description="Monitor customer bookings, service providers, payment status, and booking progress."
      />

      {/* Filters */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />

            <label htmlFor="booking-search" className="sr-only">
              Search bookings
            </label>

            <input
              id="booking-search"
              type="search"
              value={search}
              onChange={(event) => {
  setSearch(event.target.value);
  setPagination((current) => ({
    ...current,
    page: 1,
  }));
}}
              placeholder="Search booking, customer, service, or provider..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-950/10"
            />
          </div>

          <div>
            <label
              htmlFor="booking-status"
              className="sr-only"
            >
              Filter by booking status
            </label>

            <select
              id="booking-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);

                setPagination((current) => ({
                  ...current,
                  page: 1,
                }));
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-950/10"
            >
              <option value="">All booking statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="in_progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="booking-payment-status"
              className="sr-only"
            >
              Filter by payment status
            </label>

            <select
              id="booking-payment-status"
              value={paymentStatus}
              onChange={(event) => {
                setPaymentStatus(event.target.value);

                setPagination((current) => ({
                  ...current,
                  page: 1,
                }));
              }}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-950/10"
            >
              <option value="">All payment statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          />

          <div className="flex-1">
            <p className="font-semibold">
              Unable to load bookings
            </p>

            <p className="mt-1">{error}</p>

            <button
              type="button"
              onClick={fetchBookings}
              className="mt-3 font-semibold underline underline-offset-2 transition hover:text-red-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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

              Loading bookings...
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <ClipboardList
                className="h-6 w-6 text-slate-500"
                aria-hidden="true"
              />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-slate-950">
              {normalizedSearch || status || paymentStatus
                ? "No bookings found"
                : "No bookings yet"}
            </h2>

            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
              {normalizedSearch || status || paymentStatus
                ? "Try adjusting your search or filters."
                : "Bookings will appear here once customers make reservations."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1050px]">
                <caption className="sr-only">
                  Service bookings
                </caption>

                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Booking
                    </th>

                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Customer
                    </th>

                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Service
                    </th>

                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Provider
                    </th>

                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Date
                    </th>

                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Amount
                    </th>

                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Status
                    </th>

                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Payment
                    </th>
                    <th
  scope="col"
  className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500"
>
  Actions
</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking._id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-mono text-xs font-semibold text-slate-700">
                            #{booking._id?.slice(-8)}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {formatDateTime(booking.createdAt)}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-950">
                          {getCustomerName(booking)}
                        </p>
                      </td>

                      <td className="max-w-[220px] px-6 py-4">
                        <p className="truncate text-sm text-slate-700">
                          {getServiceName(booking)}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-600">
                          {getProviderName(booking)}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-2">
                          <CalendarDays
                            className="h-4 w-4 text-slate-400"
                            aria-hidden="true"
                          />

                          <span className="text-sm text-slate-600">
                            {formatDate(booking.bookingDate)}
                          </span>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-slate-800">
                        {formatAmount(booking.amount)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                            booking.status
                          )}`}
                        >
                          {formatStatus(booking.status)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPaymentClasses(
                            booking.paymentStatus
                          )}`}
                        >
                          {formatStatus(booking.paymentStatus)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
  <button
    type="button"
    onClick={() => {
  setSelectedBooking(booking);
setStatusUpdateError("");
setBookingTransaction(null);
fetchBookingTransaction(booking._id);
  fetchBookingTransaction(booking._id);
}}
    aria-label={`View booking ${booking._id}`}
    className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
  >
    View
  </button>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredBookings.map((booking) => (
                <article
                  key={booking._id}
                  className="p-4 transition-colors hover:bg-slate-50/80"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-mono text-xs font-semibold text-slate-700">
                        #{booking._id?.slice(-8)}
                      </p>

                      <h2 className="mt-1 truncate text-sm font-semibold text-slate-950">
                        {getServiceName(booking)}
                      </h2>
                    </div>

                    <span className="shrink-0 text-sm font-semibold text-slate-800">
                      {formatAmount(booking.amount)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Customer
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {getCustomerName(booking)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Provider
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {getProviderName(booking)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarDays
                        className="h-4 w-4 text-slate-400"
                        aria-hidden="true"
                      />

                      <span className="text-sm text-slate-600">
                        {formatDate(booking.bookingDate)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                        booking.status
                      )}`}
                    >
                      {formatStatus(booking.status)}
                    </span>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getPaymentClasses(
                        booking.paymentStatus
                      )}`}
                    >
                      Payment: {formatStatus(booking.paymentStatus)}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-slate-400">
                    Created {formatDateTime(booking.createdAt)}
                  </p>
                  <button
  type="button"
  onClick={() => {
  setSelectedBooking(booking);
setStatusUpdateError("");
setBookingTransaction(null);
fetchBookingTransaction(booking._id);
  fetchBookingTransaction(booking._id);
}}
  className="mt-4 inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
>
  View details
</button>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Pagination */}
      {!loading && pagination.total > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredBookings.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {pagination.total}
            </span>{" "}
            bookings
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePreviousPage}
              disabled={pagination.page <= 1}
              aria-label="Previous page"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
            >
              <ChevronLeft
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>

            <span className="min-w-20 text-center text-sm font-medium text-slate-600">
              Page {pagination.page} of {pagination.pages}
            </span>

            <button
              type="button"
              onClick={handleNextPage}
              disabled={pagination.page >= pagination.pages}
              aria-label="Next page"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
            >
              <ChevronRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      )}


      {/* Booking Details Modal */}
{selectedBooking && (
  <div
    className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
    role="presentation"
    onMouseDown={(event) => {
  if (
    !updatingStatus &&
    event.target === event.currentTarget
  ) {
    setSelectedBooking(null);
    setBookingTransaction(null);
    setStatusUpdateError("");
  }
}}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-details-title"
      className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white p-5 sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Booking details
          </p>

          <h2
            id="booking-details-title"
            className="mt-1 font-mono text-lg font-semibold text-slate-950"
          >
            #{selectedBooking._id?.slice(-8)}
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setSelectedBooking(null)}
          disabled={updatingStatus}
          aria-label="Close booking details"
          className="disabled:cursor-not-allowed disabled:opacity-50 flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
        >
        
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Body */}
      <div className="space-y-5 p-5 sm:p-6">
        {/* Status summary */}
<div className="space-y-3">
  <div className="flex flex-wrap items-center gap-2">
    <span
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClasses(
        selectedBooking.status
      )}`}
    >
      {formatStatus(selectedBooking.status)}
    </span>

    <span
      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${getPaymentClasses(
        selectedBooking.paymentStatus
      )}`}
    >
      Payment: {formatStatus(selectedBooking.paymentStatus)}
    </span>
  </div>

  <div>
    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
      Update booking status
    </p>

    <div className="flex flex-wrap gap-2">
      {[
        { value: "pending", label: "Pending" },
        { value: "confirmed", label: "Confirmed" },
        { value: "in_progress", label: "In progress" },
        { value: "completed", label: "Completed" },
        { value: "cancelled", label: "Cancelled" },
      ].map((option) => {
        const isActive =
          selectedBooking.status === option.value;

        return (
          <button
            key={option.value}
            type="button"
            disabled={updatingStatus || isActive}
            onClick={() => handleStatusUpdate(option.value)}
            aria-label={`Set booking status to ${option.label}`}
            aria-pressed={isActive}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 ${
              isActive
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {isActive && (
              <Check
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
            )}

            {option.label}
          </button>
        );
      })}
    </div>
  </div>

  {updatingStatus && (
    <div
      className="flex items-center gap-2 text-xs text-slate-500"
      role="status"
      aria-live="polite"
    >
      <Loader2
        className="h-3.5 w-3.5 animate-spin"
        aria-hidden="true"
      />
      Updating booking status...
    </div>
  )}

  {statusUpdateError && (
    <div
      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700"
      role="alert"
    >
      <AlertCircle
        className="mt-0.5 h-4 w-4 shrink-0"
        aria-hidden="true"
      />

      <span>{statusUpdateError}</span>
    </div>
  )}
</div>
        {/* Service */}
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <ClipboardList
                className="h-5 w-5 text-slate-600"
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Service
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-950">
                {getServiceName(selectedBooking)}
              </p>

              {selectedBooking.service?.category?.name && (
                <p className="mt-1 text-xs text-slate-500">
                  {selectedBooking.service.category.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* People */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <UserRound
                className="h-4 w-4 text-slate-400"
                aria-hidden="true"
              />

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Customer
              </p>
            </div>

            <p className="mt-2 text-sm font-semibold text-slate-800">
              {getCustomerName(selectedBooking)}
            </p>

            {selectedBooking.customer?.email && (
              <p className="mt-1 break-all text-xs text-slate-500">
                {selectedBooking.customer.email}
              </p>
            )}

            {selectedBooking.customer?.phone && (
              <p className="mt-1 text-xs text-slate-500">
                {selectedBooking.customer.phone}
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <UserRound
                className="h-4 w-4 text-slate-400"
                aria-hidden="true"
              />

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Provider
              </p>
            </div>

            <p className="mt-2 text-sm font-semibold text-slate-800">
              {getProviderName(selectedBooking)}
            </p>

            {selectedBooking.provider?.email && (
              <p className="mt-1 break-all text-xs text-slate-500">
                {selectedBooking.provider.email}
              </p>
            )}

            {selectedBooking.provider?.phone && (
              <p className="mt-1 text-xs text-slate-500">
                {selectedBooking.provider.phone}
              </p>
            )}
          </div>
        </div>

        {/* Booking information */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <CalendarDays
                className="h-4 w-4 text-slate-400"
                aria-hidden="true"
              />

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Booking date
              </p>
            </div>

            <p className="mt-2 text-sm font-medium text-slate-700">
              {formatDateTime(selectedBooking.bookingDate)}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <Clock3
                className="h-4 w-4 text-slate-400"
                aria-hidden="true"
              />

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Created
              </p>
            </div>

            <p className="mt-2 text-sm font-medium text-slate-700">
              {formatDateTime(selectedBooking.createdAt)}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Amount
            </p>

            <p className="mt-2 text-lg font-semibold text-slate-950">
              {formatAmount(selectedBooking.amount)}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Booking ID
            </p>

            <p className="mt-2 break-all font-mono text-xs font-medium text-slate-700">
              {selectedBooking._id}
            </p>
          </div>
        </div>

{/* Payment / Transaction */}
<div className="rounded-2xl border border-slate-200 p-4">
  <div className="flex items-center gap-2">
    <CreditCard
      className="h-4 w-4 text-slate-400"
      aria-hidden="true"
    />

    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
      Payment & transaction
    </p>
  </div>

  {transactionLoading ? (
    <div
      className="mt-4 flex items-center gap-2 text-xs text-slate-500"
      role="status"
      aria-live="polite"
    >
      <Loader2
        className="h-4 w-4 animate-spin"
        aria-hidden="true"
      />
      Loading transaction details...
    </div>
  ) : bookingTransaction ? (
    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div>
        <p className="text-xs text-slate-400">
          Transaction ID
        </p>

        <p className="mt-1 break-all font-mono text-xs font-medium text-slate-700">
          {bookingTransaction.transactionId || "—"}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-400">
          Payment method
        </p>

        <p className="mt-1 text-sm font-medium text-slate-700">
          {formatStatus(bookingTransaction.paymentMethod)}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-400">
          Transaction status
        </p>

        <span
          className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
            bookingTransaction.status === "success"
              ? "bg-emerald-50 text-emerald-700"
              : bookingTransaction.status === "failed"
                ? "bg-red-50 text-red-700"
                : bookingTransaction.status === "refunded"
                  ? "bg-violet-50 text-violet-700"
                  : "bg-amber-50 text-amber-700"
          }`}
        >
          {formatStatus(bookingTransaction.status)}
        </span>
      </div>

      <div>
        <p className="text-xs text-slate-400">
          Transaction amount
        </p>

        <p className="mt-1 text-sm font-semibold text-slate-950">
          {formatAmount(bookingTransaction.amount)}
        </p>
      </div>

      {bookingTransaction.paidAt && (
        <div className="sm:col-span-2">
          <p className="text-xs text-slate-400">
            Paid at
          </p>

          <p className="mt-1 text-sm text-slate-700">
            {formatDateTime(bookingTransaction.paidAt)}
          </p>
        </div>
      )}
    </div>
  ) : (
    <div className="mt-3 rounded-xl bg-slate-50 p-3">
      <p className="text-sm font-medium text-slate-600">
        No transaction found for this booking.
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-400">
        This can occur when payment is still pending or no
        transaction has been created yet.
      </p>
    </div>
  )}
</div>

        {/* Address */}
        {selectedBooking.address && (
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <MapPin
                className="h-4 w-4 text-slate-400"
                aria-hidden="true"
              />

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Service address
              </p>
            </div>

            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
              {selectedBooking.address}
            </p>
          </div>
        )}

        {/* Notes */}
        {selectedBooking.notes && (
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-center gap-2">
              <FileText
                className="h-4 w-4 text-slate-400"
                aria-hidden="true"
              />

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Booking notes
              </p>
            </div>

            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
              {selectedBooking.notes}
            </p>
          </div>
        )}

        {/* Updated */}
        {selectedBooking.updatedAt && (
          <p className="text-xs text-slate-400">
            Last updated {formatDateTime(selectedBooking.updatedAt)}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 p-5 sm:p-6">
        <button
  type="button"
  disabled={updatingStatus}
  onClick={() => {
    setSelectedBooking(null);
    setBookingTransaction(null);
    setStatusUpdateError("");
  }}
  className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

export default Bookings;