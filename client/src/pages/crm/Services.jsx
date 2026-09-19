import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Trash2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit3,
  Eye,
  Filter,
  Loader2,
  Plus,
  Search,
  Star,
  Tag,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";

import api from "../../services/api";

const EMPTY_FORM = {
  title: "",
  description: "",
  category: "",
  provider: "",
  price: "",
  duration: "",
  status: "active",
  isFeatured: false,
  isTrending: false,
};

function Services() {
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedService, setSelectedService] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  // Create / Edit state
  const [showFormModal, setShowFormModal] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingServiceId, setEditingServiceId] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [categories, setCategories] = useState([]);
  const [providers, setProviders] = useState([]);
  const [formOptionsLoading, setFormOptionsLoading] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
const [deleteLoading, setDeleteLoading] = useState(false);
const [deleteError, setDeleteError] = useState("");

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (status) {
        params.status = status;
      }

      if (category) {
        params.category = category;
      }

      const response = await api.get("/services", { params });

      setServices(response.data.data || []);

      setPagination((current) => ({
        ...current,
        ...(response.data.pagination || {}),
      }));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load services. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, status, category]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const loadFormOptions = async () => {
    try {
      setFormOptionsLoading(true);
      setFormError("");

      const [categoriesResponse, usersResponse] = await Promise.all([
        api.get("/categories", {
          params: {
            page: 1,
            limit: 100,
          },
        }),
        api.get("/users", {
          params: {
            page: 1,
            limit: 100,
          },
        }),
      ]);

      setCategories(categoriesResponse.data.data || []);

      const users = usersResponse.data.data || [];

      setProviders(
        users.filter((user) => user.role === "provider")
      );
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          "Unable to load categories and providers."
      );
    } finally {
      setFormOptionsLoading(false);
    }
  };

  const handleOpenCreate = async () => {
    setFormMode("create");
    setEditingServiceId("");
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormError("");
    setFormSuccess("");
    setShowFormModal(true);

    await loadFormOptions();
  };

  const handleOpenEdit = async (service) => {
    setFormMode("edit");
    setEditingServiceId(service._id);

    setForm({
      title: service.title || "",
      description: service.description || "",
      category: service.category?._id || service.category || "",
      provider: service.provider?._id || service.provider || "",
      price:
        service.price !== undefined && service.price !== null
          ? String(service.price)
          : "",
      duration: service.duration || "",
      status: service.status || "active",
      isFeatured: Boolean(service.isFeatured),
      isTrending: Boolean(service.isTrending),
    });

    setFormErrors({});
    setFormError("");
    setFormSuccess("");
    setShowFormModal(true);

    await loadFormOptions();
  };

  const handleCloseForm = () => {
    if (formLoading) return;

    setShowFormModal(false);
    setFormMode("create");
    setEditingServiceId("");
    setForm(EMPTY_FORM);
    setFormErrors({});
    setFormError("");
    setFormSuccess("");
  };

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setFormErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setFormError("");
  };

  const validateForm = () => {
    const errors = {};

    if (!form.title.trim()) {
      errors.title = "Service title is required.";
    }

    if (!form.description.trim()) {
      errors.description = "Service description is required.";
    }

    if (!form.category) {
      errors.category = "Please select a category.";
    }

    if (form.price === "") {
      errors.price = "Price is required.";
    } else if (
      Number.isNaN(Number(form.price)) ||
      Number(form.price) < 0
    ) {
      errors.price = "Enter a valid non-negative price.";
    }

    return errors;
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    try {
      setFormLoading(true);
      setFormError("");
      setFormSuccess("");

      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        price: Number(form.price),
        status: form.status,
        isFeatured: form.isFeatured,
        isTrending: form.isTrending,
      };

      if (form.provider) {
        payload.provider = form.provider;
      }

      if (form.duration.trim()) {
        payload.duration = form.duration.trim();
      }

      if (formMode === "edit") {
        await api.put(
          `/services/${editingServiceId}`,
          payload
        );

        setFormSuccess("Service updated successfully.");
      } else {
        await api.post("/services", payload);

        setFormSuccess("Service created successfully.");
      }

      await fetchServices();

      setTimeout(() => {
        handleCloseForm();
      }, 800);
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          `Unable to ${
            formMode === "edit" ? "update" : "create"
          } the service. Please try again.`
      );
    } finally {
      setFormLoading(false);
    }
  };

