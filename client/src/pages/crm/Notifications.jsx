import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CreditCard,
  Inbox,
  Loader2,
  MoreVertical,
  RefreshCw,
  TicketCheck,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";

import api from "../../services/api";
import CRMPageHeader from "../../components/crm/CRMPageHeader";

const PAGE_SIZE = 10;

const TYPE_META = {
  booking: { label: "Booking", icon: BellRing },
  payment: { label: "Payment", icon: CreditCard },
  lead: { label: "Lead", icon: UserPlus },
  ticket: { label: "Ticket", icon: TicketCheck },
  system: { label: "System", icon: CircleAlert },
};

const formatRelativeTime = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const diff = Date.now() - date.getTime();
  const seconds = Math.max(0, Math.floor(diff / 1000));

  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year:
      date.getFullYear() !== new Date().getFullYear()
        ? "numeric"
        : undefined,
  });
};

const formatFullDate = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

function NotificationTypeIcon({ type }) {
  const Icon = TYPE_META[type]?.icon || Bell;

  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700"
      aria-hidden="true"
    >
      <Icon size={18} strokeWidth={1.9} />
    </span>
  );
}

function NotificationMenu({
  notification,
  onMarkRead,
  onDelete,
  busy,
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const close = () => setOpen(false);

    window.addEventListener("click", close);

    return () => window.removeEventListener("click", close);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={`More actions for ${notification.title}`}
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
          className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
          role="menu"
          onClick={(event) => event.stopPropagation()}
        >
          {!notification.isRead && (
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-50"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onMarkRead(notification);
              }}
            >
              <Check size={16} aria-hidden="true" />
              Mark as read
            </button>
          )}

          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onDelete(notification);
            }}
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

