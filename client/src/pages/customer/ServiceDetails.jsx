import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Heart,
  MapPin,
  ShieldCheck,
  Star,
} from "lucide-react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  addToWishlist,
  fetchWishlist,
  removeFromWishlist,
} from "../../features/wishlist/wishlistSlice";

import {
  fetchServiceReviews,
} from "../../features/reviews/reviewsSlice";

import api from "../../services/api";

import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Skeleton from "../../components/common/Skeleton";

function ServiceDetails() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    items: wishlistItems,
  } = useSelector(
    (state) => state.wishlist
  );

  const {
    isAuthenticated,
    user,
  } = useSelector(
    (state) => state.auth
  );

  const {
    items: reviews,
    loading: reviewsLoading,
    error: reviewsError,
  } = useSelector(
    (state) => state.reviews
  );

  const [service, setService] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [bookingLoading, setBookingLoading] =
    useState(false);

  const isWishlisted = service
    ? wishlistItems.some(
        (item) =>
          item._id === service._id
      )
    : false;

  useEffect(() => {
    const loadService = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            `/services/${serviceId}`
          );

        setService(
          response.data.data
        );
      } catch (requestError) {
        setError(
          requestError.response?.data
            ?.message ||
            "Unable to load this service."
        );
      } finally {
        setLoading(false);
      }
    };

    loadService();
  }, [serviceId]);

  useEffect(() => {
    if (
      isAuthenticated &&
      user?.role === "customer"
    ) {
      dispatch(fetchWishlist());
    }
  }, [
    dispatch,
    isAuthenticated,
    user?.role,
  ]);

  useEffect(() => {
    if (serviceId) {
      dispatch(
        fetchServiceReviews(
          serviceId
        )
      );
    }
  }, [
    dispatch,
    serviceId,
  ]);

  const handleWishlist = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: `/services/${serviceId}`,
        },
      });

      return;
    }

    if (user?.role !== "customer") {
      return;
    }

    if (isWishlisted) {
      dispatch(
        removeFromWishlist(
          service._id
        )
      );
    } else {
      dispatch(
        addToWishlist(
          service._id
        )
      );
    }
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: `/booking/${service._id}`,
        },
      });

      return;
    }

    if (user?.role !== "customer") {
      return;
    }

    setBookingLoading(true);

    navigate(
      `/booking/${service._id}`
    );
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: `/reviews/${serviceId}`,
        },
      });

      return;
    }

    if (user?.role !== "customer") {
      return;
    }

    navigate(
      `/reviews/${serviceId}`
    );
  };

  const handleBackToServices = () => {
    navigate("/services");
  };

  const reviewSummary = useMemo(() => {
    if (!reviews.length) {
      return {
        average: 0,
        total: 0,
      };
    }

    const total = reviews.reduce(
      (sum, review) =>
        sum +
        (Number(
          review.rating
        ) || 0),
      0
    );

    return {
      average: (
        total / reviews.length
      ).toFixed(1),
      total: reviews.length,
    };
  }, [reviews]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <Skeleton className="mb-6 h-5 w-32" />

          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="space-y-6">
              <Card className="overflow-hidden">
                <Skeleton className="h-72 w-full sm:h-96" />

                <div className="space-y-4 p-6 sm:p-8">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </Card>

              <Card className="p-6 sm:p-8">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="mt-5 h-20 w-full" />
                <Skeleton className="mt-5 h-20 w-full" />
              </Card>
            </div>

            <Card className="h-fit p-6 sm:p-7">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="mt-4 h-10 w-40" />
              <Skeleton className="mt-6 h-12 w-full" />
              <Skeleton className="mt-5 h-24 w-full" />
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto flex min-h-[60vh] max-w-3xl items-center px-4 py-12 sm:px-6 lg:px-8">
          <Card className="w-full p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <ShieldCheck
                className="h-5 w-5 text-slate-400"
                aria-hidden="true"
              />
            </div>

            <h1 className="mt-5 text-xl font-semibold text-slate-950">
              Service unavailable
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {error ||
                "We couldn't find this service."}
            </p>

            <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
              <Button
                variant="secondary"
                onClick={
                  handleBackToServices
                }
              >
                Browse services
              </Button>

              <Button
                onClick={() =>
                  window.history.back()
                }
              >
                Go back
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  const rating =
    typeof service.rating ===
    "number"
      ? service.rating.toFixed(1)
      : service.rating || "New";

  const providerName =
    service.provider?.name ||
    "Verified provider";

  const duration =
    service.duration ||
    "Flexible scheduling";

  const reviewCount =
    service.reviewCount ||
    reviewSummary.total ||
    0;

  const displayedRating =
    reviewSummary.total > 0
      ? reviewSummary.average
      : rating;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* Breadcrumb / back navigation */}
        <button
          type="button"
          onClick={
            handleBackToServices
          }
          className="group mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-4"
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
            aria-hidden="true"
          />

          Back to services
        </button>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          {/* Main information */}
          <div className="space-y-6">
            {/* Service visual */}
            <Card className="overflow-hidden">
              <div className="relative flex h-72 items-center justify-center bg-slate-100 sm:h-96">
                <div
                  className="text-7xl text-slate-300 transition-transform duration-500 hover:scale-105"
                  aria-hidden="true"
                >
                  ✦
                </div>

                {service.isFeatured && (
                  <div className="absolute left-5 top-5">
                    <Badge variant="neutral">
                      Featured
                    </Badge>
                  </div>
                )}
              </div>
            </Card>

            {/* Service information */}
            <Card className="p-6 sm:p-8">
              <div className="flex flex-col gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {service.category?.name ||
                      "Service"}
                  </p>

                  <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                    {service.title}
                  </h1>

                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <div className="flex items-center gap-1.5">
                      <Star
                        className="h-4 w-4 fill-current text-amber-500"
                        aria-hidden="true"
                      />

                      <span className="text-sm font-semibold text-slate-800">
                        {displayedRating}
                      </span>
                    </div>

                    <span className="text-sm text-slate-400">
                      {reviewCount}{" "}
                      reviews
                    </span>

                    <span
                      className="text-slate-300"
                      aria-hidden="true"
                    >
                      •
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                      <Clock3
                        className="h-4 w-4"
                        aria-hidden="true"
                      />

                      {duration}
                    </span>
                  </div>
                </div>

                {/* Wishlist */}
                <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CheckCircle2
                      className="h-4 w-4 text-emerald-600"
                      aria-hidden="true"
                    />

                    Service available for booking
                  </div>

                  <button
                    type="button"
                    onClick={
                      handleWishlist
                    }
                    className={[
                      "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                      "transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-950/10",
                      "active:scale-95",
                      isWishlisted
                        ? "border-red-200 bg-red-50 text-red-600"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
                    ].join(" ")}
                    aria-label={
                      isWishlisted
                        ? `Remove ${service.title} from wishlist`
                        : `Add ${service.title} to wishlist`
                    }
                    title={
                      isWishlisted
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                    }
                    aria-pressed={
                      isWishlisted
                    }
                  >
                    <Heart
                      className="h-5 w-5"
                      fill={
                        isWishlisted
                          ? "currentColor"
                          : "none"
                      }
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h2 className="text-base font-semibold text-slate-900">
                  About this service
                </h2>

                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                  {service.description}
                </p>
              </div>

              {/* Service metadata */}
              <div className="mt-8 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      className="h-4 w-4 text-slate-500"
                      aria-hidden="true"
                    />

                    <p className="text-xs text-slate-400">
                      Provider
                    </p>
                  </div>

                  <p className="mt-2 font-medium text-slate-900">
                    {providerName}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <Clock3
                      className="h-4 w-4 text-slate-500"
                      aria-hidden="true"
                    />

                    <p className="text-xs text-slate-400">
                      Service duration
                    </p>
                  </div>

                  <p className="mt-2 font-medium text-slate-900">
                    {duration}
                  </p>
                </div>
              </div>
            </Card>

            {/* Reviews */}
            <Card
              className="p-6 sm:p-8"
              aria-labelledby="reviews-heading"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Customer feedback
                  </p>

                  <div className="mt-2 flex items-center gap-3">
                    <h2
                      id="reviews-heading"
                      className="text-xl font-semibold tracking-tight text-slate-950"
                    >
                      Reviews
                    </h2>

                    <Badge variant="neutral">
                      {reviewCount}
                    </Badge>
                  </div>

                  <div
                    className="mt-2 flex items-center gap-2"
                    aria-label={`${displayedRating} out of 5 stars based on ${reviewCount} reviews`}
                  >
                    <Star
                      className="h-4 w-4 fill-current text-amber-500"
                      aria-hidden="true"
                    />

                    <span className="text-sm font-semibold text-slate-800">
                      {displayedRating}
                    </span>

                    <span className="text-sm text-slate-400">
                      based on{" "}
                      {reviewCount}{" "}
                      reviews
                    </span>
                  </div>
                </div>

                {isAuthenticated &&
                  user?.role ===
                    "customer" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={
                        handleWriteReview
                      }
                    >
                      Write a review
                    </Button>
                  )}
              </div>

              <div className="mt-6 border-t border-slate-100 pt-6">
                {reviewsLoading ? (
                  <div className="space-y-5">
                    {Array.from({
                      length: 3,
                    }).map(
                      (_, index) => (
                        <div
                          key={index}
                          className="space-y-3"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-4 w-20" />
                          </div>

                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      )
                    )}
                  </div>
                ) : reviewsError ? (
                  <div
                    className="rounded-xl border border-red-100 bg-red-50 p-4"
                    role="alert"
                  >
                    <p className="text-sm font-medium text-red-900">
                      Unable to load reviews
                    </p>

                    <p className="mt-1 text-sm leading-6 text-red-700">
                      {reviewsError}
                    </p>
                  </div>
                ) : reviews.length ===
                  0 ? (
                  <div className="rounded-xl bg-slate-50 p-6 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-sm">
                      <Star
                        className="h-5 w-5 text-slate-400"
                        aria-hidden="true"
                      />
                    </div>

                    <h3 className="mt-4 text-sm font-semibold text-slate-900">
                      No reviews yet
                    </h3>

                    <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
                      Be the first customer to
                      share your experience with
                      this service.
                    </p>

                    {isAuthenticated &&
                      user?.role ===
                        "customer" && (
                        <div className="mt-4">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={
                              handleWriteReview
                            }
                          >
                            Write a review
                          </Button>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {reviews.map(
                      (review) => {
                        const reviewRating =
                          Number(
                            review.rating
                          ) || 0;

                        const reviewerName =
                          review.user?.name ||
                          review.customer
                            ?.name ||
                          "Customer";

                        return (
                          <article
                            key={
                              review._id
                            }
                            className="py-5 first:pt-0 last:pb-0"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">
                                  {
                                    reviewerName
                                  }
                                </p>

                                <div
                                  className="mt-1 flex items-center gap-1"
                                  aria-label={`${reviewRating} out of 5 stars`}
                                >
                                  {Array.from(
                                    {
                                      length: 5,
                                    }
                                  ).map(
                                    (
                                      _,
                                      index
                                    ) => (
                                      <Star
                                        key={
                                          index
                                        }
                                        className={[
                                          "h-3.5 w-3.5",
                                          index <
                                          reviewRating
                                            ? "fill-current text-amber-500"
                                            : "text-slate-200",
                                        ].join(
                                          " "
                                        )}
                                        aria-hidden="true"
                                      />
                                    )
                                  )}
                                </div>
                              </div>

                              {review.createdAt && (
                                <time
                                  dateTime={
                                    review.createdAt
                                  }
                                  className="text-xs text-slate-400"
                                >
                                  {new Date(
                                    review.createdAt
                                  ).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </time>
                              )}
                            </div>

                            {review.comment && (
                              <p className="mt-3 text-sm leading-6 text-slate-600">
                                {
                                  review.comment
                                }
                              </p>
                            )}
                          </article>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Booking panel */}
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <Card className="p-6 sm:p-7">
              <p className="text-sm text-slate-500">
                Starting from
              </p>

              <p className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">
                ₹
                {Number(
                  service.price || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Final amount shown before payment.
              </p>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3.5">
                  <CalendarDays
                    className="h-5 w-5 shrink-0 text-slate-600"
                    aria-hidden="true"
                  />

                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Flexible booking
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Choose your preferred date during booking.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3.5">
                  <MapPin
                    className="h-5 w-5 shrink-0 text-slate-600"
                    aria-hidden="true"
                  />

                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Service at your location
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Provide your service address during booking.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={
                    handleBooking
                  }
                  disabled={
                    bookingLoading
                  }
                >
                  {bookingLoading
                    ? "Opening booking..."
                    : "Book this service"}
                </Button>
              </div>

              <div className="mt-5 flex items-start gap-3 rounded-xl bg-emerald-50 p-4">
                <ShieldCheck
                  className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                  aria-hidden="true"
                />

                <div>
                  <p className="text-sm font-medium text-emerald-900">
                    Secure booking
                  </p>

                  <p className="mt-1 text-xs leading-5 text-emerald-700">
                    Your booking and payment details are
                    protected.
                  </p>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </main>

      {/* Mobile booking bar */}
      <div className="sticky bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-slate-400">
              Starting from
            </p>

            <p className="truncate text-lg font-semibold text-slate-950">
              ₹
              {Number(
                service.price || 0
              ).toLocaleString(
                "en-IN"
              )}
            </p>
          </div>

          <Button
            size="lg"
            onClick={
              handleBooking
            }
            disabled={
              bookingLoading
            }
          >
            {bookingLoading
              ? "Opening..."
              : "Book now"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ServiceDetails;