const handleDeleteService = async () => {
  if (!deleteTarget) return;

  try {
    setDeleteLoading(true);
    setDeleteError("");

    await api.delete(`/services/${deleteTarget._id}`);

    setDeleteTarget(null);

    // If the deleted item was the last item on the current page,
    // move back one page when appropriate.
    if (services.length === 1 && pagination.page > 1) {
      setPagination((current) => ({
        ...current,
        page: current.page - 1,
      }));
    } else {
      await fetchServices();
    }
  } catch (err) {
    setDeleteError(
      err.response?.data?.message ||
        "Unable to delete the service. Please try again."
    );
  } finally {
    setDeleteLoading(false);
  }
};

  const handleViewService = async (serviceId) => {
    try {
      setSelectedServiceId(serviceId);
      setSelectedService(null);
      setDetailsError("");
      setDetailsLoading(true);

      const response = await api.get(`/services/${serviceId}`);

      setSelectedService(response.data.data);
    } catch (err) {
      setDetailsError(
        err.response?.data?.message ||
          "Unable to load service details."
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseService = () => {
    setSelectedService(null);
    setSelectedServiceId("");
    setDetailsError("");
  };

  const handleRetryDetails = () => {
    if (selectedServiceId) {
      handleViewService(selectedServiceId);
    }
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    setPagination((current) => ({
      ...current,
      page: 1,
    }));
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);

    setPagination((current) => ({
      ...current,
      page: 1,
    }));
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);

    setPagination((current) => ({
      ...current,
      page: 1,
    }));
  };

  const handlePreviousPage = () => {
    setPagination((current) => ({
      ...current,
      page: Math.max(1, current.page - 1),
    }));
  };

  const handleNextPage = () => {
    setPagination((current) => ({
      ...current,
      page: Math.min(
        current.pages || 1,
        current.page + 1
      ),
    }));
  };

  const stats = useMemo(() => {
    const total = services.length;

    const active = services.filter(
      (service) => service.status === "active"
    ).length;

    const featured = services.filter(
      (service) => service.isFeatured
    ).length;

    const averageRating =
      total > 0
        ? services.reduce(
            (sum, service) =>
              sum + Number(service.rating || 0),
            0
          ) / total
        : 0;

    return {
      total,
      active,
      featured,
      averageRating,
    };
  }, [services]);

  const categoryOptions = useMemo(() => {
    const map = new Map();

    services.forEach((service) => {
      if (service.category?._id) {
        map.set(
          service.category._id,
          service.category.name
        );
      }
    });

    return Array.from(map.entries());
  }, [services]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Service catalog
          </p>

          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
            Services
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage the services available across the marketplace.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add service
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total services</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {pagination.total ?? stats.total}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Active</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {stats.active}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Featured</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">
            {stats.featured}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Average rating
          </p>

          <div className="mt-2 flex items-center gap-2">
            <Star
              className="h-5 w-5 fill-amber-400 text-amber-400"
              aria-hidden="true"
            />

            <span className="text-2xl font-semibold text-slate-950">
              {stats.averageRating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <form
            onSubmit={handleSearchSubmit}
            className="flex min-w-0 flex-1 gap-2"
          >
            <label
              htmlFor="service-search"
              className="sr-only"
            >
              Search services
            </label>

            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />

              <input
                id="service-search"
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search services, descriptions or providers..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-950/5"
              />
            </div>

            <button
              type="submit"
              className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
            >
              Search
            </button>
          </form>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <label
                htmlFor="service-category"
                className="sr-only"
              >
                Filter by category
              </label>

              <Filter
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />

              <select
                id="service-category"
                value={category}
                onChange={handleCategoryChange}
                className="h-10 min-w-44 appearance-none rounded-xl border border-slate-200 bg-white pl-9 pr-9 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5"
              >
                <option value="">All categories</option>

                {categoryOptions.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>

              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
            </div>

            <div className="relative">
              <label
                htmlFor="service-status"
                className="sr-only"
              >
                Filter by status
              </label>

              <select
                id="service-status"
                value={status}
                onChange={handleStatusChange}
                className="h-10 min-w-36 appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>

              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          />

          <div>
            <p className="font-semibold">
              Unable to load services
            </p>

            <p className="mt-1">{error}</p>

            <button
              type="button"
              onClick={fetchServices}
              className="mt-2 font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div
            className="flex min-h-64 items-center justify-center"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-center gap-3 text-sm text-slate-500">
              <Loader2
                className="h-5 w-5 animate-spin"
                aria-hidden="true"
              />
              Loading services...
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <Tag
                className="h-5 w-5 text-slate-500"
                aria-hidden="true"
              />
            </div>

            <h2 className="mt-4 text-base font-semibold text-slate-950">
              No services found
            </h2>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Try changing your search or filters, or create a new service.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-[980px] w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-left">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Service
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Category
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Provider
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Price
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Rating
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {services.map((service) => (
                    <tr
                      key={service._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-slate-950">
                            {service.title}
                          </p>

                          <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                            {service.description}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {service.category?.name || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                            <UserRound
                              className="h-4 w-4 text-slate-500"
                              aria-hidden="true"
                            />
                          </div>

                          <span className="text-sm text-slate-700">
                            {service.provider?.name ||
                              "Unassigned"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                        ₹
                        {Number(
                          service.price || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Star
                            className="h-4 w-4 fill-amber-400 text-amber-400"
                            aria-hidden="true"
                          />

                          <span className="text-sm font-medium text-slate-700">
                            {Number(
                              service.rating || 0
                            ).toFixed(1)}
                          </span>

                          <span className="text-xs text-slate-400">
                            ({service.reviewCount || 0})
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            service.status === "active"
                              ? "bg-emerald-50 text-emerald-700"
                              : service.status === "draft"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {service.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleViewService(service._id)
                            }
                            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                            aria-label={`View ${service.title}`}
                          >
                            <Eye
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenEdit(service)
                            }
                            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                            aria-label={`Edit ${service.title}`}
                          >

                        
                            <Edit3
                              className="h-4 w-4"
                              aria-hidden="true"
                            />
                            Edit
                          </button>
                          <button
                            type="button"
                                onClick={() => {
                             setDeleteTarget(service);
                                 setDeleteError("");
  }}
  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
  aria-label={`Delete ${service.title}`}
>
  <Trash2
    className="h-4 w-4"
    aria-hidden="true"
  />
  Delete
</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Page {pagination.page} of{" "}
                {pagination.pages || 1}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={pagination.page <= 1}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  <ArrowLeft
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  Previous
                </button>

                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={
                    pagination.page >=
                    (pagination.pages || 1)
                  }
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
                >
                  Next
                  <ArrowRight
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Service Details Modal */}
      {(selectedService ||
        detailsLoading ||
        detailsError) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseService();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-details-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
              <h2
                id="service-details-title"
                className="text-lg font-semibold text-slate-950"
              >
                Service details
              </h2>

              <button
                type="button"
                onClick={handleCloseService}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                aria-label="Close service details"
              >
                <X
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>

            {detailsLoading ? (
              <div
                className="flex min-h-64 items-center justify-center"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Loader2
                    className="h-5 w-5 animate-spin"
                    aria-hidden="true"
                  />
                  Loading service details...
                </div>
              </div>
            ) : detailsError ? (
              <div className="p-6">
                <div
                  className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  role="alert"
                >
                  <p className="font-semibold">
                    Unable to load service
                  </p>

                  <p className="mt-1">{detailsError}</p>

                  <button
                    type="button"
                    onClick={handleRetryDetails}
                    className="mt-3 font-semibold underline underline-offset-2"
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : selectedService ? (
              <div className="space-y-6 p-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {selectedService.status}
                    </span>

                    {selectedService.isFeatured && (
                      <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700">
                        Featured
                      </span>
                    )}

                    {selectedService.isTrending && (
                      <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700">
                        Trending
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                    {selectedService.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {selectedService.description}
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Category
                    </p>

                    <p className="mt-1 font-semibold text-slate-950">
                      {selectedService.category?.name ||
                        "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Provider
                    </p>

                    <p className="mt-1 font-semibold text-slate-950">
                      {selectedService.provider?.name ||
                        "Unassigned"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Price
                    </p>

                    <p className="mt-1 font-semibold text-slate-950">
                      ₹
                      {Number(
                        selectedService.price || 0
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Duration
                    </p>

                    <p className="mt-1 font-semibold text-slate-950">
                      {selectedService.duration || "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Rating
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <Star
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                        aria-hidden="true"
                      />

                      <span className="font-semibold text-slate-950">
                        {Number(
                          selectedService.rating || 0
                        ).toFixed(1)}
                      </span>

                      <span className="text-sm text-slate-500">
                        ({selectedService.reviewCount || 0}{" "}
                        reviews)
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Created
                    </p>

                    <p className="mt-1 font-semibold text-slate-950">
                      {selectedService.createdAt
                        ? new Date(
                            selectedService.createdAt
                          ).toLocaleDateString("en-IN")
                        : "—"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Service ID
                  </p>

                  <p className="mt-1 break-all font-mono text-xs text-slate-700">
                    {selectedService._id}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showFormModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseForm();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-form-title"
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white/95 px-6 py-5 backdrop-blur">
              <div>
                <h2
                  id="service-form-title"
                  className="text-xl font-semibold tracking-tight text-slate-950"
                >
                  {formMode === "edit"
                    ? "Edit service"
                    : "Create service"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {formMode === "edit"
                    ? "Update the service information and catalog settings."
                    : "Add a new service to the marketplace catalog."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                disabled={formLoading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950"
                aria-label={`Close ${
                  formMode === "edit"
                    ? "edit"
                    : "create"
                } service dialog`}
              >
                <X
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>

            <form
              onSubmit={handleFormSubmit}
              className="space-y-5 p-6"
            >
              {formError && (
                <div
                  className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  role="alert"
                >
                  <AlertCircle
                    className="mt-0.5 h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />

                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div
                  className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700"
                  role="status"
                  aria-live="polite"
                >
                  <CheckCircle2
                    className="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />

                  {formSuccess}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="service-form-title-input"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Service title{" "}
                    <span
                      className="text-red-500"
                      aria-hidden="true"
                    >
                      *
                    </span>
                  </label>

                  <input
                    id="service-form-title-input"
                    name="title"
                    value={form.title}
                    onChange={handleFormChange}
                    placeholder="e.g. Home Deep Cleaning"
                    aria-invalid={Boolean(
                      formErrors.title
                    )}
                    className={`h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-slate-950/5 ${
                      formErrors.title
                        ? "border-red-300 focus:border-red-400"
                        : "border-slate-200 focus:border-slate-400"
                    }`}
                  />

                  {formErrors.title && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {formErrors.title}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label
                    htmlFor="service-form-category"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Category{" "}
                    <span
                      className="text-red-500"
                      aria-hidden="true"
                    >
                      *
                    </span>
                  </label>

                  <div className="relative">
                    <select
                      id="service-form-category"
                      name="category"
                      value={form.category}
                      onChange={handleFormChange}
                      disabled={formOptionsLoading}
                      aria-invalid={Boolean(
                        formErrors.category
                      )}
                      className={`h-11 w-full appearance-none rounded-xl border bg-white px-3 pr-9 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-slate-950/5 ${
                        formErrors.category
                          ? "border-red-300"
                          : "border-slate-200 focus:border-slate-400"
                      }`}
                    >
                      <option value="">
                        {formOptionsLoading
                          ? "Loading categories..."
                          : "Select category"}
                      </option>

                      {categories.map((item) => (
                        <option
                          key={item._id}
                          value={item._id}
                        >
                          {item.name}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                  </div>

                  {formErrors.category && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {formErrors.category}
                    </p>
                  )}
                </div>

                {/* Provider */}
                <div>
                  <label
                    htmlFor="service-form-provider"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Provider
                  </label>

                  <div className="relative">
                    <select
                      id="service-form-provider"
                      name="provider"
                      value={form.provider}
                      onChange={handleFormChange}
                      disabled={formOptionsLoading}
                      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5"
                    >
                      <option value="">
                        {formOptionsLoading
                          ? "Loading providers..."
                          : "Unassigned"}
                      </option>

                      {providers.map((provider) => (
                        <option
                          key={provider._id}
                          value={provider._id}
                        >
                          {provider.name}
                        </option>
                      ))}
                    </select>

                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label
                    htmlFor="service-form-price"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Price{" "}
                    <span
                      className="text-red-500"
                      aria-hidden="true"
                    >
                      *
                    </span>
                  </label>

                  <input
                    id="service-form-price"
                    name="price"
                    type="number"
                    min="0"
                    step="1"
                    value={form.price}
                    onChange={handleFormChange}
                    placeholder="e.g. 2499"
                    aria-invalid={Boolean(
                      formErrors.price
                    )}
                    className={`h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-slate-950/5 ${
                      formErrors.price
                        ? "border-red-300"
                        : "border-slate-200 focus:border-slate-400"
                    }`}
                  />

                  {formErrors.price && (
                    <p className="mt-1.5 text-xs text-red-600">
                      {formErrors.price}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label
                    htmlFor="service-form-duration"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Duration
                  </label>

                  <div className="relative">
                    <Clock3
                      className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />

                    <input
                      id="service-form-duration"
                      name="duration"
                      value={form.duration}
                      onChange={handleFormChange}
                      placeholder="e.g. 2-3 hours"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5"
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label
                    htmlFor="service-form-status"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Status
                  </label>

                  <div className="relative">
                    <select
                      id="service-form-status"
                      name="status"
                      value={form.status}
                      onChange={handleFormChange}
                      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-950/5"
                    >
                      <option value="active">
                        Active
                      </option>
                      <option value="inactive">
                        Inactive
                      </option>
                      <option value="draft">
                        Draft
                      </option>
                    </select>

                    <ChevronDown
                      className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="service-form-description"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Description{" "}
                  <span
                    className="text-red-500"
                    aria-hidden="true"
                  >
                    *
                  </span>
                </label>

                <textarea
                  id="service-form-description"
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  rows={4}
                  placeholder="Describe what the customer receives with this service..."
                  aria-invalid={Boolean(
                    formErrors.description
                  )}
                  className={`w-full resize-y rounded-xl border bg-white px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-slate-950/5 ${
                    formErrors.description
                      ? "border-red-300"
                      : "border-slate-200 focus:border-slate-400"
                  }`}
                />

                {formErrors.description && (
                  <p className="mt-1.5 text-xs text-red-600">
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Toggles */}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-slate-300 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                      <Star
                        className="h-4 w-4 text-violet-500"
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Featured
                      </p>

                      <p className="text-xs text-slate-500">
                        Highlight this service.
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={form.isFeatured}
                    onChange={handleFormChange}
                    className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                  />
                </label>

                <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-slate-300 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm">
                      <TrendingUp
                        className="h-4 w-4 text-orange-500"
                        aria-hidden="true"
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Trending
                      </p>

                      <p className="text-xs text-slate-500">
                        Mark as a trending service.
                      </p>
                    </div>
                  </div>

                  <input
                    type="checkbox"
                    name="isTrending"
                    checked={form.isTrending}
                    onChange={handleFormChange}
                    className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950"
                  />
                </label>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={formLoading}
                  className="h-11 rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    formLoading ||
                    formOptionsLoading
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                >
                  {formLoading ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      {formMode === "edit"
                        ? "Saving..."
                        : "Creating..."}
                    </>
                  ) : (
                    <>
                      {formMode === "edit" ? (
                        <Edit3
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      ) : (
                        <Plus
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      )}

                      {formMode === "edit"
                        ? "Save changes"
                        : "Create service"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

            {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleteLoading) {
              setDeleteTarget(null);
              setDeleteError("");
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-service-title"
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50">
              <Trash2
                className="h-5 w-5 text-red-600"
                aria-hidden="true"
              />
            </div>

            <h2
              id="delete-service-title"
              className="mt-5 text-lg font-semibold text-slate-950"
            >
              Delete service?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              You're about to permanently delete{" "}
              <span className="font-semibold text-slate-800">
                {deleteTarget.title}
              </span>
              .
              This action cannot be undone.
            </p>

            {deleteError && (
              <div
                className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                role="alert"
              >
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => {
                  setDeleteTarget(null);
                  setDeleteError("");
                }}
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleDeleteService}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
              >
                {deleteLoading ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                    Delete service
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Services;