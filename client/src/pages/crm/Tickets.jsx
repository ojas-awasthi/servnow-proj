import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Loader2,
  MessageSquareText,
  Pencil,
  RefreshCw,
  Search,
  TicketCheck,
  Trash2,
  UserRound,
  X,
  XCircle,
} from "lucide-react";

import api from "../../services/api";
import CRMPageHeader from "../../components/crm/CRMPageHeader";

const STATUS_OPTIONS = [
  "all",
  "open",
  "assigned",
  "in_progress",
  "resolved",
  "closed",
];

const PRIORITY_OPTIONS = [
  "all",
  "low",
  "medium",
  "high",
  "urgent",
];

const CATEGORY_OPTIONS = [
  "all",
  "booking",
  "payment",
  "service",
  "account",
  "technical",
  "other",
];

const formatLabel = (value) => {
  if (!value) return "—";

  return value
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join(" ");
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getPriorityClasses = (priority) => {
  switch (priority) {
    case "urgent":
      return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200";

    case "high":
      return "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200";

    case "medium":
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";

    case "low":
      return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";

    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
  }
};

const getStatusClasses = (status) => {
  switch (status) {
    case "open":
      return "bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200";

    case "assigned":
      return "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-200";

    case "in_progress":
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";

    case "resolved":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";

    case "closed":
      return "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200";

    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "resolved":
    case "closed":
      return CheckCircle2;

    case "in_progress":
      return Clock3;

    default:
      return MessageSquareText;
  }
};

function Tickets() {
  const [tickets, setTickets] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [category, setCategory] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTicket, setSelectedTicket] =
    useState(null);

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const [editingTicket, setEditingTicket] =
    useState(null);

  const [editForm, setEditForm] = useState({
    subject: "",
    description: "",
    priority: "medium",
    category: "other",
  });

  const [savingEdit, setSavingEdit] = useState(false);

  const [statusUpdating, setStatusUpdating] =
    useState(false);

  const [assignmentUpdating, setAssignmentUpdating] =
    useState(false);

  const [resolutionText, setResolutionText] =
    useState("");

  const [resolving, setResolving] = useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [deleting, setDeleting] = useState(false);

  const [supportUsers, setSupportUsers] =
    useState([]);

  const [usersLoading, setUsersLoading] =
    useState(false);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        status:
          status !== "all" ? status : undefined,
        priority:
          priority !== "all" ? priority : undefined,
        category:
          category !== "all" ? category : undefined,
      };

      const response = await api.get("/tickets", {
        params,
      });

      const responseData = response.data;

      setTickets(
        Array.isArray(responseData?.data)
          ? responseData.data
          : []
      );

      setPagination(
        responseData?.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      console.error(
        "Failed to load support tickets:",
        err
      );

      setTickets([]);

      setError(
        err.response?.data?.message ||
          "Unable to load support tickets. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [
    page,
    search,
    status,
    priority,
    category,
  ]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const fetchSupportUsers = useCallback(async () => {
    try {
      setUsersLoading(true);

      const response = await api.get("/users", {
        params: {
          role: "support",
          status: "active",
          limit: 100,
        },
      });

      const data = response.data?.data;

      setSupportUsers(
        Array.isArray(data)
          ? data
          : Array.isArray(data?.users)
          ? data.users
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load support users:",
        err
      );

      setSupportUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSupportUsers();
  }, [fetchSupportUsers]);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (event) => {
    setStatus(event.target.value);
    setPage(1);
  };

  const handlePriorityFilterChange = (event) => {
    setPriority(event.target.value);
    setPage(1);
  };

  const handleCategoryFilterChange = (event) => {
    setCategory(event.target.value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setPriority("all");
    setCategory("all");
    setPage(1);
  };

  const hasActiveFilters = useMemo(
    () =>
      Boolean(
        search.trim() ||
          status !== "all" ||
          priority !== "all" ||
          category !== "all"
      ),
    [search, status, priority, category]
  );

  const openDetails = async (ticket) => {
    try {
      setDetailsLoading(true);
      setSelectedTicket(ticket);
      setResolutionText(ticket.resolution || "");

      const response = await api.get(
        `/tickets/${ticket._id}`
      );

      const latestTicket =
        response.data?.data || ticket;

      setSelectedTicket(latestTicket);
      setResolutionText(
        latestTicket.resolution || ""
      );
    } catch (err) {
      console.error(
        "Failed to load ticket details:",
        err
      );

      setSelectedTicket(ticket);
      setResolutionText(ticket.resolution || "");
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    if (
      statusUpdating ||
      assignmentUpdating ||
      resolving
    ) {
      return;
    }

    setSelectedTicket(null);
    setResolutionText("");
  };

  const openEdit = (ticket) => {
    setEditingTicket(ticket);

    setEditForm({
      subject: ticket.subject || "",
      description: ticket.description || "",
      priority: ticket.priority || "medium",
      category: ticket.category || "other",
    });
  };

  const closeEdit = () => {
    if (savingEdit) return;

    setEditingTicket(null);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    if (!editingTicket) return;

    try {
      setSavingEdit(true);

      const response = await api.put(
        `/tickets/${editingTicket._id}`,
        editForm
      );

      const updatedTicket =
        response.data?.data;

      setEditingTicket(null);

      if (
        selectedTicket?._id === editingTicket._id &&
        updatedTicket
      ) {
        setSelectedTicket(updatedTicket);
      }

      await fetchTickets();
    } catch (err) {
      console.error(
        "Failed to update ticket:",
        err
      );

      window.alert(
        err.response?.data?.message ||
          "Unable to update the ticket."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleStatusChange = async (
    ticketId,
    nextStatus
  ) => {
    try {
      setStatusUpdating(true);

      const response = await api.patch(
        `/tickets/${ticketId}/status`,
        {
          status: nextStatus,
        }
      );

      const updatedTicket =
        response.data?.data;

      if (
        selectedTicket?._id === ticketId &&
        updatedTicket
      ) {
        setSelectedTicket(updatedTicket);
      }

      await fetchTickets();
    } catch (err) {
      console.error(
        "Failed to update ticket status:",
        err
      );

      window.alert(
        err.response?.data?.message ||
          "Unable to update ticket status."
      );
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAssignmentChange = async (
    ticketId,
    assignedTo
  ) => {
    if (!assignedTo) return;

    try {
      setAssignmentUpdating(true);

      const response = await api.patch(
        `/tickets/${ticketId}/assign`,
        {
          assignedTo: String(assignedTo),
        }
      );

      const updatedTicket =
        response.data?.data;

      if (
        selectedTicket?._id === ticketId &&
        updatedTicket
      ) {
        setSelectedTicket(updatedTicket);
      }

      await fetchTickets();
    } catch (err) {
      console.error(
        "Failed to assign ticket:",
        err
      );

      window.alert(
        err.response?.data?.message ||
          "Unable to assign ticket."
      );
    } finally {
      setAssignmentUpdating(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedTicket) return;

    if (!resolutionText.trim()) {
      window.alert(
        "Please enter a resolution before resolving the ticket."
      );
      return;
    }

    try {
      setResolving(true);

      const response = await api.patch(
        `/tickets/${selectedTicket._id}/resolve`,
        {
          resolution: resolutionText.trim(),
        }
      );

      const updatedTicket =
        response.data?.data;

      if (updatedTicket) {
        setSelectedTicket(updatedTicket);
      }

      setResolutionText(
        updatedTicket?.resolution ||
          resolutionText.trim()
      );

      await fetchTickets();
    } catch (err) {
      console.error(
        "Failed to resolve ticket:",
        err
      );

      window.alert(
        err.response?.data?.message ||
          "Unable to resolve ticket."
      );
    } finally {
      setResolving(false);
    }
  };

  const confirmDelete = (ticket) => {
    setDeleteTarget(ticket);
  };

  const cancelDelete = () => {
    if (deleting) return;

    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      await api.delete(
        `/tickets/${deleteTarget._id}`
      );

      if (
        selectedTicket?._id ===
        deleteTarget._id
      ) {
        setSelectedTicket(null);
      }

      setDeleteTarget(null);

      await fetchTickets();
    } catch (err) {
      console.error(
        "Failed to delete ticket:",
        err
      );

      window.alert(
        err.response?.data?.message ||
          "Unable to delete ticket."
      );
    } finally {
      setDeleting(false);
    }
  };

  const canGoPrevious = pagination.page > 1;

  const canGoNext =
    pagination.page < pagination.totalPages;

  return (
    <div className="space-y-6">
      <CRMPageHeader
        eyebrow="Support"
        title="Support Tickets"
        description="Manage customer issues, assignments, resolutions, and ticket status."
      />

      <section
        aria-label="Ticket filters"
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative min-w-0 flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />

              <input
                type="search"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search subject or description..."
                aria-label="Search support tickets"
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <button
              type="button"
              onClick={fetchTickets}
              disabled={loading}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Refresh support tickets"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
                aria-hidden="true"
              />
              Refresh
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-500">
                Status
              </span>

              <select
                value={status}
                onChange={handleStatusFilterChange}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option === "all"
                      ? "All statuses"
                      : formatLabel(option)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-500">
                Priority
              </span>

              <select
                value={priority}
                onChange={handlePriorityFilterChange}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                {PRIORITY_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option === "all"
                        ? "All priorities"
                        : formatLabel(option)}
                    </option>
                  )
                )}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-medium text-slate-500">
                Category
              </span>

              <select
                value={category}
                onChange={handleCategoryFilterChange}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              >
                {CATEGORY_OPTIONS.map(
                  (option) => (
                    <option
                      key={option}
                      value={option}
                    >
                      {option === "all"
                        ? "All categories"
                        : formatLabel(option)}
                    </option>
                  )
                )}
              </select>
            </label>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-500">
                Filters are applied automatically.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition hover:text-slate-950"
              >
                <X
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                Clear filters
              </button>
            </div>
          )}
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700"
        >
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0"
            aria-hidden="true"
          />

          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              Unable to load support tickets
            </p>

            <p className="mt-1 text-rose-600">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={fetchTickets}
            className="shrink-0 rounded-lg px-2 py-1 font-medium transition hover:bg-rose-100"
          >
            Retry
          </button>
        </div>
      )}

      <section
        aria-label="Support tickets"
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Customer support tickets
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {pagination.total}{" "}
              {pagination.total === 1
                ? "ticket"
                : "tickets"}
            </p>
          </div>

          <TicketCheck
            className="h-5 w-5 text-slate-400"
            aria-hidden="true"
          />
        </div>

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
              Loading tickets...
            </div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <MessageSquareText
                className="h-6 w-6 text-slate-400"
                aria-hidden="true"
              />
            </div>

            <h3 className="mt-4 text-sm font-semibold text-slate-900">
              No tickets found
            </h3>

            <p className="mt-1 max-w-md text-sm text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[1050px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Ticket
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Customer
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Category
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Priority
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Assigned to
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {tickets.map((ticket) => {
                    const StatusIcon =
                      getStatusIcon(
                        ticket.status
                      );

                    return (
                      <tr
                        key={ticket._id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="max-w-[260px] px-5 py-4">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            {ticket.subject}
                          </p>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {formatDate(
                              ticket.createdAt
                            )}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-slate-900">
                            {ticket.customer?.name ||
                              "Unknown"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {ticket.customer?.email ||
                              "—"}
                          </p>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {formatLabel(
                            ticket.category
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityClasses(
                              ticket.priority
                            )}`}
                          >
                            {formatLabel(
                              ticket.priority
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                              ticket.status
                            )}`}
                          >
                            <StatusIcon
                              className="h-3.5 w-3.5"
                              aria-hidden="true"
                            />
                            {formatLabel(
                              ticket.status
                            )}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {ticket.assignedTo?.name ||
                            "Unassigned"}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                openDetails(ticket)
                              }
                              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                              aria-label={`View ticket ${ticket.subject}`}
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
                                openEdit(ticket)
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-950"
                              aria-label={`Edit ticket ${ticket.subject}`}
                            >
                              <Pencil
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                confirmDelete(ticket)
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-rose-200 bg-white text-rose-600 transition hover:bg-rose-50"
                              aria-label={`Delete ticket ${ticket.subject}`}
                            >
                              <Trash2
                                className="h-4 w-4"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="divide-y divide-slate-100 md:hidden">
              {tickets.map((ticket) => {
                const StatusIcon =
                  getStatusIcon(ticket.status);

                return (
                  <article
                    key={ticket._id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                          {ticket.subject}
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(
                            ticket.createdAt
                          )}
                        </p>
                      </div>

                      <span
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                          ticket.status
                        )}`}
                      >
                        <StatusIcon
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        {formatLabel(
                          ticket.status
                        )}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-500">
                          Customer
                        </p>

                        <p className="mt-1 truncate text-sm font-medium text-slate-900">
                          {ticket.customer?.name ||
                            "Unknown"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Priority
                        </p>

                        <span
                          className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityClasses(
                            ticket.priority
                          )}`}
                        >
                          {formatLabel(
                            ticket.priority
                          )}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Category
                        </p>

                        <p className="mt-1 text-sm text-slate-700">
                          {formatLabel(
                            ticket.category
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Assigned to
                        </p>

                        <p className="mt-1 truncate text-sm text-slate-700">
                          {ticket.assignedTo?.name ||
                            "Unassigned"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openDetails(ticket)
                        }
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
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
                          openEdit(ticket)
                        }
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <Pencil
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          confirmDelete(ticket)
                        }
                        className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        <Trash2
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                        Delete
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}

        {!loading && tickets.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-xs text-slate-500">
              Page {pagination.page} of{" "}
              {pagination.totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.max(current - 1, 1)
                  )
                }
                disabled={!canGoPrevious}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                Previous
              </button>

              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      current + 1,
                      pagination.totalPages
                    )
                  )
                }
                disabled={!canGoNext}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                Next
                <ChevronRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Details modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDetails();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-details-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Support ticket
                </p>

                <h2
                  id="ticket-details-title"
                  className="mt-1 truncate text-base font-semibold text-slate-900"
                >
                  {selectedTicket.subject}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close ticket details"
              >
                <X
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>

            {detailsLoading && (
              <div
                className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500"
                role="status"
              >
                <Loader2
                  className="h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Loading latest ticket details...
              </div>
            )}

            <div className="space-y-6 p-5">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                    selectedTicket.status
                  )}`}
                >
                  {formatLabel(
                    selectedTicket.status
                  )}
                </span>

                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPriorityClasses(
                    selectedTicket.priority
                  )}`}
                >
                  {formatLabel(
                    selectedTicket.priority
                  )}
                </span>

                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                  {formatLabel(
                    selectedTicket.category
                  )}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Description
                </h3>

                <p className="mt-2 whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  {selectedTicket.description}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <UserRound
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                    Customer
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedTicket.customer?.name ||
                      "Unknown"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedTicket.customer?.email ||
                      "—"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedTicket.customer?.phone ||
                      "—"}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <UserRound
                      className="h-4 w-4"
                      aria-hidden="true"
                    />
                    Assigned to
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {selectedTicket.assignedTo
                      ?.name || "Unassigned"}
                  </p>

                  {selectedTicket.assignedTo && (
                    <>
                      <p className="mt-1 text-sm text-slate-500">
                        {
                          selectedTicket.assignedTo
                            .email
                        }
                      </p>

                      <p className="mt-1 text-xs capitalize text-slate-400">
                        {
                          selectedTicket.assignedTo
                            .role
                        }
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Ticket timeline
                </h3>

                <div className="mt-3 rounded-xl border border-slate-200">
                  <div className="flex items-start gap-3 border-b border-slate-100 p-4">
                    <CalendarDays
                      className="mt-0.5 h-4 w-4 text-slate-400"
                      aria-hidden="true"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Created
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {formatDate(
                          selectedTicket.createdAt
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4">
                    <Clock3
                      className="mt-0.5 h-4 w-4 text-slate-400"
                      aria-hidden="true"
                    />

                    <div>
                      <p className="text-xs text-slate-500">
                        Last updated
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {formatDate(
                          selectedTicket.updatedAt
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Manage ticket
                </h3>

                <div className="mt-3 space-y-4 rounded-xl border border-slate-200 p-4">
                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-slate-500">
                      Status
                    </span>

                    <select
                      value={
                        selectedTicket.status
                      }
                      onChange={(event) =>
                        handleStatusChange(
                          selectedTicket._id,
                          event.target.value
                        )
                      }
                      disabled={statusUpdating}
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {STATUS_OPTIONS.filter(
                        (option) =>
                          option !== "all"
                      ).map((option) => (
                        <option
                          key={option}
                          value={option}
                        >
                          {formatLabel(option)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block space-y-1.5">
                    <span className="text-xs font-medium text-slate-500">
                      Assign to
                    </span>

                    <select
                      value={
                        selectedTicket.assignedTo
                          ?._id || ""
                      }
                      onChange={(event) =>
                        handleAssignmentChange(
                          selectedTicket._id,
                          event.target.value
                        )
                      }
                      disabled={
                        assignmentUpdating ||
                        usersLoading
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">
                        Select support user
                      </option>

                      {supportUsers.map(
                        (user) => (
                          <option
                            key={user._id}
                            value={user._id}
                          >
                            {user.name} —{" "}
                            {user.email}
                          </option>
                        )
                      )}
                    </select>

                    <p className="text-xs text-slate-400">
                      Existing backend does not support clearing an assignment.
                    </p>
                  </label>

                  <div>
                    <label className="block text-xs font-medium text-slate-500">
                      Resolution
                    </label>

                    <textarea
                      value={resolutionText}
                      onChange={(event) =>
                        setResolutionText(
                          event.target.value
                        )
                      }
                      placeholder="Describe how the issue was resolved..."
                      rows={4}
                      className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                    />

                    <button
                      type="button"
                      onClick={handleResolve}
                      disabled={
                        resolving ||
                        !resolutionText.trim() ||
                        selectedTicket.status ===
                          "resolved"
                      }
                      className="mt-3 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {resolving ? (
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <CheckCircle2
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      )}

                      {resolving
                        ? "Resolving..."
                        : "Resolve ticket"}
                    </button>
                  </div>
                </div>
              </div>

              {selectedTicket.resolution && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Resolution
                  </h3>

                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="whitespace-pre-wrap text-sm leading-6 text-emerald-900">
                      {selectedTicket.resolution}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={() =>
                  openEdit(selectedTicket)
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Pencil
                  className="h-4 w-4"
                  aria-hidden="true"
                />
                Edit
              </button>

              <button
                type="button"
                onClick={closeDetails}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingTicket && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          role="presentation"
        >
          <form
            onSubmit={handleEditSubmit}
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-ticket-title"
            className="w-full max-w-xl rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Ticket
                </p>

                <h2
                  id="edit-ticket-title"
                  className="mt-1 text-base font-semibold text-slate-900"
                >
                  Edit ticket
                </h2>
              </div>

              <button
                type="button"
                onClick={closeEdit}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                aria-label="Close edit ticket dialog"
              >
                <X
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-500">
                  Subject
                </span>

                <input
                  name="subject"
                  value={editForm.subject}
                  onChange={handleEditChange}
                  minLength={3}
                  maxLength={200}
                  required
                  className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-500">
                  Description
                </span>

                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  minLength={5}
                  maxLength={3000}
                  required
                  rows={6}
                  className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-500">
                    Priority
                  </span>

                  <select
                    name="priority"
                    value={editForm.priority}
                    onChange={handleEditChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    {PRIORITY_OPTIONS.filter(
                      (option) =>
                        option !== "all"
                    ).map((option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {formatLabel(option)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-1.5">
                  <span className="text-xs font-medium text-slate-500">
                    Category
                  </span>

                  <select
                    name="category"
                    value={editForm.category}
                    onChange={handleEditChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                  >
                    {CATEGORY_OPTIONS.filter(
                      (option) =>
                        option !== "all"
                    ).map((option) => (
                      <option
                        key={option}
                        value={option}
                      >
                        {formatLabel(option)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={closeEdit}
                disabled={savingEdit}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={savingEdit}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingEdit && (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                )}

                {savingEdit
                  ? "Saving..."
                  : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-ticket-title"
            className="w-full max-w-md rounded-2xl bg-white shadow-2xl"
          >
            <div className="p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50">
                <Trash2
                  className="h-5 w-5 text-rose-600"
                  aria-hidden="true"
                />
              </div>

              <h2
                id="delete-ticket-title"
                className="mt-4 text-base font-semibold text-slate-900"
              >
                Delete this ticket?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                This will permanently remove{" "}
                <span className="font-medium text-slate-700">
                  {deleteTarget.subject}
                </span>
                . This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={cancelDelete}
                disabled={deleting}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting && (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                )}

                {deleting
                  ? "Deleting..."
                  : "Delete ticket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tickets;