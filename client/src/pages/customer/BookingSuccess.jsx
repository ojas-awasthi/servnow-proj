import { useEffect, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Home,
  LoaderCircle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import api from "../../services/api";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";

function BookingSuccess() {
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBooking = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/bookings/${bookingId}`
        );

        setBooking(response.data.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load your booking confirmation."
        );
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-50 px-4">
        <div
          className="flex items-center gap-3 text-sm text-slate-500"
          role="status"
          aria-live="polite"
        >
          <LoaderCircle
            className="h-5 w-5 animate-spin"
            aria-hidden="true"
          />

          Loading your booking confirmation...
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-50 px-4">
        <Card className="w-full max-w-md rounded-3xl p-8 text-center">
          <h1 className="text-xl font-bold text-slate-950">
            Confirmation unavailable
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            {error ||
              "We couldn't find this booking confirmation."}
          </p>

          <Link
            to="/dashboard/bookings"
            className="mt-6 inline-flex"
          >
            <Button>
              View my bookings
              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Button>
          </Link>
        </Card>
      </main>
    );
  }

  const service = booking.service;

  const amount = Number(booking.amount || 0);

  const isPaid =
    booking.paymentStatus === "paid";

  /*
   * The transaction endpoint is intentionally not called here.
   *
   * BookingSuccess is backed by the booking itself, which means
   * the page remains useful after a browser refresh where React
   * Router location.state is no longer available.
   */

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Card className="overflow-hidden rounded-3xl">
          {/* Confirmation header */}
          <div className="px-6 py-10 text-center sm:px-10 sm:py-14">
            <div
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50"
              aria-hidden="true"
            >
              <CheckCircle2 className="h-9 w-9 text-emerald-600" />
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Booking confirmed
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              You're all set!
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
              Your service booking has been created successfully.
              {isPaid
                ? " Your mock payment has also been completed."
                : " Payment is still pending."}
            </p>

            {/* Core information */}
            <div className="mt-8 grid gap-3 text-left sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Booking ID
                </p>

                <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                  {booking._id}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Payment
                </p>

                <div className="mt-1">
                  <Badge
                    variant={
                      isPaid
                        ? "success"
                        : "warning"
                    }
                  >
                    {booking.paymentStatus || "pending"}
                  </Badge>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Service
                </p>

                <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">
                  {service?.title || "ServNOW service"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Total
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  ₹{amount.toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            {/* Booking date */}
            {booking.bookingDate && (
              <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-left">
                <p className="text-xs text-slate-400">
                  Scheduled for
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {new Date(
                    booking.bookingDate
                  ).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Next steps */}
          <div className="border-t border-slate-100 bg-white px-6 py-6 sm:px-10">
            <div className="flex items-start gap-3">
              <ClipboardCheck
                className="mt-0.5 h-5 w-5 shrink-0 text-slate-500"
                aria-hidden="true"
              />

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  What's next?
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  You can track this booking, review its status and
                  view its details from your customer dashboard.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/dashboard/bookings"
                className="flex-1"
              >
                <Button className="w-full">
                  View my bookings

                  <ArrowRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </Button>
              </Link>

              <Link
                to="/"
                className="flex-1"
              >
                <Button
                  variant="secondary"
                  className="w-full"
                >
                  <Home
                    className="h-4 w-4"
                    aria-hidden="true"
                  />

                  Back home
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}

export default BookingSuccess;