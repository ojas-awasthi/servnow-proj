import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MapPin,
  PackageCheck,
  UserRound,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";

import api from "../../../services/api";
import Badge from "../../../components/common/Badge";
import Card from "../../../components/common/Card";
import Skeleton from "../../../components/common/Skeleton";
import Button from "../../../components/common/Button";


const statusSteps = [
  {
    key: "pending",
    label: "Booking placed",
  },
  {
    key: "confirmed",
    label: "Booking confirmed",
  },
  {
    key: "in_progress",
    label: "Service in progress",
  },
  {
    key: "completed",
    label: "Service completed",
  },
];

function BookingDetails() {
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
            "Unable to load this booking."
        );
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  const currentStep = useMemo(() => {
    if (!booking) return 0;

    if (booking.status === "cancelled") {
      return -1;
    }

    const index = statusSteps.findIndex(
      (step) => step.key === booking.status
    );

    return index >= 0 ? index : 0;
  }, [booking]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold text-slate-950">
            Unable to load booking
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error || "Booking not found."}
          </p>

          <Link
            to="/dashboard/bookings"
            className="mt-5 inline-block text-sm font-semibold text-slate-950 underline underline-offset-4"
          >
            Back to bookings
          </Link>
        </div>
      </main>
    );
  }

  const serviceTitle =
    booking.service?.title || "Service";

  const bookingDate = booking.bookingDate
    ? new Date(booking.bookingDate).toLocaleString(
        "en-IN",
        {
          dateStyle: "full",
          timeStyle: "short",
        }
      )
    : "Date unavailable";

  const statusVariant =
    booking.status === "cancelled"
      ? "danger"
      : booking.status === "completed" ||
          booking.status === "confirmed"
        ? "success"
        : booking.status === "in_progress"
          ? "info"
          : "warning";

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to="/dashboard/bookings"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-950"
        >
          <ArrowLeft
            className="h-4 w-4"
            aria-hidden="true"
          />
          Back to bookings
        </Link>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Booking details
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {serviceTitle}
            </h1>

            <p className="mt-2 break-all text-xs text-slate-400">
              Booking ID: {booking._id}
            </p>
          </div>

          <Badge variant={statusVariant}>
            {booking.status.replace("_", " ")}
          </Badge>
        </div>

        {/* TRACKING */}
        <Card className="mt-8 rounded-3xl p-6 sm:p-8">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              Booking progress
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Track the current status of your service.
            </p>
          </div>

          {booking.status === "cancelled" ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5">
              <p className="text-sm font-semibold text-red-700">
                This booking has been cancelled.
              </p>
            </div>
          ) : (
            <div className="mt-8">
              <div className="grid gap-6 sm:grid-cols-4">
                {statusSteps.map((step, index) => {
                  const completed = index <= currentStep;

                  return (
                    <div
                      key={step.key}
                      className="relative"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={[
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                            completed
                              ? "bg-slate-950 text-white"
                              : "bg-slate-100 text-slate-400",
                          ].join(" ")}
                        >
                          {completed ? (
                            <CheckCircle2
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          ) : (
                            <Clock3
                              className="h-5 w-5"
                              aria-hidden="true"
                            />
                          )}
                        </div>

                        <div>
                          <p
                            className={[
                              "text-sm font-semibold",
                              completed
                                ? "text-slate-950"
                                : "text-slate-400",
                            ].join(" ")}
                          >
                            {step.label}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {completed
                              ? "Completed"
                              : "Pending"}
                          </p>
                        </div>
                      </div>

                      {index < statusSteps.length - 1 && (
                        <div
                          className={[
                            "absolute left-[18px] top-9 hidden h-6 w-px sm:block",
                            index < currentStep
                              ? "bg-slate-950"
                              : "bg-slate-200",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* SERVICE */}
          <Card className="rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-slate-950">
              Service
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs text-slate-400">
                  Service
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {serviceTitle}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Provider
                </p>

                <div className="mt-1 flex items-center gap-2">
                  <UserRound
                    className="h-4 w-4 text-slate-400"
                    aria-hidden="true"
                  />

                  <p className="text-sm font-medium text-slate-900">
                    {booking.provider?.name ||
                      "Provider pending"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Duration
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {booking.service?.duration ||
                    "Flexible"}
                </p>
              </div>
            </div>
          </Card>

          {/* APPOINTMENT */}
          <Card className="rounded-3xl p-6">
            <h2 className="text-lg font-semibold text-slate-950">
              Appointment
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs text-slate-400">
                  Date & time
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {bookingDate}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Address
                </p>

                <div className="mt-1 flex gap-2">
                  <MapPin
                    className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                    aria-hidden="true"
                  />

                  <p className="text-sm font-medium leading-5 text-slate-900">
                    {booking.address}
                  </p>
                </div>
              </div>

              {booking.notes && (
                <div>
                  <p className="text-xs text-slate-400">
                    Notes
                  </p>

                  <p className="mt-1 text-sm leading-5 text-slate-700">
                    {booking.notes}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* PAYMENT */}
        <Card className="mt-6 rounded-3xl p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-slate-400">
                Payment status
              </p>

              <div className="mt-1 flex items-center gap-3">
                <Badge
                  variant={
                    booking.paymentStatus === "paid"
                      ? "success"
                      : "warning"
                  }
                >
                  {booking.paymentStatus}
                </Badge>

                <span className="text-lg font-bold text-slate-950">
                  ₹
                  {Number(
                    booking.amount || 0
                  ).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {booking.paymentStatus !== "paid" &&
              booking.status !== "cancelled" && (
                <Link
                  to={`/checkout/${booking._id}`}
                >
                  <Button>
                    Complete payment
                  </Button>
                </Link>
              )}
          </div>
        </Card>

        {booking.status === "completed" && booking.service?._id && (
  <Card className="mt-6 rounded-3xl p-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-950">
          How was your experience?
        </p>

        <p className="mt-1 text-sm text-slate-500">
          Share your experience with other customers.
        </p>
      </div>

      <Link
        to={`/reviews/${booking.service._id}`}
      >
        <Button>
          Write a review
        </Button>
      </Link>
    </div>
  </Card>
)}
      </div>
    </main>
  );
}

export default BookingDetails;