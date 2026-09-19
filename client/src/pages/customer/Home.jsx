import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";

import { fetchServices } from "../../features/services/servicesSlice";
import { fetchCategories } from "../../features/categories/categoriesSlice";

import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import SearchInput from "../../components/common/SearchInput";
import Skeleton from "../../components/common/Skeleton";

function ServicePreviewCard({ service }) {
  const navigate = useNavigate();

  const rating =
    typeof service.rating === "number"
      ? service.rating.toFixed(1)
      : service.rating || "New";

  return (
    <Card
      interactive
      className="group overflow-hidden"
    >
      <button
        type="button"
        onClick={() =>
          navigate(`/services/${service._id}`)
        }
        className="block w-full text-left"
        aria-label={`View ${service.title}`}
      >
        <div className="relative flex h-48 items-center justify-center bg-slate-100">
          <Sparkles
            className="h-10 w-10 text-slate-300 transition-transform duration-300 group-hover:scale-110"
            aria-hidden="true"
          />

          {service.isFeatured && (
            <span className="absolute left-4 top-4 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm">
              Featured
            </span>
          )}
        </div>

        <div className="p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {service.category?.name || "Service"}
          </p>

          <h3 className="mt-2 line-clamp-1 text-lg font-semibold text-slate-950">
            {service.title}
          </h3>

          <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">
            {service.description}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star
                className="h-4 w-4 fill-current text-amber-500"
                aria-hidden="true"
              />

              <span className="text-sm font-medium text-slate-700">
                {rating}
              </span>
            </div>

            <span className="text-sm text-slate-400">
              ({service.reviewCount || 0} reviews)
            </span>
          </div>

          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400">
                Starting from
              </p>

              <p className="mt-1 text-lg font-semibold text-slate-950">
                ₹
                {Number(
                  service.price || 0
                ).toLocaleString("en-IN")}
              </p>
            </div>

            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 transition-transform duration-200 group-hover:translate-x-0.5">
              View
              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
      </button>
    </Card>
  );
}

