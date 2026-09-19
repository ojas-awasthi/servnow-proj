import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../../services/api";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Skeleton from "../../components/common/Skeleton";
import {
  clearBookingError,
  createBooking,
} from "../../features/bookings/bookingsSlice";

function Booking() {
  const { serviceId } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    loading: bookingLoading,
    error: bookingError,
    currentBooking,
  } = useSelector((state) => state.bookings);

  const [service, setService] = useState(null);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [serviceError, setServiceError] = useState("");

  const [form, setForm] = useState({
    bookingDate: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    const loadService = async () => {
      try {
        setServiceLoading(true);
        setServiceError("");

        const response = await api.get(
          `/services/${serviceId}`
        );

        setService(response.data.data);
      } catch (error) {
        setServiceError(
          error.response?.data?.message ||
            "Unable to load this service."
        );
      } finally {
        setServiceLoading(false);
      }
    };

    loadService();
  }, [serviceId]);

  useEffect(() => {
    dispatch(clearBookingError());
  }, [dispatch]);

  useEffect(() => {
    if (currentBooking) {
      navigate(
        `/checkout/${currentBooking._id}`,
        {
          replace: true,
        }
      );
    }
  }, [currentBooking, navigate]);

  const minimumDateTime = useMemo(() => {
    const now = new Date();

    now.setMinutes(
      now.getMinutes() -
        now.getTimezoneOffset()
    );

    return now.toISOString().slice(0, 16);
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (bookingError) {
      dispatch(clearBookingError());
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = await dispatch(
  createBooking({
    service: serviceId,
    bookingDate: form.bookingDate,
    address: form.address.trim(),
    notes: form.notes.trim(),
  })
);

    if (!createBooking.fulfilled.match(result)) {
      return;
    }
  };

  if (serviceLoading) {
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

  if (serviceError || !service) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold text-slate-950">
            Unable to load booking
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {serviceError ||
              "This service could not be found."}
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

  const isFormValid =
    Boolean(form.bookingDate) &&
    form.address.trim().length >= 5;

  const providerName =
    service.provider?.name ||
    "Verified provider";

  const rating =
    typeof service.rating === "number"
      ? service.rating.toFixed(1)
      : "New";

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to={`/services/${serviceId}`}
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
            Book a service
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
            Schedule {service.title}
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Choose a convenient time and provide the service
            location.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* FORM */}
          <Card className="rounded-3xl p-6 sm:p-8">
            <div className="mb-7">
              <h2 className="text-lg font-semibold text-slate-950">
                Booking details
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                We'll use these details to arrange your service.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
              noValidate
            >
              {bookingError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {bookingError}
                </div>
              )}

              <div>
                <label
                  htmlFor="booking-date"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Preferred date and time
                </label>

                <div className="relative">
                  <CalendarDays
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />

                  <input
                    id="booking-date"
                    name="bookingDate"
                    type="datetime-local"
                    value={form.bookingDate}
                    min={minimumDateTime}
                    onChange={handleChange}
                    required
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 focus:border-slate-400 focus:ring-4 focus:ring-slate-950/5"
                  />
                </div>
              </div>

              <Input
                id="booking-address"
                name="address"
                label="Service address"
                placeholder="Enter the complete service address"
                value={form.address}
                onChange={handleChange}
                autoComplete="street-address"
                required
              />

              <div>
                <label
                  htmlFor="booking-notes"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Additional notes
                  <span className="ml-1 font-normal text-slate-400">
                    (optional)
                  </span>
                </label>

                <textarea
                  id="booking-notes"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  maxLength={1000}
                  rows={5}
                  placeholder="Anything the provider should know before arriving?"
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-950/5"
                />

                <div className="mt-1.5 text-right text-xs text-slate-400">
                  {form.notes.length}/1000
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  loading={bookingLoading}
                  disabled={!isFormValid}
                >
                  Continue to checkout
                </Button>

                <p className="mt-3 text-center text-xs text-slate-400">
                  You can review the booking before payment.
                </p>
              </div>
            </form>
          </Card>

          {/* SERVICE SUMMARY */}
          <aside>
            <Card className="rounded-3xl p-6 lg:sticky lg:top-24">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Service summary
              </p>

              <h2 className="mt-3 text-lg font-semibold leading-6 text-slate-950">
                {service.title}
              </h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {service.category?.name && (
                  <Badge>
                    {service.category.name}
                  </Badge>
                )}

                {service.isFeatured && (
                  <Badge variant="success">
                    Featured
                  </Badge>
                )}
              </div>

              <div className="mt-5 space-y-3 border-y border-slate-100 py-5">
                <div className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock3
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                    Duration
                  </span>

                  <span className="text-sm font-medium text-slate-900">
                    {service.duration ||
                      "Flexible"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Rating
                  </span>

                  <span className="text-sm font-medium text-slate-900">
                    {rating}
                    {rating !== "New" && " / 5"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Provider
                  </span>

                  <span className="text-right text-sm font-medium text-slate-900">
                    {providerName}
                  </span>
                </div>
              </div>

              <div className="flex items-end justify-between gap-4 pt-5">
                <div>
                  <p className="text-xs text-slate-400">
                    Starting from
                  </p>

                  <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                    ₹
                    {Number(
                      service.price || 0
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <div className="flex gap-3">
                  <ShieldCheck
                    className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                    aria-hidden="true"
                  />

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Secure booking
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Your booking details are securely
                      processed through ServNOW.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                <MapPin
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />
                Address is only used for this booking.
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Booking;