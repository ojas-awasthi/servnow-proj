import { useEffect, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  FolderTree,
  Image as ImageIcon,
  Loader2,
  Search,
  X,
  Plus,
} from "lucide-react";

import api from "../../services/api";
import CRMPageHeader from "../../components/crm/CRMPageHeader";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
const [createLoading, setCreateLoading] = useState(false);
const [editCategory, setEditCategory] = useState(null);
const [editLoading, setEditLoading] = useState(false);
const [editError, setEditError] = useState("");
const [deleteTarget, setDeleteTarget] = useState(null);
const [deleteLoading, setDeleteLoading] = useState(false);
const [deleteError, setDeleteError] = useState("");
const [createError, setCreateError] = useState("");
const [createForm, setCreateForm] = useState({
  name: "",
  description: "",
  image: "",
  isActive: true,
});

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/categories");

      setCategories(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load categories. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

    const handleCreateCategory = async (event) => {
    event.preventDefault();

    const name = createForm.name.trim();

    if (!name) {
      setCreateError("Category name is required.");
      return;
    }

    try {
      setCreateLoading(true);
      setCreateError("");

      await api.post("/categories", {
        name,
        description: createForm.description.trim(),
        image: createForm.image.trim(),
        isActive: createForm.isActive,
      });

      setCreateForm({
        name: "",
        description: "",
        image: "",
        isActive: true,
      });

      setShowCreateModal(false);

      await fetchCategories();
    } catch (err) {
      setCreateError(
        err.response?.data?.message ||
          "Unable to create the category. Please try again."
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditCategory = async (event) => {
  event.preventDefault();

  if (!editCategory) return;

  const name = createForm.name.trim();

  if (!name) {
    setEditError("Category name is required.");
    return;
  }

  try {
    setEditLoading(true);
    setEditError("");

    await api.put(`/categories/${editCategory._id}`, {
      name,
      description: createForm.description.trim(),
      image: createForm.image.trim(),
      isActive: createForm.isActive,
    });

    setEditCategory(null);

    setCreateForm({
      name: "",
      description: "",
      image: "",
      isActive: true,
    });

    await fetchCategories();
  } catch (err) {
    setEditError(
      err.response?.data?.message ||
        "Unable to update the category. Please try again."
    );
  } finally {
    setEditLoading(false);
  }
};

const handleDeleteCategory = async () => {
  if (!deleteTarget) return;

  try {
    setDeleteLoading(true);
    setDeleteError("");

    await api.delete(`/categories/${deleteTarget._id}`);

    setDeleteTarget(null);

    await fetchCategories();
  } catch (err) {
    setDeleteError(
      err.response?.data?.message ||
        "Unable to delete the category. Please try again."
    );
  } finally {
    setDeleteLoading(false);
  }
};

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((category) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      category.name?.toLowerCase().includes(query) ||
      category.description?.toLowerCase().includes(query)
    );
  });

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
  <CRMPageHeader
    eyebrow="Catalog"
    title="Categories"
    description="Manage the service categories used across the marketplace."
  />

  <button
    type="button"
    onClick={() => {
      setCreateError("");
      setShowCreateModal(true);
    }}
    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
  >
    <Plus className="h-4 w-4" aria-hidden="true" />
    Add category
  </button>
</div>

      {/* Search */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />

          <label htmlFor="category-search" className="sr-only">
            Search categories
          </label>

          <input
            id="category-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search categories..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-950/10"
          />
        </div>
      </section>

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

          <div className="flex-1">
            <p className="font-semibold">Unable to load categories</p>
            <p className="mt-1">{error}</p>

            <button
              type="button"
              onClick={fetchCategories}
              className="mt-3 font-semibold underline underline-offset-2 transition hover:text-red-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
              Loading categories...
            </div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <FolderTree
                className="h-6 w-6 text-slate-500"
                aria-hidden="true"
              />
            </div>

            <h2 className="mt-4 text-sm font-semibold text-slate-950">
              {search ? "No categories found" : "No categories yet"}
            </h2>

            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
              {search
                ? "Try adjusting your search to find a matching category."
                : "Categories will appear here once they are added."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px]">
                <caption className="sr-only">
                  Service categories
                </caption>

                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Category
                    </th>

                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Description
                    </th>

                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Status
                    </th>

                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Created
                    </th>

                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCategories.map((category) => (
                    <tr
                      key={category._id}
                      className="transition-colors hover:bg-slate-50/80"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt=""
                              className="h-10 w-10 rounded-xl object-cover"
                            />
                          ) : (
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100"
                              aria-hidden="true"
                            >
                              <FolderTree className="h-5 w-5 text-slate-500" />
                            </div>
                          )}

                          <div>
                            <p className="text-sm font-semibold text-slate-950">
                              {category.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              ID: {category._id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="max-w-sm px-6 py-4">
                        <p className="truncate text-sm text-slate-600">
                          {category.description || "No description"}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                            category.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {formatDate(category.createdAt)}
                      </td>

                      <td className="px-6 py-4">
  <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setSelectedCategory(category)}
                          aria-label={`View ${category.name} category details`}
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                        >
                          View
                        </button>
                          
                        <button
  type="button"
  onClick={() => {
    setEditError("");

    setCreateForm({
      name: category.name || "",
      description: category.description || "",
      image: category.image || "",
      isActive: category.isActive ?? true,
    });

    setEditCategory(category);
  }}
  aria-label={`Edit ${category.name} category`}
  className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
>
  Edit
</button>
<button
  type="button"
  onClick={() => {
    setDeleteError("");
    setDeleteTarget(category);
  }}
  aria-label={`Delete ${category.name} category`}
  className="rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
>
  Delete
</button>
</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredCategories.map((category) => (
                <article
                  key={category._id}
                  className="p-4 transition-colors hover:bg-slate-50/80"
                >
                  <div className="flex items-start gap-3">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100"
                        aria-hidden="true"
                      >
                        <FolderTree className="h-5 w-5 text-slate-500" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <h2 className="truncate text-sm font-semibold text-slate-950">
                          {category.name}
                        </h2>

                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            category.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <p className="mt-2 text-sm leading-5 text-slate-500">
                        {category.description || "No description"}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
                        <span>Created {formatDate(category.createdAt)}</span>

                        {category.image && (
                          <span className="inline-flex items-center gap-1">
                            <ImageIcon
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            Image
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className="mt-4 inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                      >
                        View details
                      </button>

                      <button
  type="button"
  onClick={() => {
    setEditError("");

    setCreateForm({
      name: category.name || "",
      description: category.description || "",
      image: category.image || "",
      isActive: category.isActive ?? true,
    });

    setEditCategory(category);
  }}
  className="mt-4 ml-2 inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
>
  Edit
</button>
<button
  type="button"
  onClick={() => {
    setDeleteError("");
    setDeleteTarget(category);
  }}
  className="mt-4 ml-2 inline-flex h-9 items-center justify-center rounded-xl border border-red-200 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
>
  Delete
</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {!loading && filteredCategories.length > 0 && (
        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {filteredCategories.length}
          </span>{" "}
          {filteredCategories.length === 1 ? "category" : "categories"}
        </p>
      )}

      {/* Category Details Modal */}
      {selectedCategory && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedCategory(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-details-title"
            className="w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
                  <FolderTree
                    className="h-5 w-5 text-slate-600"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Category details
                  </p>

                  <h2
                    id="category-details-title"
                    className="mt-1 text-lg font-semibold text-slate-950"
                  >
                    {selectedCategory.name}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                aria-label="Close category details"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 p-5 sm:p-6">
              {selectedCategory.image ? (
                <img
                  src={selectedCategory.image}
                  alt=""
                  className="h-44 w-full rounded-2xl object-cover"
                />
              ) : (
                <div
                  className="flex h-44 w-full items-center justify-center rounded-2xl bg-slate-100"
                  aria-hidden="true"
                >
                  <FolderTree className="h-10 w-10 text-slate-400" />
                </div>
              )}

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Description
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {selectedCategory.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                      selectedCategory.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {selectedCategory.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Category ID
                  </p>

                  <p className="mt-2 break-all text-xs font-medium text-slate-700">
                    {selectedCategory._id}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays
                      className="h-4 w-4 text-slate-400"
                      aria-hidden="true"
                    />

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Created
                    </p>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {formatDate(selectedCategory.createdAt)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays
                      className="h-4 w-4 text-slate-400"
                      aria-hidden="true"
                    />

                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Updated
                    </p>
                  </div>

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    {formatDate(selectedCategory.updatedAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 p-5 sm:p-6">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

            {/* Create Category Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !createLoading) {
              setShowCreateModal(false);
              setCreateError("");
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-category-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Catalog
                </p>

                <h2
                  id="create-category-title"
                  className="mt-1 text-lg font-semibold text-slate-950"
                >
                  Create category
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add a new service category to the marketplace.
                </p>
              </div>

              <button
                type="button"
                disabled={createLoading}
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateError("");
                }}
                aria-label="Close create category dialog"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateCategory}>
              <div className="space-y-5 p-5 sm:p-6">
                {createError && (
                  <div
                    className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                    role="alert"
                  >
                    {createError}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label
                    htmlFor="create-category-name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Category name{" "}
                    <span className="text-red-500" aria-hidden="true">
                      *
                    </span>
                  </label>

                  <input
                    id="create-category-name"
                    type="text"
                    value={createForm.name}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="e.g. Home Services"
                    maxLength={100}
                    required
                    disabled={createLoading}
                    autoFocus
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/10 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="create-category-description"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Description
                  </label>

                  <textarea
                    id="create-category-description"
                    value={createForm.description}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Briefly describe this category..."
                    rows={4}
                    maxLength={500}
                    disabled={createLoading}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/10 disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                {/* Image */}
                <div>
                  <label
                    htmlFor="create-category-image"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Image URL
                  </label>

                  <input
                    id="create-category-image"
                    type="url"
                    value={createForm.image}
                    onChange={(event) =>
                      setCreateForm((current) => ({
                        ...current,
                        image: event.target.value,
                      }))
                    }
                    placeholder="https://example.com/category-image.jpg"
                    disabled={createLoading}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/10 disabled:bg-slate-50 disabled:text-slate-500"
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Optional. Use a publicly accessible image URL.
                  </p>
                </div>

                {/* Status */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label
                    htmlFor="create-category-status"
                    className="flex cursor-pointer items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        Active category
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Active categories are available for marketplace
                        services.
                      </p>
                    </div>

                    <input
                      id="create-category-status"
                      type="checkbox"
                      checked={createForm.isActive}
                      onChange={(event) =>
                        setCreateForm((current) => ({
                          ...current,
                          isActive: event.target.checked,
                        }))
                      }
                      disabled={createLoading}
                      className="h-5 w-5 shrink-0 rounded border-slate-300 text-slate-950 focus:ring-2 focus:ring-slate-950/20"
                    />
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 p-5 sm:flex-row sm:justify-end sm:p-6">
                <button
                  type="button"
                  disabled={createLoading}
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateError("");
                  }}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={createLoading}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                >
                  {createLoading ? (
                    <>
                      <Loader2
                        className="h-4 w-4 animate-spin"
                        aria-hidden="true"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                      Create category
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Edit Category Modal */}
{editCategory && (
  <div
    className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
    role="presentation"
    onMouseDown={(event) => {
      if (event.target === event.currentTarget && !editLoading) {
        setEditCategory(null);
        setEditError("");
      }
    }}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-category-title"
      className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Catalog
          </p>

          <h2
            id="edit-category-title"
            className="mt-1 text-lg font-semibold text-slate-950"
          >
            Edit category
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Update the category information.
          </p>
        </div>

        <button
          type="button"
          disabled={editLoading}
          onClick={() => {
            setEditCategory(null);
            setEditError("");
          }}
          aria-label="Close edit category dialog"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleEditCategory}>
        <div className="space-y-5 p-5 sm:p-6">
          {editError && (
            <div
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              role="alert"
            >
              {editError}
            </div>
          )}

          {/* Name */}
          <div>
            <label
              htmlFor="edit-category-name"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Category name{" "}
              <span className="text-red-500" aria-hidden="true">
                *
              </span>
            </label>

            <input
              id="edit-category-name"
              type="text"
              value={createForm.name}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              maxLength={100}
              required
              disabled={editLoading}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/10 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="edit-category-description"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Description
            </label>

            <textarea
              id="edit-category-description"
              value={createForm.description}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={4}
              maxLength={500}
              disabled={editLoading}
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/10 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          {/* Image */}
          <div>
            <label
              htmlFor="edit-category-image"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Image URL
            </label>

            <input
              id="edit-category-image"
              type="url"
              value={createForm.image}
              onChange={(event) =>
                setCreateForm((current) => ({
                  ...current,
                  image: event.target.value,
                }))
              }
              placeholder="https://example.com/category-image.jpg"
              disabled={editLoading}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-950/10 disabled:bg-slate-50 disabled:text-slate-500"
            />
          </div>

          {/* Status */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <label
              htmlFor="edit-category-status"
              className="flex cursor-pointer items-center justify-between gap-4"
            >
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Active category
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Active categories are available for marketplace services.
                </p>
              </div>

              <input
                id="edit-category-status"
                type="checkbox"
                checked={createForm.isActive}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
                disabled={editLoading}
                className="h-5 w-5 shrink-0 rounded border-slate-300 text-slate-950 focus:ring-2 focus:ring-slate-950/20"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 p-5 sm:flex-row sm:justify-end sm:p-6">
          <button
            type="button"
            disabled={editLoading}
            onClick={() => {
              setEditCategory(null);
              setEditError("");
            }}
            className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={editLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
          >
            {editLoading ? (
              <>
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Saving...
              </>
            ) : (
              "Save changes"
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
    className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm"
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
      aria-labelledby="delete-category-title"
      className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50">
        <FolderTree
          className="h-5 w-5 text-red-600"
          aria-hidden="true"
        />
      </div>

      <h2
        id="delete-category-title"
        className="mt-5 text-lg font-semibold text-slate-950"
      >
        Delete category?
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        You're about to permanently delete{" "}
        <span className="font-semibold text-slate-800">
          {deleteTarget.name}
        </span>
        . This action cannot be undone.
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
          onClick={handleDeleteCategory}
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
            "Delete category"
          )}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
    

  );
}

export default Categories;