function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");

  const {
    items: categories,
    loading: categoriesLoading,
  } = useSelector(
    (state) => state.categories
  );

  const {
    items: services,
    loading: servicesLoading,
    error: servicesError,
  } = useSelector(
    (state) => state.services
  );

  /*
   * Load homepage data.
   *
   * We intentionally reuse the existing marketplace
   * Redux slices rather than creating another API layer.
   */
  useEffect(() => {
    dispatch(fetchCategories());

    dispatch(
      fetchServices({
        page: 1,
        limit: 12,
        sort: "newest",
      })
    );
  }, [dispatch]);

  const featuredServices = useMemo(() => {
    const featured = services.filter(
      (service) => service.isFeatured
    );

    return featured.length > 0
      ? featured.slice(0, 3)
      : services.slice(0, 3);
  }, [services]);

  const trendingServices = useMemo(() => {
    const trending = services.filter(
      (service) => service.isTrending
    );

    return trending.length > 0
      ? trending.slice(0, 3)
      : services.slice(0, 3);
  }, [services]);

  const handleSearch = () => {
    const query = search.trim();

    navigate(
      query
        ? `/services?search=${encodeURIComponent(query)}`
        : "/services"
    );
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="overflow-hidden bg-slate-50">
      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative border-b border-slate-200/70 bg-white">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,23,42,0.06),transparent_35%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
              <Sparkles
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              Trusted services, made simple
            </div>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Find the right service.
              <span className="block text-slate-500">
                Get things done.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">
              Discover trusted professionals for everyday
              needs, from home services and technology to
              fitness and automotive care.
            </p>

            {/* Search */}
            <div className="mt-8 flex max-w-2xl gap-2">
              <div className="min-w-0 flex-1">
                <SearchInput
                  label="Search services"
                  placeholder="Search for a service..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  onClear={() => setSearch("")}
                  onKeyDown={handleSearchKeyDown}
                />
              </div>

              <Button
                size="lg"
                onClick={handleSearch}
                className="shrink-0"
                aria-label="Search services"
              >
                <Search
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                <span className="hidden sm:inline">
                  Search
                </span>
              </Button>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={() => navigate("/services")}
              >
                Explore services

                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={() =>
                  document
                    .getElementById("how-it-works")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    })
                }
              >
                How it works
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2
                  className="h-4 w-4 text-emerald-600"
                  aria-hidden="true"
                />

                Verified providers
              </span>

              <span className="inline-flex items-center gap-2">
                <ShieldCheck
                  className="h-4 w-4 text-emerald-600"
                  aria-hidden="true"
                />

                Secure payments
              </span>

              <span className="inline-flex items-center gap-2">
                <Clock3
                  className="h-4 w-4 text-emerald-600"
                  aria-hidden="true"
                />

                Easy booking
              </span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
            <div
              className="absolute -inset-6 -z-10 rounded-[3rem] bg-slate-100/80 blur-2xl"
              aria-hidden="true"
            />

            <Card className="overflow-hidden rounded-[2rem] border-slate-200/80 shadow-xl shadow-slate-950/5">
              <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                      Popular right now
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      Services people are booking
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                    <Star
                      className="h-4 w-4 fill-current text-slate-950"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {servicesLoading ? (
                  Array.from({ length: 3 }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className="flex gap-4 p-5"
                      >
                        <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />

                        <div className="min-w-0 flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                          <Skeleton className="h-3 w-20" />
                        </div>

                        <Skeleton className="h-4 w-16" />
                      </div>
                    )
                  )
                ) : featuredServices.length > 0 ? (
                  featuredServices.map(
                    (service) => {
                      const rating =
                        typeof service.rating ===
                        "number"
                          ? service.rating.toFixed(1)
                          : service.rating ||
                            "New";

                      return (
                        <button
                          key={service._id}
                          type="button"
                          onClick={() =>
                            navigate(
                              `/services/${service._id}`
                            )
                          }
                          className="flex w-full items-center gap-4 p-5 text-left transition-colors duration-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-slate-950"
                          aria-label={`View ${service.title}`}
                        >
                          <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100"
                            aria-hidden="true"
                          >
                            <Sparkles className="h-5 w-5 text-slate-700" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {service.title}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {service.category?.name ||
                                "Service"}
                            </p>

                            <div className="mt-2 flex items-center gap-1.5 text-xs">
                              <Star
                                className="h-3.5 w-3.5 fill-current text-amber-500"
                                aria-hidden="true"
                              />

                              <span className="font-medium text-slate-700">
                                {rating}
                              </span>

                              <span className="text-slate-400">
                                (
                                {service.reviewCount ||
                                  0}
                                )
                              </span>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <p className="text-sm font-semibold text-slate-950">
                              ₹
                              {Number(
                                service.price || 0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              starting
                            </p>
                          </div>
                        </button>
                      );
                    }
                  )
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-sm text-slate-500">
                      Services will appear here soon.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* =========================================================
          CATEGORIES
      ========================================================== */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Explore by category
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Services for every need
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Browse popular service categories and find
                professionals for what you need.
              </p>
            </div>

            <Button
              variant="ghost"
              className="self-start sm:self-auto"
              onClick={() => navigate("/services")}
            >
              View all

              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Button>
          </div>

          {categoriesLoading ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map(
                (_, index) => (
                  <Card
                    key={index}
                    className="p-5"
                  >
                    <Skeleton className="h-11 w-11 rounded-xl" />
                    <Skeleton className="mt-5 h-5 w-32" />
                    <Skeleton className="mt-3 h-8 w-full" />
                  </Card>
                )
              )}
            </div>
          ) : categories.length > 0 ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories
                .slice(0, 8)
                .map((category, index) => {
                  const icons = [
                    Sparkles,
                    ShieldCheck,
                    Users,
                    Clock3,
                  ];

                  const Icon =
                    icons[index % icons.length];

                  return (
                    <Card
                      key={category._id}
                      interactive
                      className="group p-5"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/services?category=${encodeURIComponent(
                              category._id
                            )}`
                          )
                        }
                        className="block w-full text-left"
                        aria-label={`Explore ${category.name} services`}
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 transition-transform duration-200 group-hover:scale-105">
                          <Icon
                            className="h-5 w-5 text-slate-700"
                            aria-hidden="true"
                          />
                        </div>

                        <h3 className="mt-5 text-base font-semibold text-slate-950">
                          {category.name}
                        </h3>

                        <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">
                          {category.description ||
                            "Explore services in this category."}
                        </p>

                        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-slate-700">
                          Explore

                          <ArrowRight
                            className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                            aria-hidden="true"
                          />
                        </span>
                      </button>
                    </Card>
                  );
                })}
            </div>
          ) : (
            <Card className="mt-8 p-8 text-center">
              <p className="text-sm text-slate-500">
                Service categories are being prepared.
              </p>
            </Card>
          )}
        </div>
      </section>

      {/* =========================================================
          FEATURED SERVICES
      ========================================================== */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Featured services
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Popular with customers
              </h2>
            </div>

            <Button
              variant="secondary"
              onClick={() => navigate("/services")}
            >
              Browse services

              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Button>
          </div>

          {servicesError ? (
            <Card className="mt-8 p-8 text-center">
              <p className="text-sm text-slate-500">
                Featured services are temporarily
                unavailable.
              </p>

              <Button
                className="mt-4"
                variant="secondary"
                onClick={() =>
                  dispatch(
                    fetchServices({
                      page: 1,
                      limit: 12,
                      sort: "newest",
                    })
                  )
                }
              >
                Try again
              </Button>
            </Card>
          ) : servicesLoading ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map(
                (_, index) => (
                  <Card
                    key={index}
                    className="overflow-hidden"
                  >
                    <Skeleton className="h-48 w-full rounded-none" />

                    <div className="space-y-3 p-5">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </Card>
                )
              )}
            </div>
          ) : featuredServices.length > 0 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {featuredServices.map(
                (service) => (
                  <ServicePreviewCard
                    key={service._id}
                    service={service}
                  />
                )
              )}
            </div>
          ) : (
            <Card className="mt-8 p-8 text-center">
              <p className="text-sm text-slate-500">
                No featured services are available yet.
              </p>
            </Card>
          )}
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================== */}
      <section
        id="how-it-works"
        className="bg-slate-50"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-slate-500">
              How it works
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              From discovery to done
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              A simple service journey designed to keep
              every step clear.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Find a service",
                description:
                  "Search the marketplace and compare services based on category, price and ratings.",
                icon: Search,
              },
              {
                number: "02",
                title: "Book with confidence",
                description:
                  "Choose a service, provide your booking details and continue through the checkout flow.",
                icon: CheckCircle2,
              },
              {
                number: "03",
                title: "Track everything",
                description:
                  "Manage your bookings, payments, reviews and service history from your dashboard.",
                icon: ShieldCheck,
              },
            ].map((step) => {
              const Icon = step.icon;

              return (
                <Card
                  key={step.number}
                  className="relative p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Icon
                        className="h-5 w-5 text-slate-700"
                        aria-hidden="true"
                      />
                    </div>

                    <span
                      className="text-xs font-semibold tracking-widest text-slate-300"
                      aria-hidden="true"
                    >
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-5 font-semibold text-slate-950">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {step.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          TRENDING
      ========================================================== */}
      {trendingServices.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Trending now
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  Services getting attention
                </h2>
              </div>

              <Link
                to="/services"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 transition-colors hover:text-slate-950"
              >
                See all

                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {trendingServices.map(
                (service) => (
                  <ServicePreviewCard
                    key={service._id}
                    service={service}
                  />
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================
          WHY SERVNOW
      ========================================================== */}
      <section className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium text-slate-500">
              Why ServNOW
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              A simpler way to get things done
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Everything you need to discover, book and
              manage services in one place.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <Card className="p-6 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
                <ShieldCheck
                  className="h-5 w-5 text-emerald-600"
                  aria-hidden="true"
                />
              </div>

              <h3 className="mt-5 font-semibold text-slate-950">
                Trusted professionals
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Find services from providers listed on
                the ServNOW marketplace.
              </p>
            </Card>

            <Card className="p-6 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                <Clock3
                  className="h-5 w-5 text-blue-600"
                  aria-hidden="true"
                />
              </div>

              <h3 className="mt-5 font-semibold text-slate-950">
                Simple booking
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Discover a service, choose when you need
                it and complete your booking in a few
                steps.
              </p>
            </Card>

            <Card className="p-6 transition-transform duration-200 hover:-translate-y-0.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
                <CheckCircle2
                  className="h-5 w-5 text-amber-600"
                  aria-hidden="true"
                />
              </div>

              <h3 className="mt-5 font-semibold text-slate-950">
                Clear service journey
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Keep track of your bookings, payments and
                service history from your dashboard.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* =========================================================
          CTA
      ========================================================== */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-12 text-white shadow-xl shadow-slate-950/10 sm:px-10 lg:px-14 lg:py-14">
            <div
              className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/5 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-medium text-slate-400">
                  Ready when you are
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  Find a service that fits your needs.
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Explore the ServNOW marketplace and get
                  started in just a few steps.
                </p>
              </div>

              <Button
                size="lg"
                onClick={() => navigate("/services")}
                className="shrink-0 !bg-white !text-slate-950 hover:!bg-slate-100"
              >
                Explore services

                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;