import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BriefcaseBusiness,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Edit3,
  Eye,
  Loader2,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserRoundCog,
  Users as UsersIcon,
  X,
} from "lucide-react";

import api from "../../services/api";
import CRMPageHeader from "../../components/crm/CRMPageHeader";

const PAGE_SIZE = 10;

const ROLES = [
  "customer",
  "provider",
  "sales",
  "support",
  "admin",
];

const STATUSES = ["active", "inactive", "blocked"];

const ROLE_LABELS = {
  customer: "Customer",
  provider: "Provider",
  sales: "Sales",
  support: "Support",
  admin: "Admin",
};

const STATUS_LABELS = {
  active: "Active",
  inactive: "Inactive",
  blocked: "Blocked",
};

const roleBadgeClass = {
  customer: "bg-slate-100 text-slate-700",
  provider: "bg-blue-50 text-blue-700",
  sales: "bg-violet-50 text-violet-700",
  support: "bg-amber-50 text-amber-700",
  admin: "bg-emerald-50 text-emerald-700",
};

const statusBadgeClass = {
  active: "bg-emerald-50 text-emerald-700",
  inactive: "bg-slate-100 text-slate-600",
  blocked: "bg-red-50 text-red-700",
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?";

function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function UserAvatar({ user }) {
  return user.avatar ? (
    <img
      src={user.avatar}
      alt={`${user.name}'s avatar`}
      className="h-10 w-10 rounded-xl object-cover"
    />
  ) : (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-700"
      aria-hidden="true"
    >
      {getInitials(user.name)}
    </span>
  );
}

function UserActionsMenu({
  user,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  busy,
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const close = () => setOpen(false);

    window.addEventListener("click", close);

    return () => window.removeEventListener("click", close);
  }, [open]);

  const nextStatus =
    user.status === "active" ? "inactive" : "active";

  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`Actions for ${user.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        disabled={busy}
        onClick={(event) => {
          event.stopPropagation();
          setOpen((current) => !current);
        }}
      >
        <MoreVertical size={18} aria-hidden="true" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
          role="menu"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
            onClick={() => {
              setOpen(false);
              onView(user);
            }}
          >
            <Eye size={16} aria-hidden="true" />
            View details
          </button>

          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
            onClick={() => {
              setOpen(false);
              onEdit(user);
            }}
          >
            <Edit3 size={16} aria-hidden="true" />
            Edit profile
          </button>

          {user.status !== "blocked" && (
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
              onClick={() => {
                setOpen(false);
                onStatusChange(user, nextStatus);
              }}
            >
              {nextStatus === "active" ? (
                <Check size={16} aria-hidden="true" />
              ) : (
                <X size={16} aria-hidden="true" />
              )}
              {nextStatus === "active"
                ? "Activate"
                : "Deactivate"}
            </button>
          )}

          {user.status !== "blocked" && (
            <button
              type="button"
              role="menuitem"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
              onClick={() => {
                setOpen(false);
                onStatusChange(user, "blocked");
              }}
            >
              <ShieldCheck size={16} aria-hidden="true" />
              Block user
            </button>
          )}

          <div className="my-1 h-px bg-slate-100" />

          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
            onClick={() => {
              setOpen(false);
              onDelete(user);
            }}
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete user
          </button>
        </div>
      )}
    </div>
  );
}

function UserDetailsModal({ user, onClose }) {
  if (!user) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-details-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              User profile
            </p>
            <h2
              id="user-details-title"
              className="mt-1 text-lg font-semibold text-slate-950"
            >
              User details
            </h2>
          </div>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
            onClick={onClose}
            aria-label="Close user details"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} />

            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-slate-950">
                {user.name}
              </h3>

              <p className="truncate text-sm text-slate-500">
                {user.email}
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                <Badge className={roleBadgeClass[user.role]}>
                  {ROLE_LABELS[user.role] || user.role}
                </Badge>

                <Badge className={statusBadgeClass[user.status]}>
                  {STATUS_LABELS[user.status] || user.status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-400">
                Email
              </p>
              <p className="mt-1 break-all text-sm font-medium text-slate-800">
                {user.email}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-400">
                Phone
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {user.phone || "Not provided"}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-400">
                Role
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {ROLE_LABELS[user.role] || user.role}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-medium text-slate-400">
                Created
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800">
                {formatDate(user.createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserFormModal({
  mode,
  user,
  onClose,
  onSubmit,
  submitting,
}) {
  const isCreate = mode === "create";

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    phone: user?.phone || "",
    role: user?.role || "customer",
    status: user?.status || "active",
  });

  const [formError, setFormError] = useState("");

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Name is required.");
      return;
    }

    if (!form.email.trim()) {
      setFormError("Email is required.");
      return;
    }

    if (isCreate && form.password.length < 6) {
      setFormError(
        "Password must be at least 6 characters."
      );
      return;
    }

    try {
      await onSubmit({
        name: form.name.trim(),
        email: form.email.trim(),
        ...(isCreate
          ? { password: form.password }
          : {}),
        phone: form.phone,
        ...(isCreate
          ? {
              role: form.role,
              status: form.status,
            }
          : {}),
      });
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          "Unable to save the user."
      );
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="user-form-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Administration
            </p>

            <h2
              id="user-form-title"
              className="mt-1 text-lg font-semibold text-slate-950"
            >
              {isCreate ? "Create user" : "Edit user"}
            </h2>
          </div>

          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
            onClick={onClose}
            aria-label="Close user form"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-5 sm:p-6">
          {formError && (
            <div
              className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              role="alert"
            >
              <AlertCircle
                size={17}
                className="mt-0.5 shrink-0"
                aria-hidden="true"
              />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="user-name"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
              >
                Full name
              </label>

              <input
                id="user-name"
                value={form.name}
                onChange={(event) =>
                  updateField("name", event.target.value)
                }
                autoComplete="name"
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="user-email"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
              >
                Email
              </label>

              <input
                id="user-email"
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
                autoComplete="email"
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="name@example.com"
                required
              />
            </div>

            {isCreate && (
              <div className="sm:col-span-2">
                <label
                  htmlFor="user-password"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  Temporary password
                </label>

                <input
                  id="user-password"
                  type="password"
                  value={form.password}
                  onChange={(event) =>
                    updateField(
                      "password",
                      event.target.value
                    )
                  }
                  autoComplete="new-password"
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="user-phone"
                className="mb-1.5 block text-xs font-semibold text-slate-700"
              >
                Phone
              </label>

              <input
                id="user-phone"
                value={form.phone}
                onChange={(event) =>
                  updateField("phone", event.target.value)
                }
                autoComplete="tel"
                className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                placeholder="Optional"
              />
            </div>

            {isCreate && (
              <>
                <div>
                  <label
                    htmlFor="user-role"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Role
                  </label>

                  <select
                    id="user-role"
                    value={form.role}
                    onChange={(event) =>
                      updateField(
                        "role",
                        event.target.value
                      )
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="user-status"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Initial status
                  </label>

                  <select
                    id="user-status"
                    value={form.status}
                    onChange={(event) =>
                      updateField(
                        "status",
                        event.target.value
                      )
                    }
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    {STATUSES.map((status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="min-h-10 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={submitting}
            >
              {submitting && (
                <Loader2
                  size={16}
                  className="animate-spin"
                  aria-hidden="true"
                />
              )}
              {isCreate ? "Create user" : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Users pagination"
    >
      <p className="text-xs text-slate-500">
        Page{" "}
        <span className="font-semibold text-slate-700">
          {page}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-700">
          {totalPages}
        </span>
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous users page"
        >
          <ChevronLeft
            size={15}
            aria-hidden="true"
          />
          Previous
        </button>

        <button
          type="button"
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next users page"
        >
          Next
          <ChevronRight
            size={15}
            aria-hidden="true"
          />
        </button>
      </div>
    </nav>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const [busyId, setBusyId] = useState("");

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [formModal, setFormModal] = useState({
    open: false,
    mode: "create",
    user: null,
  });

  const [submitting, setSubmitting] = useState(false);

  const roleCounts = useMemo(() => {
    return ROLES.reduce((counts, currentRole) => {
      counts[currentRole] = users.filter(
        (user) => user.role === currentRole
      ).length;

      return counts;
    }, {});
  }, [users]);

  const fetchUsers = useCallback(
    async (requestedPage = 1, options = {}) => {
      const isRefresh = options.refresh === true;

      try {
        setError("");

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const params = {
          page: requestedPage,
          limit: PAGE_SIZE,
        };

        if (search.trim()) {
          params.search = search.trim();
        }

        if (role !== "all") {
          params.role = role;
        }

        if (status !== "all") {
          params.status = status;
        }

        const response = await api.get("/users", {
          params,
        });

        setUsers(response.data.data || []);

        setPagination(
          response.data.pagination || {
            page: requestedPage,
            limit: PAGE_SIZE,
            total: 0,
            totalPages: 0,
          }
        );
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load users. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, role, status]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchUsers(1);
    }, 250);

    return () => clearTimeout(timeout);
  }, [search, role, status, fetchUsers]);

  const handleView = async (user) => {
    try {
      setActionError("");

      const response = await api.get(
        `/users/${user._id}`
      );

      setSelectedUser(response.data.data);
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.message ||
          "Unable to load user details."
      );
    }
  };

  const handleCreate = () => {
    setFormModal({
      open: true,
      mode: "create",
      user: null,
    });
  };

  const handleEdit = (user) => {
    setFormModal({
      open: true,
      mode: "edit",
      user,
    });
  };

  const handleSubmitUser = async (data) => {
    setSubmitting(true);
    setActionError("");

    try {
      if (formModal.mode === "create") {
        await api.post("/users", data);

        setSuccessMessage(
          "User created successfully."
        );
      } else {
        const response = await api.put(
          `/users/${formModal.user._id}`,
          data
        );

        setUsers((current) =>
          current.map((item) =>
            item._id === formModal.user._id
              ? response.data.data
              : item
          )
        );

        setSuccessMessage(
          "User profile updated successfully."
        );
      }

      setFormModal({
        open: false,
        mode: "create",
        user: null,
      });

      await fetchUsers(pagination.page);
    } catch (requestError) {
      throw requestError;
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (user, nextRole) => {
    if (user.role === nextRole) return;

    try {
      setBusyId(user._id);
      setActionError("");
      setSuccessMessage("");

      const response = await api.patch(
        `/users/${user._id}/role`,
        { role: nextRole }
      );

      setUsers((current) =>
        current.map((item) =>
          item._id === user._id
            ? response.data.data
            : item
        )
      );

      setSuccessMessage(
        `${user.name}'s role was changed to ${
          ROLE_LABELS[nextRole] || nextRole
        }.`
      );
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.message ||
          "Unable to update the user's role."
      );
    } finally {
      setBusyId("");
    }
  };

  const handleStatusChange = async (
    user,
    nextStatus
  ) => {
    if (user.status === nextStatus) return;

    const actionLabel =
      nextStatus === "blocked"
        ? "block"
        : nextStatus === "active"
        ? "activate"
        : "deactivate";

    if (
      !window.confirm(
        `Are you sure you want to ${actionLabel} ${user.name}?`
      )
    ) {
      return;
    }

    try {
      setBusyId(user._id);
      setActionError("");
      setSuccessMessage("");

      const response = await api.patch(
        `/users/${user._id}/status`,
        { status: nextStatus }
      );

      setUsers((current) =>
        current.map((item) =>
          item._id === user._id
            ? response.data.data
            : item
        )
      );

      setSuccessMessage(
        `${user.name} is now ${
          STATUS_LABELS[nextStatus] || nextStatus
        }.`
      );
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.message ||
          "Unable to update the user's status."
      );
    } finally {
      setBusyId("");
    }
  };

  const handleDelete = async (user) => {
    if (
      !window.confirm(
        `Delete ${user.name}'s account? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setBusyId(user._id);
      setActionError("");
      setSuccessMessage("");

      await api.delete(`/users/${user._id}`);

      setUsers((current) =>
        current.filter((item) => item._id !== user._id)
      );

      setPagination((current) => ({
        ...current,
        total: Math.max(0, current.total - 1),
      }));

      setSuccessMessage(
        `${user.name} was deleted successfully.`
      );
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.message ||
          "Unable to delete the user."
      );
    } finally {
      setBusyId("");
    }
  };

  const handlePageChange = (nextPage) => {
    if (
      nextPage < 1 ||
      (pagination.totalPages &&
        nextPage > pagination.totalPages)
    ) {
      return;
    }

    fetchUsers(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const clearFilters = () => {
    setSearch("");
    setRole("all");
    setStatus("all");
  };

  return (
    <div className="space-y-6">
      <CRMPageHeader
        title="Users & roles"
        description="Manage platform users, access roles, and account status."
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {ROLES.map((currentRole) => {
          const Icon =
            currentRole === "provider"
              ? BriefcaseBusiness
              : currentRole === "admin"
              ? ShieldCheck
              : currentRole === "support"
              ? CircleUserRound
              : currentRole === "sales"
              ? UserRoundCog
              : UsersIcon;

          return (
            <button
              key={currentRole}
              type="button"
              className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                role === currentRole
                  ? "border-slate-400 bg-slate-50"
                  : "border-slate-200 bg-white"
              }`}
              onClick={() =>
                setRole(
                  role === currentRole
                    ? "all"
                    : currentRole
                )
              }
              aria-pressed={role === currentRole}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Icon size={17} aria-hidden="true" />
                </span>

                <span className="text-xl font-bold text-slate-950">
                  {roleCounts[currentRole] || 0}
                </span>
              </div>

              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {ROLE_LABELS[currentRole]}
              </p>
            </button>
          );
        })}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />

            <label
              htmlFor="user-search"
              className="sr-only"
            >
              Search users
            </label>

            <input
              id="user-search"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by name, email, or phone..."
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
          </div>

          <label
            htmlFor="role-filter"
            className="sr-only"
          >
            Filter by role
          </label>

          <select
            id="role-filter"
            value={role}
            onChange={(event) =>
              setRole(event.target.value)
            }
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            <option value="all">All roles</option>
            {ROLES.map((currentRole) => (
              <option
                key={currentRole}
                value={currentRole}
              >
                {ROLE_LABELS[currentRole]}
              </option>
            ))}
          </select>

          <label
            htmlFor="status-filter"
            className="sr-only"
          >
            Filter by status
          </label>

          <select
            id="status-filter"
            value={status}
            onChange={(event) =>
              setStatus(event.target.value)
            }
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            <option value="all">All statuses</option>
            {STATUSES.map((currentStatus) => (
              <option
                key={currentStatus}
                value={currentStatus}
              >
                {STATUS_LABELS[currentStatus]}
              </option>
            ))}
          </select>

          {(search || role !== "all" || status !== "all") && (
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
              onClick={clearFilters}
            >
              <X size={15} aria-hidden="true" />
              Clear
            </button>
          )}

          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() =>
              fetchUsers(pagination.page, {
                refresh: true,
              })
            }
            disabled={loading || refreshing}
            aria-label="Refresh users"
            title="Refresh users"
          >
            <RefreshCw
              size={15}
              className={
                refreshing ? "animate-spin" : ""
              }
              aria-hidden="true"
            />
            Refresh
          </button>

          <button
            type="button"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-xs font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
            onClick={handleCreate}
          >
            <Plus size={16} aria-hidden="true" />
            Add user
          </button>
        </div>
      </section>

      {actionError && (
        <div
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />

          <p className="flex-1">{actionError}</p>

          <button
            type="button"
            className="rounded-md p-1 transition hover:bg-red-100"
            onClick={() => setActionError("")}
            aria-label="Dismiss error"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {successMessage && (
        <div
          className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          role="status"
          aria-live="polite"
        >
          <Check
            size={18}
            className="shrink-0"
            aria-hidden="true"
          />

          <p className="flex-1">{successMessage}</p>

          <button
            type="button"
            className="rounded-md p-1 transition hover:bg-emerald-100"
            onClick={() => setSuccessMessage("")}
            aria-label="Dismiss success message"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {loading ? (
        <section
          className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <Loader2
              size={20}
              className="animate-spin"
              aria-hidden="true"
            />
            Loading users...
          </div>
        </section>
      ) : error ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle
            size={28}
            className="mx-auto text-red-500"
            aria-hidden="true"
          />

          <h2 className="mt-3 text-sm font-semibold text-slate-900">
            Users could not be loaded
          </h2>

          <p className="mt-1 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
            onClick={() => fetchUsers(1)}
          >
            <RefreshCw
              size={15}
              aria-hidden="true"
            />
            Try again
          </button>
        </section>
      ) : users.length === 0 ? (
        <section className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"
            aria-hidden="true"
          >
            <UsersIcon size={25} />
          </span>

          <h2 className="mt-4 text-sm font-semibold text-slate-900">
            No users found
          </h2>

          <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
            Try adjusting your search or filters, or create
            a new user.
          </p>
        </section>
      ) : (
        <>
          <section className="hidden overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      User
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Contact
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Role
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Joined
                    </th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <UserAvatar user={user} />

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {user.name}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-slate-400">
                              ID: {user._id.slice(-8)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Mail
                              size={13}
                              aria-hidden="true"
                            />
                            <span className="max-w-[230px] truncate">
                              {user.email}
                            </span>
                          </div>

                          {user.phone && (
                            <div className="flex items-center gap-2 text-slate-400">
                              <Phone
                                size={13}
                                aria-hidden="true"
                              />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={user.role}
                          disabled={busyId === user._id}
                          aria-label={`Change role for ${user.name}`}
                          onChange={(event) =>
                            handleRoleChange(
                              user,
                              event.target.value
                            )
                          }
                          className={`rounded-full border-0 px-2.5 py-1 text-[11px] font-semibold outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50 ${
                            roleBadgeClass[user.role]
                          }`}
                        >
                          {ROLES.map((currentRole) => (
                            <option
                              key={currentRole}
                              value={currentRole}
                            >
                              {ROLE_LABELS[currentRole]}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-5 py-4">
                        <Badge
                          className={
                            statusBadgeClass[user.status]
                          }
                        >
                          {STATUS_LABELS[user.status] ||
                            user.status}
                        </Badge>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-500">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <UserActionsMenu
                            user={user}
                            onView={handleView}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onStatusChange={
                              handleStatusChange
                            }
                            busy={busyId === user._id}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section
            className="space-y-3 lg:hidden"
            aria-label="Users"
          >
            {users.map((user) => (
              <article
                key={user._id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <UserAvatar user={user} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-semibold text-slate-900">
                          {user.name}
                        </h2>

                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          {user.email}
                        </p>
                      </div>

                      <UserActionsMenu
                        user={user}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onStatusChange={
                          handleStatusChange
                        }
                        busy={busyId === user._id}
                      />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Badge
                        className={
                          roleBadgeClass[user.role]
                        }
                      >
                        {ROLE_LABELS[user.role] ||
                          user.role}
                      </Badge>

                      <Badge
                        className={
                          statusBadgeClass[user.status]
                        }
                      >
                        {STATUS_LABELS[user.status] ||
                          user.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Phone
                      size={13}
                      aria-hidden="true"
                    />
                    {user.phone || "No phone"}
                  </div>

                  <div className="flex items-center gap-2">
                    <CircleUserRound
                      size={13}
                      aria-hidden="true"
                    />
                    Joined {formatDate(user.createdAt)}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    onClick={() => handleView(user)}
                  >
                    <Eye
                      size={14}
                      aria-hidden="true"
                    />
                    View
                  </button>

                  <button
                    type="button"
                    className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-slate-950 text-xs font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit3
                      size={14}
                      aria-hidden="true"
                    />
                    Edit
                  </button>
                </div>
              </article>
            ))}
          </section>

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}

      {formModal.open && (
        <UserFormModal
          mode={formModal.mode}
          user={formModal.user}
          onClose={() =>
            setFormModal({
              open: false,
              mode: "create",
              user: null,
            })
          }
          onSubmit={handleSubmitUser}
          submitting={submitting}
        />
      )}
    </div>
  );
}