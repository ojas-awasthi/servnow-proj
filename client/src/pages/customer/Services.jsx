import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Heart,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";

import { fetchServices } from "../../features/services/servicesSlice";
import { fetchCategories } from "../../features/categories/categoriesSlice";

import {
  addToWishlist,
  fetchWishlist,
  removeFromWishlist,
} from "../../features/wishlist/wishlistSlice";

import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import IconButton from "../../components/common/IconButton";
import SearchInput from "../../components/common/SearchInput";
import Skeleton from "../../components/common/Skeleton";

const sortOptions = [
  {
    value: "newest",
    label: "Newest",
  },
  {
    value: "price_asc",
    label: "Price: Low to high",
  },
  {
    value: "price_desc",
    label: "Price: High to low",
  },
  {
    value: "rating_desc",
    label: "Highest rated",
  },
];

function MarketplaceMenu({
  open,
  onClose,
  children,
  className = "",
}) {
  if (!open) {
    return null;
  }

  return (
    <div
      className={[
        "absolute left-0 top-full z-30 mt-2",
        "w-72 overflow-hidden",
        "rounded-2xl border border-slate-200",
        "bg-white shadow-xl shadow-slate-950/10",
        "animate-in fade-in zoom-in-95 duration-150",
        className,
      ].join(" ")}
      role="dialog"
      aria-modal="false"
    >
      {children}
    </div>
  );
}