function NotificationCard({
  notification,
  onMarkRead,
  onDelete,
  busy,
}) {
  const type = TYPE_META[notification.type] || TYPE_META.system;

  return (
    <article
      className={`group relative rounded-2xl border p-4 transition duration-200 sm:p-5 ${
        notification.isRead
          ? "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
          : "border-slate-300 bg-slate-50/80 shadow-sm hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      {!notification.isRead && (
        <span
          className="absolute left-0 top-5 h-10 w-1 rounded-r-full bg-slate-900"
          aria-label="Unread notification"
        />
      )}

      <div className="flex gap-3 sm:gap-4">
        <NotificationTypeIcon type={notification.type} />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  className={`text-sm font-semibold sm:text-[15px] ${
                    notification.isRead
                      ? "text-slate-800"
                      : "text-slate-950"
                  }`}
                >
                  {notification.title}
                </h2>

                {!notification.isRead && (
                  <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                    New
                  </span>
                )}
              </div>

              <p className="mt-1 text-xs font-medium text-slate-400">
                {type.label} ·{" "}
                <time
                  dateTime={notification.createdAt}
                  title={formatFullDate(notification.createdAt)}
                >
                  {formatRelativeTime(notification.createdAt)}
                </time>
              </p>
            </div>

            <NotificationMenu
              notification={notification}
              onMarkRead={onMarkRead}
              onDelete={onDelete}
              busy={busy}
            />
          </div>

          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            {notification.message}
          </p>

          {!notification.isRead && (
            <div className="mt-4">
              <button
                type="button"
                className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => onMarkRead(notification)}
                disabled={busy}
              >
                {busy ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Check size={14} aria-hidden="true" />
                )}
                Mark as read
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between"
      aria-label="Notifications pagination"
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
          aria-label="Previous page"
        >
          <ChevronLeft size={15} aria-hidden="true" />
          Previous
        </button>

        <button
          type="button"
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          Next
          <ChevronRight size={15} aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });

  const [readFilter, setReadFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [busyId, setBusyId] = useState("");

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) => !notification.isRead
      ).length,
    [notifications]
  );

  const fetchNotifications = useCallback(
    async (requestedPage = 1, options = {}) => {
      const isRefresh = options.refresh === true;

      try {
        setError("");
        setActionError("");

        if (isRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const params = {
          page: requestedPage,
          limit: PAGE_SIZE,
        };

        if (readFilter !== "all") {
          params.isRead =
            readFilter === "unread" ? "false" : "true";
        }

        if (typeFilter !== "all") {
          params.type = typeFilter;
        }

        const response = await api.get("/notifications", {
          params,
        });

        setNotifications(response.data.data || []);

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
            "Unable to load notifications. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [readFilter, typeFilter]
  );

  useEffect(() => {
    fetchNotifications(1);
  }, [readFilter, typeFilter, fetchNotifications]);

  const handleMarkRead = async (notification) => {
    if (notification.isRead) return;

    try {
      setBusyId(notification._id);
      setActionError("");

      const response = await api.patch(
        `/notifications/${notification._id}/read`
      );

      const updated = response.data.data;

      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id
            ? {
                ...item,
                ...(updated || {}),
                isRead: true,
              }
            : item
        )
      );
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.message ||
          "Unable to mark the notification as read."
      );
    } finally {
      setBusyId("");
    }
  };

  const handleMarkAllRead = async () => {
    if (!unreadCount) return;

    try {
      setBusyId("all");
      setActionError("");

      await api.patch("/notifications/read-all");

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.message ||
          "Unable to mark notifications as read."
      );
    } finally {
      setBusyId("");
    }
  };

  const handleDelete = async (notification) => {
    try {
      setBusyId(notification._id);
      setActionError("");

      await api.delete(
        `/notifications/${notification._id}`
      );

      setNotifications((current) =>
        current.filter(
          (item) => item._id !== notification._id
        )
      );

      setPagination((current) => ({
        ...current,
        total: Math.max(0, current.total - 1),
      }));
    } catch (requestError) {
      setActionError(
        requestError.response?.data?.message ||
          "Unable to delete the notification."
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

    fetchNotifications(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-6">
      <CRMPageHeader
        title="Notifications"
        description="Stay on top of bookings, payments, leads, tickets, and system updates."
      />

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
              Notification center
            </p>

            <div className="mt-1 flex flex-wrap items-center gap-2">
              <p className="text-lg font-semibold text-slate-950">
                {pagination.total} notification
                {pagination.total === 1 ? "" : "s"}
              </p>

              {unreadCount > 0 && (
                <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                  {unreadCount} unread
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleMarkAllRead}
              disabled={
                !unreadCount || busyId === "all"
              }
            >
              {busyId === "all" ? (
                <Loader2
                  size={15}
                  className="animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <CheckCheck
                  size={15}
                  aria-hidden="true"
                />
              )}
              Mark all as read
            </button>

            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() =>
                fetchNotifications(
                  pagination.page,
                  { refresh: true }
                )
              }
              disabled={loading || refreshing}
              aria-label="Refresh notifications"
              title="Refresh notifications"
            >
              <RefreshCw
                size={16}
                className={
                  refreshing ? "animate-spin" : ""
                }
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-4 lg:flex-row lg:items-center">
          <div
            className="flex flex-wrap gap-2"
            aria-label="Read status filter"
          >
            {[
              ["all", "All"],
              ["unread", "Unread"],
              ["read", "Read"],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-slate-300 ${
                  readFilter === value
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
                aria-pressed={readFilter === value}
                onClick={() => setReadFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="h-px bg-slate-100 lg:h-6 lg:w-px" />

          <label
            className="sr-only"
            htmlFor="notification-type"
          >
            Filter by notification type
          </label>

          <select
            id="notification-type"
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
            className="min-h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
          >
            <option value="all">All types</option>
            <option value="booking">Booking</option>
            <option value="payment">Payment</option>
            <option value="lead">Lead</option>
            <option value="ticket">Ticket</option>
            <option value="system">System</option>
          </select>
        </div>
      </section>

      {actionError && (
        <div
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          role="alert"
        >
          <CircleAlert
            size={18}
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />

          <p className="flex-1">{actionError}</p>

          <button
            type="button"
            className="rounded-md p-1 transition hover:bg-red-100"
            onClick={() => setActionError("")}
            aria-label="Dismiss notification error"
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
            Loading notifications...
          </div>
        </section>
      ) : error ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <CircleAlert
            size={28}
            className="mx-auto text-red-500"
            aria-hidden="true"
          />

          <h2 className="mt-3 text-sm font-semibold text-slate-900">
            Notifications could not be loaded
          </h2>

          <p className="mt-1 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-300"
            onClick={() => fetchNotifications(1)}
          >
            <RefreshCw
              size={15}
              aria-hidden="true"
            />
            Try again
          </button>
        </section>
      ) : notifications.length === 0 ? (
        <section className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center">
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500"
            aria-hidden="true"
          >
            <Inbox size={25} />
          </span>

          <h2 className="mt-4 text-sm font-semibold text-slate-900">
            No notifications here
          </h2>

          <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
            Try another filter or check back when there are
            new updates.
          </p>
        </section>
      ) : (
        <section
          className="space-y-3"
          aria-label="Notifications"
        >
          {notifications.map((notification) => (
            <NotificationCard
              key={notification._id}
              notification={notification}
              onMarkRead={handleMarkRead}
              onDelete={handleDelete}
              busy={busyId === notification._id}
            />
          ))}

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </section>
      )}
    </div>
  );
}