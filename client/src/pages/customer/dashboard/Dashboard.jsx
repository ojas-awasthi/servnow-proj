import { useEffect } from "react";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  PackageCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Card from "../../../components/common/Card";
import Badge from "../../../components/common/Badge";
import Button from "../../../components/common/Button";
import Skeleton from "../../../components/common/Skeleton";
import { fetchMyBookings } from "../../../features/bookings/bookingsSlice";

function Dashboard() {
  const dispatch = useDispatch();

  const {
    items: bookings,
    loading,
    error,
    pagination,
  } = useSelector((state) => state.bookings);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(
      fetchMyBookings({
        page: 1,
        limit: 100,
      })
    );
  }, [dispatch]);

  const upcomingBookings = bookings.filter((booking) =>
    ["pending", "confirmed", "in_progress"].includes(
      booking.status
    )
  );

  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed"
  );

  const paidBookings = bookings.filter(
    (booking) => booking.paymentStatus === "paid"
  );

  const recentBookings = bookings.slice(0, 5);

  const getStatusVariant = (status) => {
    switch (status) {
      case "confirmed":
      case "completed":
        return "success";

      case "in_progress":
        return "info";

      case "cancelled":
        return "danger";

      default:
        return "warning";
    }
  };

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div>
          <p className="text-sm font-medium text-slate-500">
            Customer dashboard
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Welcome back,{" "}
            {user?.name?.split(" ")[0] || "there"}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your bookings and keep track of your services.
          </p>
        </div>

        {/* QUICK ACTION */}
        <div className="mt-6">
          <Card className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-medium text-slate-300">
                  Need something done?
                </p>

                <h2 className="mt-1 text-xl font-bold sm:text-2xl">
                  Find your next service
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
                  Browse available services and book a provider
                  whenever you need one.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  to="/services"
                  className="w-full sm:w-auto"
                >
                  <Button
                    className="w-full !bg-white !text-slate-950 hover:!bg-slate-100 sm:w-auto"
                  >
                    Browse services
                    <ArrowRight
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  </Button>
                </Link>

                <Link
                  to="/wishlist"
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="secondary"
                    className="w-full !border-slate-700 !bg-slate-900 !text-white hover:!bg-slate-800 sm:w-auto"
                  >
                    View wishlist
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>

        {/* STATS */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <>
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
              <Skeleton className="h-28 rounded-2xl" />
            </>
          ) : (
            <>
              <StatCard
                icon={CalendarDays}
                label="Total bookings"
                value={
                  pagination?.total ??
                  bookings.length
                }
              />

              <StatCard
                icon={Clock3}
                label="Upcoming"
                value={upcomingBookings.length}
              />

              <StatCard
                icon={CheckCircle2}
                label="Completed"
                value={completedBookings.length}
              />

              <StatCard
                icon={PackageCheck}
                label="Paid bookings"
                value={paidBookings.length}
              />
            </>
          )}
        </div>

        {/* RECENT BOOKINGS */}
        <div className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Recent bookings
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Keep an eye on your latest service activity.
              </p>
            </div>

            <Link
              to="/dashboard/bookings"
              className="hidden text-sm font-semibold text-slate-950 underline underline-offset-4 sm:block"
            >
              View all
            </Link>
          </div>

          <div className="mt-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
                <Skeleton className="h-24 rounded-2xl" />
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
            ) : recentBookings.length === 0 ? (
              <Card className="rounded-2xl p-8 text-center">
                <CalendarDays
                  className="mx-auto h-8 w-8 text-slate-300"
                  aria-hidden="true"
                />

                <h3 className="mt-3 text-sm font-semibold text-slate-900">
                  No bookings yet
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Your bookings will appear here.
                </p>

                <Link
                  to="/services"
                  className="mt-4 inline-block"
                >
                  <Button size="sm">
                    Explore services
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <BookingRow
                    key={booking._id}
                    booking={booking}
                    getStatusVariant={getStatusVariant}
                  />
                ))}
              </div>
            )}
          </div>

          <Link
            to="/dashboard/bookings"
            className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-slate-950 sm:hidden"
          >
            View all bookings
            <ArrowRight
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </main>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"
          aria-hidden="true"
        >
          <Icon className="h-5 w-5 text-slate-600" />
        </div>
      </div>
    </Card>
  );
}

function BookingRow({
  booking,
  getStatusVariant,
}) {
  const serviceTitle =
    booking.service?.title || "Service";

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
      aria-label={`View booking for ${serviceTitle}`}
    >
      <Card interactive className="rounded-2xl p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-slate-950">
                {serviceTitle}
              </h3>

              <Badge
                variant={getStatusVariant(booking.status)}
              >
                {booking.status.replace("_", " ")}
              </Badge>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              {bookingDate}
            </p>

            <p className="mt-1 text-xs text-slate-400">
              {booking.provider?.name ||
                "Provider pending assignment"}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 sm:justify-end">
            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-400">
                Amount
              </p>

              <p className="mt-0.5 text-sm font-bold text-slate-950">
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

export default Dashboard;