function ServiceCard({ service }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    isAuthenticated,
    user,
  } = useSelector((state) => state.auth);

  const {
    items: wishlistItems,
  } = useSelector((state) => state.wishlist);

  const rating =
    typeof service.rating === "number"
      ? service.rating.toFixed(1)
      : service.rating || "New";

  const isWishlisted = wishlistItems.some(
    (item) => item._id === service._id
  );

  const handleWishlist = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: `/services/${service._id}`,
        },
      });

      return;
    }

    if (user?.role !== "customer") {
      return;
    }

    if (isWishlisted) {
      dispatch(
        removeFromWishlist(service._id)
      );
    } else {
      dispatch(
        addToWishlist(service._id)
      );
    }
  };

  const handleViewService = () => {
    navigate(`/services/${service._id}`);
  };

  return (
    <Card
      interactive
      className="group overflow-hidden"
    >
      {/* Service visual */}
      <div className="relative flex h-52 items-center justify-center bg-slate-100">
        <div
          className="text-4xl text-slate-300 transition-transform duration-300 group-hover:scale-110"
          aria-hidden="true"
        >
          ✦
        </div>

        {service.isFeatured && (
          <div className="absolute left-4 top-4">
            <Badge variant="neutral">
              Featured
            </Badge>
          </div>
        )}

        <div className="absolute right-4 top-4">
          <IconButton
            label={
              isWishlisted
                ? `Remove ${service.title} from wishlist`
                : `Add ${service.title} to wishlist`
            }
            title={
              isWishlisted
                ? "Remove from wishlist"
                : "Add to wishlist"
            }
            icon={
              <Heart
                className="h-4.5 w-4.5"
                fill={
                  isWishlisted
                    ? "currentColor"
                    : "none"
                }
              />
            }
            variant="bordered"
            size="sm"
            onClick={handleWishlist}
            aria-pressed={isWishlisted}
          />
        </div>
      </div>

      <div className="p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {service.category?.name || "Service"}
        </p>

        <h2 className="mt-2 line-clamp-1 text-lg font-semibold text-slate-950">
          {service.title}
        </h2>

        <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">
          {service.description}
        </p>

        <div className="mt-4 flex items-center gap-2">
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

          <Button
            size="sm"
            onClick={handleViewService}
          >
            View service
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Services() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] =
    useSearchParams();

  const {
    isAuthenticated,
    user,
  } = useSelector((state) => state.auth);

  const [search, setSearch] = useState(
    () => searchParams.get("search") || ""
  );

  const [selectedCategory, setSelectedCategory] =
    useState(
      () =>
        searchParams.get("category") || ""
    );

  const [sort, setSort] = useState(
    () =>
      searchParams.get("sort") || "newest"
  );

  const [minPrice, setMinPrice] = useState(
    () =>
      searchParams.get("minPrice") || ""
  );

  const [maxPrice, setMaxPrice] = useState(
    () =>
      searchParams.get("maxPrice") || ""
  );

  const [minRating, setMinRating] = useState(
    () =>
      searchParams.get("minRating") || ""
  );

  const [page, setPage] = useState(
    () =>
      Number(searchParams.get("page")) || 1
  );

  const [openMenu, setOpenMenu] =
    useState(null);

  const limit = 10;

  const {
    items: services,
    pagination,
    loading,
    error,
  } = useSelector(
    (state) => state.services
  );

  const {
    items: categories,
    loading: categoriesLoading,
  } = useSelector(
    (state) => state.categories
  );

  /*
   * Load categories once.
   */
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  /*
   * Load wishlist for authenticated customers.
   */
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

  /*
   * Restore local marketplace state when browser
   * navigation changes the URL query string.
   */
  useEffect(() => {
    const nextSearch =
      searchParams.get("search") || "";

    const nextCategory =
      searchParams.get("category") || "";

    const nextSort =
      searchParams.get("sort") || "newest";

    const nextMinPrice =
      searchParams.get("minPrice") || "";

    const nextMaxPrice =
      searchParams.get("maxPrice") || "";

    const nextMinRating =
      searchParams.get("minRating") || "";

    const nextPage =
      Number(searchParams.get("page")) || 1;

    setSearch((current) =>
      current === nextSearch
        ? current
        : nextSearch
    );

    setSelectedCategory((current) =>
      current === nextCategory
        ? current
        : nextCategory
    );

    setSort((current) =>
      current === nextSort
        ? current
        : nextSort
    );

    setMinPrice((current) =>
      current === nextMinPrice
        ? current
        : nextMinPrice
    );

    setMaxPrice((current) =>
      current === nextMaxPrice
        ? current
        : nextMaxPrice
    );

    setMinRating((current) =>
      current === nextMinRating
        ? current
        : nextMinRating
    );

    setPage((current) =>
      current === nextPage
        ? current
        : nextPage
    );
  }, [searchParams]);

  /*
   * Keep marketplace state reflected in the URL.
   */
  useEffect(() => {
    const params = new URLSearchParams();

    if (search.trim()) {
      params.set(
        "search",
        search.trim()
      );
    }

    if (selectedCategory) {
      params.set(
        "category",
        selectedCategory
      );
    }

    if (sort !== "newest") {
      params.set("sort", sort);
    }

    if (minPrice) {
      params.set(
        "minPrice",
        minPrice
      );
    }

    if (maxPrice) {
      params.set(
        "maxPrice",
        maxPrice
      );
    }

    if (minRating) {
      params.set(
        "minRating",
        minRating
      );
    }

    if (page > 1) {
      params.set(
        "page",
        String(page)
      );
    }

    const nextQuery = params.toString();
    const currentQuery =
      searchParams.toString();

    if (nextQuery !== currentQuery) {
      setSearchParams(params, {
        replace: true,
      });
    }
  }, [
    search,
    selectedCategory,
    sort,
    minPrice,
    maxPrice,
    minRating,
    page,
    searchParams,
    setSearchParams,
  ]);

  /*
   * Fetch services whenever marketplace state changes.
   * Search is debounced to avoid a request per keystroke.
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(
        fetchServices({
          search:
            search.trim() || undefined,
          category:
            selectedCategory || undefined,
          minPrice:
            minPrice || undefined,
          maxPrice:
            maxPrice || undefined,
          minRating:
            minRating || undefined,
          page,
          limit,
          sort,
        })
      );
    }, 350);

    return () =>
      clearTimeout(timeoutId);
  }, [
    dispatch,
    search,
    selectedCategory,
    minPrice,
    maxPrice,
    minRating,
    page,
    sort,
  ]);

  const categoryOptions =
    categories.map((category) => ({
      value: category._id,
      label: category.name,
    }));

  const totalPages =
    pagination.totalPages || 1;

  const currentPage =
    pagination.page || page;

  const activeFilterCount = [
    selectedCategory,
    minRating,
    minPrice,
    maxPrice,
  ].filter(Boolean).length;

  const selectedCategoryName =
    categories.find(
      (category) =>
        category._id ===
        selectedCategory
    )?.name || "";

  const selectedRatingLabel = minRating
    ? `${minRating}+ stars`
    : "";

  const selectedSortLabel =
    sortOptions.find(
      (option) =>
        option.value === sort
    )?.label || "Newest";

  const closeMenus = () => {
    setOpenMenu(null);
  };

  const toggleMenu = (menu) => {
    setOpenMenu((current) =>
      current === menu
        ? null
        : menu
    );
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setSort("newest");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("");
    setPage(1);
    closeMenus();
  };

  const handlePreviousPage = () => {
    setPage((current) =>
      Math.max(
        1,
        current - 1
      )
    );
  };

  const handleNextPage = () => {
    setPage((current) =>
      Math.min(
        totalPages,
        current + 1
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <section className="border-b border-slate-200/70 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-slate-500">
              ServNOW Marketplace
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              Find the right service for your needs.
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
              Browse trusted services, compare options
              and book when you're ready.
            </p>
          </div>

          <div className="mt-8 max-w-3xl">
            <SearchInput
              label="Search services"
              placeholder="Search by service name or keyword..."
              value={search}
              onChange={(event) => {
                setSearch(
                  event.target.value
                );
                setPage(1);
              }}
              onClear={() => {
                setSearch("");
                setPage(1);
              }}
            />
          </div>
        </div>
      </section>

      {/* Marketplace */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section
          className="relative"
          aria-label="Service filters and sorting"
        >
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p
                className="text-sm text-slate-500"
                aria-live="polite"
              >
                <span className="font-semibold text-slate-950">
                  {pagination.total ||
                    services.length}
                </span>{" "}
                services
              </p>

              {activeFilterCount > 0 && (
                <p className="mt-1 text-xs text-slate-400">
                  {activeFilterCount} filter
                  {activeFilterCount ===
                  1
                    ? ""
                    : "s"}{" "}
                  applied
                </p>
              )}
            </div>

            {/* Desktop controls */}
            <div className="hidden items-center gap-2 sm:flex">
              {/* Category */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    toggleMenu(
                      "category"
                    )
                  }
                  aria-haspopup="dialog"
                  aria-expanded={
                    openMenu ===
                    "category"
                  }
                  className={[
                    "flex h-10 items-center gap-2 rounded-xl border px-3.5",
                    "text-sm font-medium transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-slate-950 focus-visible:ring-offset-2",
                    selectedCategory
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <span>
                    {selectedCategoryName ||
                      "Category"}
                  </span>

                  {openMenu ===
                  "category" ? (
                    <ChevronUp
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  ) : (
                    <ChevronDown
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  )}
                </button>

                <MarketplaceMenu
                  open={
                    openMenu ===
                    "category"
                  }
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">
                      Category
                    </p>
                  </div>

                  <div className="max-h-72 overflow-y-auto p-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(
                          ""
                        );
                        setPage(1);
                        closeMenus();
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                    >
                      <span>
                        All categories
                      </span>

                      {!selectedCategory && (
                        <Check
                          className="h-4 w-4 text-slate-950"
                          aria-hidden="true"
                        />
                      )}
                    </button>

                    {categoryOptions.map(
                      (category) => (
                        <button
                          key={
                            category.value
                          }
                          type="button"
                          onClick={() => {
                            setSelectedCategory(
                              category.value
                            );
                            setPage(1);
                            closeMenus();
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <span>
                            {
                              category.label
                            }
                          </span>

                          {selectedCategory ===
                            category.value && (
                            <Check
                              className="h-4 w-4 text-slate-950"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      )
                    )}
                  </div>
                </MarketplaceMenu>
              </div>

              {/* Rating */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    toggleMenu(
                      "rating"
                    )
                  }
                  aria-haspopup="dialog"
                  aria-expanded={
                    openMenu ===
                    "rating"
                  }
                  className={[
                    "flex h-10 items-center gap-2 rounded-xl border px-3.5",
                    "text-sm font-medium transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-slate-950 focus-visible:ring-offset-2",
                    minRating
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <Star
                    className={[
                      "h-4 w-4",
                      minRating
                        ? "fill-current"
                        : "text-amber-500",
                    ].join(" ")}
                    aria-hidden="true"
                  />

                  <span>
                    {selectedRatingLabel ||
                      "Rating"}
                  </span>

                  {openMenu ===
                  "rating" ? (
                    <ChevronUp
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  ) : (
                    <ChevronDown
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  )}
                </button>

                <MarketplaceMenu
                  open={
                    openMenu === "rating"
                  }
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">
                      Customer rating
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Show services rated at or above
                    </p>
                  </div>

                  <div className="p-2">
                    {[
                      {
                        value: "",
                        label: "Any rating",
                      },
                      {
                        value: "4",
                        label: "4.0 & up",
                      },
                      {
                        value: "4.5",
                        label: "4.5 & up",
                      },
                      {
                        value: "4.8",
                        label: "4.8 & up",
                      },
                    ].map(
                      (option) => (
                        <button
                          key={
                            option.value ||
                            "any"
                          }
                          type="button"
                          onClick={() => {
                            setMinRating(
                              option.value
                            );
                            setPage(1);
                            closeMenus();
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-1">
                            {option.value ? (
                              <>
                                <Star
                                  className="h-4 w-4 fill-current text-amber-500"
                                  aria-hidden="true"
                                />

                                <span className="text-sm font-medium text-slate-700">
                                  {
                                    option.label
                                  }
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-medium text-slate-700">
                                {
                                  option.label
                                }
                              </span>
                            )}
                          </div>

                          {minRating ===
                            option.value && (
                            <Check
                              className="ml-auto h-4 w-4 text-slate-950"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      )
                    )}
                  </div>
                </MarketplaceMenu>
              </div>

              {/* Price */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    toggleMenu("price")
                  }
                  aria-haspopup="dialog"
                  aria-expanded={
                    openMenu ===
                    "price"
                  }
                  className={[
                    "flex h-10 items-center gap-2 rounded-xl border px-3.5",
                    "text-sm font-medium transition-all duration-200",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-slate-950 focus-visible:ring-offset-2",
                    minPrice ||
                    maxPrice
                      ? "border-slate-950 bg-slate-950 text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                  ].join(" ")}
                >
                  <span>
                    Price
                  </span>

                  {openMenu ===
                  "price" ? (
                    <ChevronUp
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  ) : (
                    <ChevronDown
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  )}
                </button>

                <MarketplaceMenu
                  open={
                    openMenu === "price"
                  }
                  className="w-80"
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">
                      Price range
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Set the minimum and maximum price.
                    </p>
                  </div>

                  <div className="space-y-4 p-4">
                    <div>
                      <label
                        htmlFor="filter-min-price"
                        className="mb-1.5 block text-xs font-medium text-slate-600"
                      >
                        Minimum
                      </label>

                      <input
                        id="filter-min-price"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        placeholder="₹0"
                        value={minPrice}
                        onChange={(event) => {
                          setMinPrice(
                            event.target
                              .value
                          );
                          setPage(1);
                        }}
                        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-950/5"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="filter-max-price"
                        className="mb-1.5 block text-xs font-medium text-slate-600"
                      >
                        Maximum
                      </label>

                      <input
                        id="filter-max-price"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        placeholder="No maximum"
                        value={maxPrice}
                        onChange={(event) => {
                          setMaxPrice(
                            event.target
                              .value
                          );
                          setPage(1);
                        }}
                        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition-all focus:border-slate-400 focus:ring-4 focus:ring-slate-950/5"
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setMinPrice(
                            ""
                          );
                          setMaxPrice(
                            ""
                          );
                          setPage(1);
                        }}
                        className="text-xs font-medium text-slate-500 hover:text-slate-900"
                      >
                        Clear price
                      </button>

                      <Button
                        size="sm"
                        onClick={
                          closeMenus
                        }
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </MarketplaceMenu>
              </div>

              {/* Sort */}
              <div className="relative ml-1">
                <button
                  type="button"
                  onClick={() =>
                    toggleMenu("sort")
                  }
                  aria-haspopup="dialog"
                  aria-expanded={
                    openMenu === "sort"
                  }
                  className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                >
                  <span className="text-slate-400">
                    Sort:
                  </span>

                  <span>
                    {selectedSortLabel}
                  </span>

                  {openMenu ===
                  "sort" ? (
                    <ChevronUp
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  ) : (
                    <ChevronDown
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  )}
                </button>

                <MarketplaceMenu
                  open={
                    openMenu === "sort"
                  }
                  className="right-0 left-auto w-64"
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">
                      Sort services
                    </p>
                  </div>

                  <div className="p-2">
                    {sortOptions.map(
                      (option) => (
                        <button
                          key={
                            option.value
                          }
                          type="button"
                          onClick={() => {
                            setSort(
                              option.value
                            );
                            setPage(1);
                            closeMenus();
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <span>
                            {
                              option.label
                            }
                          </span>

                          {sort ===
                            option.value && (
                            <Check
                              className="h-4 w-4 text-slate-950"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      )
                    )}
                  </div>
                </MarketplaceMenu>
              </div>
            </div>

            {/* Mobile controls */}
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              <button
                type="button"
                onClick={() =>
                  toggleMenu(
                    "mobileFilters"
                  )
                }
                aria-expanded={
                  openMenu ===
                  "mobileFilters"
                }
                className={[
                  "flex h-11 items-center justify-center gap-2 rounded-xl border",
                  "text-sm font-medium transition-all",
                  "focus-visible:outline-none focus-visible:ring-2",
                  "focus-visible:ring-slate-950 focus-visible:ring-offset-2",
                  activeFilterCount > 0
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-700",
                ].join(" ")}
              >
                <SlidersHorizontal
                  className="h-4 w-4"
                  aria-hidden="true"
                />

                <span>
                  Filters
                </span>

                {activeFilterCount >
                  0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-semibold text-slate-950">
                    {
                      activeFilterCount
                    }
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    toggleMenu(
                      "mobileSort"
                    )
                  }
                  aria-haspopup="dialog"
                  aria-expanded={
                    openMenu ===
                    "mobileSort"
                  }
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                >
                  <span>
                    Sort
                  </span>

                  <ChevronDown
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </button>

                <MarketplaceMenu
                  open={
                    openMenu ===
                    "mobileSort"
                  }
                  className="right-0 left-auto w-64"
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">
                      Sort services
                    </p>
                  </div>

                  <div className="p-2">
                    {sortOptions.map(
                      (option) => (
                        <button
                          key={
                            option.value
                          }
                          type="button"
                          onClick={() => {
                            setSort(
                              option.value
                            );
                            setPage(1);
                            closeMenus();
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          <span>
                            {
                              option.label
                            }
                          </span>

                          {sort ===
                            option.value && (
                            <Check
                              className="h-4 w-4 text-slate-950"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      )
                    )}
                  </div>
                </MarketplaceMenu>
              </div>
            </div>
          </div>

          {/* Active filter chips */}
          {(selectedCategory ||
            minRating ||
            minPrice ||
            maxPrice) && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {selectedCategory && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(
                      ""
                    );
                    setPage(1);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-200"
                  aria-label="Remove category filter"
                >
                  {selectedCategoryName ||
                    "Category"}

                  <X
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                </button>
              )}

              {minRating && (
                <button
                  type="button"
                  onClick={() => {
                    setMinRating("");
                    setPage(1);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
                  aria-label="Remove rating filter"
                >
                  <Star
                    className="h-3.5 w-3.5 fill-current"
                    aria-hidden="true"
                  />

                  {minRating}+ stars

                  <X
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                </button>
              )}

              {(minPrice ||
                maxPrice) && (
                <button
                  type="button"
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                    setPage(1);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100"
                  aria-label="Remove price filter"
                >
                  ₹
                  {minPrice || "0"} –{" "}
                  {maxPrice
                    ? `₹${maxPrice}`
                    : "∞"}

                  <X
                    className="h-3.5 w-3.5"
                    aria-hidden="true"
                  />
                </button>
              )}

              {activeFilterCount >
                1 && (
                <button
                  type="button"
                  onClick={
                    handleClearFilters
                  }
                  className="px-2 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
                >
                  Clear all
                </button>
              )}
            </div>
          )}

          {/* Mobile filter panel */}
          {openMenu ===
            "mobileFilters" && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:hidden">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Filters
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Refine the services shown below.
                  </p>
                </div>

                <IconButton
                  label="Close filters"
                  icon={
                    <X
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                  }
                  variant="ghost"
                  size="sm"
                  onClick={
                    closeMenus
                  }
                />
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Category
                  </p>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(
                          ""
                        );
                        setPage(1);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-slate-50"
                    >
                      <span>
                        All categories
                      </span>

                      {!selectedCategory && (
                        <Check
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      )}
                    </button>

                    {categoryOptions.map(
                      (category) => (
                        <button
                          key={
                            category.value
                          }
                          type="button"
                          onClick={() => {
                            setSelectedCategory(
                              category.value
                            );
                            setPage(1);
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-slate-50"
                        >
                          <span>
                            {
                              category.label
                            }
                          </span>

                          {selectedCategory ===
                            category.value && (
                            <Check
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Rating
                  </p>

                  <div className="space-y-1">
                    {[
                      {
                        value: "",
                        label: "Any rating",
                      },
                      {
                        value: "4",
                        label: "4.0 & up",
                      },
                      {
                        value: "4.5",
                        label: "4.5 & up",
                      },
                      {
                        value: "4.8",
                        label: "4.8 & up",
                      },
                    ].map(
                      (option) => (
                        <button
                          key={
                            option.value ||
                            "any"
                          }
                          type="button"
                          onClick={() => {
                            setMinRating(
                              option.value
                            );
                            setPage(1);
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-slate-50"
                        >
                          <span className="flex items-center gap-1.5">
                            {option.value && (
                              <Star
                                className="h-4 w-4 fill-current text-amber-500"
                                aria-hidden="true"
                              />
                            )}

                            {
                              option.label
                            }
                          </span>

                          {minRating ===
                            option.value && (
                            <Check
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                    Price
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="mobile-min-price"
                        className="mb-1.5 block text-xs text-slate-500"
                      >
                        Minimum
                      </label>

                      <input
                        id="mobile-min-price"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        placeholder="₹0"
                        value={minPrice}
                        onChange={(event) => {
                          setMinPrice(
                            event.target
                              .value
                          );
                          setPage(1);
                        }}
                        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-950/5"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="mobile-max-price"
                        className="mb-1.5 block text-xs text-slate-500"
                      >
                        Maximum
                      </label>

                      <input
                        id="mobile-max-price"
                        type="number"
                        min="0"
                        inputMode="numeric"
                        placeholder="No maximum"
                        value={maxPrice}
                        onChange={(event) => {
                          setMaxPrice(
                            event.target
                              .value
                          );
                          setPage(1);
                        }}
                        className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-950/5"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={
                    closeMenus
                  }
                >
                  Apply filters
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Results */}
        {loading && (
          <div
            className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Loading services"
            aria-live="polite"
          >
            {Array.from({
              length: 6,
            }).map((_, index) => (
              <Card
                key={index}
                className="overflow-hidden"
              >
                <Skeleton className="h-52 w-full rounded-none" />

                <div className="space-y-3 p-5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <Card className="mt-6 p-8 text-center">
            <h2 className="text-lg font-semibold text-slate-950">
              We couldn't load the services
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {error}
            </p>

            <div className="mt-5">
              <Button
                onClick={() =>
                  dispatch(
                    fetchServices({
                      search:
                        search.trim() ||
                        undefined,
                      category:
                        selectedCategory ||
                        undefined,
                      minPrice:
                        minPrice ||
                        undefined,
                      maxPrice:
                        maxPrice ||
                        undefined,
                      minRating:
                        minRating ||
                        undefined,
                      page,
                      limit,
                      sort,
                    })
                  )
                }
              >
                Try again
              </Button>
            </div>
          </Card>
        )}

        {/* Empty */}
        {!loading &&
          !error &&
          services.length === 0 && (
            <Card className="mt-6 p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <SlidersHorizontal
                  className="h-5 w-5 text-slate-400"
                  aria-hidden="true"
                />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-950">
                No services found
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Try adjusting your search or
                filters.
              </p>

              <div className="mt-5">
                <Button
                  variant="secondary"
                  onClick={
                    handleClearFilters
                  }
                >
                  Clear filters
                </Button>
              </div>
            </Card>
          )}

        {/* Service grid */}
        {!loading &&
          !error &&
          services.length > 0 && (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map(
                (service) => (
                  <ServiceCard
                    key={service._id}
                    service={service}
                  />
                )
              )}
            </div>
          )}

        {/* Pagination */}
        {!loading &&
          !error &&
          services.length > 0 && (
            <div className="mt-10 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page{" "}
                <span className="font-medium text-slate-900">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-900">
                  {totalPages}
                </span>
              </p>

              <div
                className="flex items-center gap-2"
                aria-label="Service pagination"
              >
                <IconButton
                  label="Previous page"
                  icon={
                    <ChevronLeft className="h-4 w-4" />
                  }
                  variant="bordered"
                  size="sm"
                  disabled={
                    currentPage <= 1
                  }
                  onClick={
                    handlePreviousPage
                  }
                />

                <div
                  className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-slate-950 px-3 text-sm font-medium text-white"
                  aria-current="page"
                  aria-label={`Page ${currentPage}`}
                >
                  {currentPage}
                </div>

                <IconButton
                  label="Next page"
                  icon={
                    <ChevronRight className="h-4 w-4" />
                  }
                  variant="bordered"
                  size="sm"
                  disabled={
                    currentPage >=
                    totalPages
                  }
                  onClick={
                    handleNextPage
                  }
                />
              </div>
            </div>
          )}
      </main>
    </div>
  );
}

export default Services;