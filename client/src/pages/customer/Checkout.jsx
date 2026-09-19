import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Skeleton from "../../components/common/Skeleton";

function Checkout() {
  const { bookingId } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mock");

  useEffect(() => {
    const loadBooking = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/bookings/${bookingId}`);

        setBooking(response.data.data);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load your booking."
        );
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [bookingId]);

  const handlePayment = async () => {
    try {
      setPaymentLoading(true);
      setPaymentError("");

      const response = await api.post("/transactions/pay", {
        booking: bookingId,
        paymentMethod,
      });

      const transaction = response.data.data;

      navigate(`/booking-success/${bookingId}`, {
        replace: true,
        state: {
          transaction,
        },
      });
    } catch (requestError) {
      setPaymentError(
        requestError.response?.data?.message ||
          "Payment could not be completed."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-2/3" />

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <Skeleton className="h-[520px] rounded-3xl" />
            <Skeleton className="h-[360px] rounded-3xl" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !booking) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold text-slate-950">
            Unable to load checkout
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error || "This booking could not be found."}
          </p>

          <Link
            to="/services"
            className="mt-5 inline-flex text-sm font-semibold text-slate-950 underline underline-offset-4"
          >
            Back to services
          </Link>
        </div>
      </main>
    );
  }

  const service = booking.service;
  const provider = booking.provider;

  const amount = Number(booking.amount || 0);

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to={`/services/${service?._id || ""}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-950"
        >
          <ArrowLeft
            className="h-4 w-4"
            aria-hidden="true"
          />
          Back to service
        </Link>

        <div className="mt-6">
          <p className="text-sm font-medium text-slate-500">
            Secure checkout
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Complete your booking
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review your booking details before completing payment.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* PAYMENT */}
          <Card className="rounded-3xl p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Payment method
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Choose how you want to complete this test payment.
                </p>
              </div>

              <LockKeyhole
                className="h-5 w-5 shrink-0 text-slate-400"
                aria-hidden="true"
              />
            </div>

            {paymentError && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {paymentError}
              </div>
            )}

            <div className="mt-7 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("mock");
                  setPaymentError("");
                }}
                className={[
                  "flex w-full items-center gap-4 rounded-2xl border p-4 text-left",
                  "transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-950/10",
                  paymentMethod === "mock"
                    ? "border-slate-950 bg-slate-50"
                    : "border-slate-200 bg-white hover:border-slate-300",
                ].join(" ")}
                aria-pressed={paymentMethod === "mock"}
              >
                <span
                  className={[
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    paymentMethod === "mock"
                      ? "bg-slate-950 text-white"
                      : "bg-slate-100 text-slate-500",
                  ].join(" ")}
                >
                  <CreditCard
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900">
                    Mock card payment
                  </span>

                  <span className="mt-0.5 block text-xs text-slate-500">
                    Test payment — no real money is charged.
                  </span>
                </span>

                {paymentMethod === "mock" && (
                  <CheckCircle2
                    className="h-5 w-5 shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setPaymentMethod("mock");
                  setPaymentError("");
                }}
                className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:border-slate-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-950/10"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <Smartphone
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-900">
                    UPI / Wallet
                  </span>

                  <span className="mt-0.5 block text-xs text-slate-500">
                    Simulated through the test payment gateway.
                  </span>
                </span>
              </button>
            </div>

            <div className="mt-7 rounded-2xl bg-slate-50 p-4">
              <div className="flex gap-3">
                <ShieldCheck
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Safe test environment
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    This assessment uses mock payments. No real payment
                    information or money is processed.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-7 border-t border-slate-100 pt-6">
              <Button
                type="button"
                size="lg"
                className="w-full"
                loading={paymentLoading}
                disabled={paymentLoading || booking.paymentStatus === "paid"}
                onClick={handlePayment}
              >
                {booking.paymentStatus === "paid"
                  ? "Payment already completed"
                  : `Pay ₹${amount.toLocaleString("en-IN")}`}
              </Button>

              <p className="mt-3 text-center text-xs text-slate-400">
                By continuing, you confirm the booking details above.
              </p>
            </div>
          </Card>

          {/* BOOKING SUMMARY */}
          <aside>
            <Card className="rounded-3xl p-6 lg:sticky lg:top-24">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Booking summary
                  </p>

                  <h2 className="mt-3 text-lg font-semibold leading-6 text-slate-950">
                    {service?.title}
                  </h2>
                </div>

                <Badge>
                  {booking.status}
                </Badge>
              </div>

              <div className="mt-5 space-y-4 border-y border-slate-100 py-5">
                <div>
                  <p className="text-xs text-slate-400">
                    Date & time
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {new Date(
                      booking.bookingDate
                    ).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Service address
                  </p>

                  <p className="mt-1 text-sm font-medium leading-5 text-slate-900">
                    {booking.address}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Provider
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {provider?.name || "Verified provider"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">
                    Duration
                  </p>

                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {service?.duration || "Flexible"}
                  </p>
                </div>
              </div>

              <div className="flex items-end justify-between gap-4 pt-5">
                <div>
                  <p className="text-xs text-slate-400">
                    Total
                  </p>

                  <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                    ₹{amount.toLocaleString("en-IN")}
                  </p>
                </div>

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
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Checkout;