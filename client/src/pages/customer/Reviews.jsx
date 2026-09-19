import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Star,
} from "lucide-react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import api from "../../services/api";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Skeleton from "../../components/common/Skeleton";
import {
  clearReviewError,
  createReview,
} from "../../features/reviews/reviewsSlice";
import { fetchMyBookings } from "../../features/bookings/bookingsSlice";

function Reviews() {
  const { serviceId } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    items: bookings,
    loading: bookingsLoading,
  } = useSelector((state) => state.bookings);

  const {
    submitting,
    error,
  } = useSelector((state) => state.reviews);

  const [service, setService] = useState(null);
  const [serviceLoading, setServiceLoading] = useState(true);
  const [serviceError, setServiceError] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const loadService = async () => {
      try {
        setServiceLoading(true);
        setServiceError("");

        const response = await api.get(
          `/services/${serviceId}`
        );

        setService(response.data.data);
      } catch (requestError) {
        setServiceError(
          requestError.response?.data?.message ||
            "Unable to load this service."
        );
      } finally {
        setServiceLoading(false);
      }
    };

    loadService();
  }, [serviceId]);

  useEffect(() => {
    dispatch(
      fetchMyBookings({
        page: 1,
        limit: 50,
        status: "completed",
      })
    );
  }, [dispatch]);

  useEffect(() => {
    dispatch(clearReviewError());
  }, [dispatch]);

  const completedBookings = useMemo(
    () =>
      bookings.filter(
        (booking) =>
          booking.status === "completed" &&
          booking.service?._id === serviceId
      ),
    [bookings, serviceId]
  );

  const eligibleBooking = completedBookings[0];

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!eligibleBooking) {
      return;
    }

    const result = await dispatch(
      createReview({
        service: serviceId,
        booking: eligibleBooking._id,
        rating,
        comment: comment.trim(),
      })
    );

    if (createReview.fulfilled.match(result)) {
      navigate(`/services/${serviceId}`, {
        replace: true,
      });
    }
  };

  if (serviceLoading || bookingsLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </main>
    );
  }

  if (serviceError || !service) {
    return (
      <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-slate-950">
            Unable to load review page
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {serviceError || "Service not found."}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-73px)] bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Link
          to={`/services/${serviceId}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-950"
        >
          <ArrowLeft
            className="h-4 w-4"
            aria-hidden="true"
          />
          Back to service
        </Link>

        <div className="mt-6">
          <p className="text-sm font-medium text-slate-500">
            Share your experience
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            Review {service.title}
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Reviews are available after a completed booking.
          </p>
        </div>

        {!eligibleBooking ? (
          <Card className="mt-8 rounded-3xl p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <CheckCircle2
                className="h-7 w-7 text-slate-400"
                aria-hidden="true"
              />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-950">
              Complete the service first
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You can leave a review once your booking for this
              service has been marked as completed.
            </p>

            <Link
              to="/dashboard/bookings"
              className="mt-5 inline-block"
            >
              <Button>
                View my bookings
              </Button>
            </Link>
          </Card>
        ) : (
          <Card className="mt-8 rounded-3xl p-6 sm:p-8">
            {error && (
              <div
                role="alert"
                className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400">
                    Completed booking
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {new Date(
                      eligibleBooking.bookingDate
                    ).toLocaleDateString("en-IN")}
                  </p>
                </div>

                <Badge variant="success">
                  Completed
                </Badge>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-7"
            >
              <div>
                <label className="block text-sm font-semibold text-slate-900">
                  Your rating
                </label>

                <div
                  className="mt-3 flex gap-2"
                  role="radiogroup"
                  aria-label="Rating"
                >
                  {[1, 2, 3, 4, 5].map(
                    (value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className="rounded-lg p-1 transition-transform duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-950/10"
                        aria-label={`${value} star${
                          value === 1 ? "" : "s"
                        }`}
                        aria-pressed={rating === value}
                      >
                        <Star
                          className={[
                            "h-7 w-7",
                            value <= rating
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-200",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                      </button>
                    )
                  )}
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  {rating} out of 5
                </p>
              </div>

              <div>
                <label
                  htmlFor="review-comment"
                  className="mb-1.5 block text-sm font-semibold text-slate-900"
                >
                  Your review
                </label>

                <textarea
                  id="review-comment"
                  value={comment}
                  onChange={(event) =>
                    setComment(event.target.value)
                  }
                  required
                  minLength={3}
                  maxLength={1000}
                  rows={6}
                  placeholder="Tell other customers about your experience..."
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-slate-400 focus:ring-4 focus:ring-slate-950/5"
                />

                <p className="mt-1.5 text-right text-xs text-slate-400">
                  {comment.length}/1000
                </p>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={submitting}
                disabled={
                  submitting ||
                  comment.trim().length < 3
                }
              >
                Submit review
              </Button>
            </form>
          </Card>
        )}
      </div>
    </main>
  );
}

export default Reviews;