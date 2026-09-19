import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Filter,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Badge from "../../../components/common/Badge";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import Select from "../../../components/common/Select";
import Skeleton from "../../../components/common/Skeleton";
import { fetchMyBookings } from "../../../features/bookings/bookingsSlice";

const statusOptions = [
  { value: "all", label: "All bookings" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function Bookings() {
  const dispatch = useDispatch();

  const {
    items: bookings,
    loading,
    error,
    pagination,
  } = useSelector((state) => state.bookings);

  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const limit = 10;

  useEffect(() => {
    const params = {
      page,
      limit,
    };

    if (status !== "all") {
      params.status = status;
    }

    dispatch(fetchMyBookings(params));
  }, [dispatch, status, page]);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  const currentPage = pagination?.page || page;
  const totalPages = pagination?.totalPages || 1;
  const total = pagination?.total || 0;

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Customer dashboard
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              My bookings
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              View and track all your service bookings.
            </p>
          </div>

          <Link to="/services">
            <Button>
              Book a service
              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Button>
          </Link>
        </div>

        {/* FILTER */}
        <Card className="mt-6 rounded-2xl p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Filter
                className="h-4 w-4"
                aria-hidden="true"
              />

              Filter
            </div>

            <div className="w-full sm:max-w-xs">
              <Select
                id="booking-status"
                label="Booking status"
                value={status}
                onChange={handleStatusChange}
                options={statusOptions}
              />
            </div>
          </div>
        </Card>

        {/* CONTENT */}
        <div className="mt-6">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </div>
          ) : error ? (
            <Card className="rounded-2xl border-red-200 bg-red-50 p-5">
              <p
                className="text-sm font-medium text-red-700"
                role="alert"
              >
                {error}
              </p>
            </Card>
          ) : bookings.length === 0 ? (
            <Card className="rounded-3xl p-10 text-center">
              <CalendarDays
                className="mx-auto h-10 w-10 text-slate-300"
                aria-hidden="true"
              />

              <h2 className="mt-4 text-lg font-semibold text-slate-950">
                No bookings found
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {status === "all"
                  ? "You haven't booked a service yet."
                  : `You don't have any ${status.replace(
                      "_",
                      " "
                    )} bookings.`}
              </p>

              <Link
                to="/services"
                className="mt-5 inline-block"
              >
                <Button>
                  Explore services
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                />
              ))}
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {!loading && total > 0 && (
          <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-5 sm:flex-row">
            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-medium text-slate-600">
                {(currentPage - 1) * limit + 1}
              </span>
              {"–"}
              <span className="font-medium text-slate-600">
                {Math.min(
                  currentPage * limit,
                  total
                )}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-600">
                {total}
              </span>{" "}
              bookings
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage <= 1 || loading}
                onClick={() =>
                  setPage((current) =>
                    Math.max(1, current - 1)
                  )
                }
                aria-label="Previous bookings page"
              >
                <ArrowLeft
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                Previous
              </Button>

              <span
                className="min-w-20 text-center text-xs font-medium text-slate-500"
                aria-live="polite"
              >
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="secondary"
                size="sm"
                disabled={
                  currentPage >= totalPages ||
                  loading
                }
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      totalPages,
                      current + 1
                    )
                  )
                }
                aria-label="Next bookings page"
              >
                Next
                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function BookingCard({ booking }) {
  const statusVariant = {
    pending: "warning",
    confirmed: "success",
    in_progress: "info",
    completed: "success",
    cancelled: "danger",
  };

  const bookingDate = booking.bookingDate
    ? new Date(
        booking.bookingDate
      ).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Date unavailable";

  return (
    <Link
      to={`/dashboard/bookings/${booking._id}`}
      className="block"
      aria-label={`View booking for ${
        booking.service?.title || "service"
      }`}
    >
      <Card interactive className="rounded-2xl p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-semibold text-slate-950">
                {booking.service?.title ||
                  "Service"}
              </h2>

              <Badge
                variant={
                  statusVariant[booking.status] ||
                  "default"
                }
              >
                {booking.status.replace(
                  "_",
                  " "
                )}
              </Badge>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {booking.provider?.name ||
                "Provider pending assignment"}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              {bookingDate}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Payment
            </p>

            <Badge
              variant={
                booking.paymentStatus === "paid"
                  ? "success"
                  : "warning"
              }
            >
              {booking.paymentStatus}
            </Badge>
          </div>

          <div className="flex items-center justify-between gap-4 lg:justify-end">
            <div className="lg:text-right">
              <p className="text-xs text-slate-400">
                Total
              </p>

              <p className="mt-0.5 text-lg font-bold text-slate-950">
                ₹
                {Number(
                  booking.amount || 0
                ).toLocaleString("en-IN")}
              </p>
            </div>

            <ArrowRight
              className="h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default Bookings;