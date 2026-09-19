import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Eye,
  Filter,
  GripVertical,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import api from "../../services/api";
import CRMPageHeader from "../../components/crm/CRMPageHeader";

const LEAD_STATUSES = [
  "new",
  "contacted",
  "qualified",
  "proposal",
  "converted",
  "lost",
];

const PRIORITIES = ["low", "medium", "high"];

const SOURCES = [
  "website",
  "referral",
  "social_media",
  "advertisement",
  "other",
];

const STATUS_LABELS = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  proposal: "Proposal",
  converted: "Converted",
  lost: "Lost",
};

const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

const SOURCE_LABELS = {
  website: "Website",
  referral: "Referral",
  social_media: "Social media",
  advertisement: "Advertisement",
  other: "Other",
};

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  source: "",
  serviceInterest: "",
  priority: "medium",
  notes: "",
  followUpDate: "",
};

const formatLabel = (value) => {
  if (!value) return "—";

  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const toDateTimeLocal = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localOffset = date.getTimezoneOffset() * 60000;
  const localDate = new Date(date.getTime() - localOffset);

  return localDate.toISOString().slice(0, 16);
};

const getStatusClasses = (status) => {
  const classes = {
    new: "bg-slate-100 text-slate-700 ring-slate-200",
    contacted: "bg-blue-50 text-blue-700 ring-blue-200",
    qualified: "bg-violet-50 text-violet-700 ring-violet-200",
    proposal: "bg-amber-50 text-amber-700 ring-amber-200",
    converted: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    lost: "bg-rose-50 text-rose-700 ring-rose-200",
  };

  return classes[status] || classes.new;
};

const getPriorityClasses = (priority) => {
  const classes = {
    low: "bg-slate-100 text-slate-600 ring-slate-200",
    medium: "bg-amber-50 text-amber-700 ring-amber-200",
    high: "bg-rose-50 text-rose-700 ring-rose-200",
  };

  return classes[priority] || classes.medium;
};

const LeadBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getStatusClasses(
      status
    )}`}
  >
    <CircleDot className="h-3 w-3" aria-hidden="true" />
    {STATUS_LABELS[status] || formatLabel(status)}
  </span>
);

const PriorityBadge = ({ priority }) => (
  <span
    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${getPriorityClasses(
      priority
    )}`}
  >
    {PRIORITY_LABELS[priority] || formatLabel(priority)}
  </span>
);

function Leads() {
  const [leads, setLeads] = useState([]);
  const [salesUsers, setSalesUsers] = useState([]);
  const [services, setServices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [assignedFilter, setAssignedFilter] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [viewMode, setViewMode] = useState("list");

  const [selectedLead, setSelectedLead] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);

  const [draggedLeadId, setDraggedLeadId] = useState(null);

  const [followUpType, setFollowUpType] = useState("");
  const [followUps, setFollowUps] = useState([]);
  const [followUpsLoading, setFollowUpsLoading] = useState(false);

  const queryParams = useMemo(() => {
    const params = {
      page,
      limit,
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    if (statusFilter) {
      params.status = statusFilter;
    }

    if (priorityFilter) {
      params.priority = priorityFilter;
    }

    if (sourceFilter) {
      params.source = sourceFilter;
    }

    if (assignedFilter) {
      params.assignedTo = assignedFilter;
    }

    return params;
  }, [
    page,
    limit,
    search,
    statusFilter,
    priorityFilter,
    sourceFilter,
    assignedFilter,
  ]);

 const fetchLeads = async () => {
  try {
    setLoading(true);
    setError("");

    const response = await api.get("/leads", {
      params: {
        page,
        limit,
      },
    });

    console.log("LEADS API RESPONSE:", response.data);

    setLeads(
      Array.isArray(response.data?.data)
        ? response.data.data
        : []
    );

    setPagination(
      response.data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      }
    );
  } catch (err) {
    console.error("Failed to load leads:", err);

    setError(
      err.response?.data?.message ||
        "Unable to load leads. Please try again."
    );

    setLeads([]);
  } finally {
    setLoading(false);
  }
};

  const fetchSalesUsers = async () => {
    try {
      setLoadingUsers(true);

      const response = await api.get("/users", {
        params: {
          role: "sales",
          limit: 100,
        },
      });

      setSalesUsers(response.data?.data || []);
    } catch (err) {
      console.error("Failed to load sales users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchServices = async () => {
    try {
      setLoadingServices(true);

      const response = await api.get("/services", {
        params: {
          limit: 100,
          status: "active",
        },
      });

      setServices(response.data?.data || []);
    } catch (err) {
      console.error("Failed to load services:", err);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchFollowUps = async (type) => {
    if (!type) {
      setFollowUps([]);
      return;
    }

    try {
      setFollowUpsLoading(true);

      const response = await api.get("/leads/follow-ups", {
        params: {
          type,
        },
      });

      setFollowUps(response.data?.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to load follow-ups."
      );
    } finally {
      setFollowUpsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [queryParams]);

  useEffect(() => {
    fetchSalesUsers();
    fetchServices();
  }, []);

  useEffect(() => {
    fetchFollowUps(followUpType);
  }, [followUpType]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setSourceFilter("");
    setAssignedFilter("");
    setPage(1);
  };

  const openCreateModal = () => {
    setEditingLead(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
    setFormOpen(true);
  };

  const openEditModal = (lead) => {
    setEditingLead(lead);
    setFormError("");

    setForm({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      source: lead.source || "",
      serviceInterest:
        typeof lead.serviceInterest === "object"
          ? lead.serviceInterest?._id || ""
          : lead.serviceInterest || "",
      priority: lead.priority || "medium",
      notes: lead.notes || "",
      followUpDate: toDateTimeLocal(lead.followUpDate),
    });

    setFormOpen(true);
  };

  const closeFormModal = () => {
    if (saving) return;

    setFormOpen(false);
    setEditingLead(null);
    setForm({ ...EMPTY_FORM });
    setFormError("");
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const buildLeadPayload = () => {
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      source: form.source,
      priority: form.priority,
      notes: form.notes.trim(),
    };

    if (form.serviceInterest) {
      payload.serviceInterest = form.serviceInterest;
    }

    if (form.followUpDate) {
      payload.followUpDate = new Date(
        form.followUpDate
      ).toISOString();
    }

    return payload;
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Lead name is required.";
    }

    if (!form.source) {
      return "Please select a lead source.";
    }

    if (!SOURCES.includes(form.source)) {
      return "Please select a valid lead source.";
    }

    if (!form.priority) {
      return "Please select a priority.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      const payload = buildLeadPayload();

      if (editingLead) {
        await api.put(`/leads/${editingLead._id}`, payload);
      } else {
        await api.post("/leads", payload);
      }

      closeFormModal();
      await fetchLeads();
    } catch (err) {
      setFormError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to save lead."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lead) => {
    const confirmed = window.confirm(
      `Delete lead "${lead.name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(lead._id);
      setError("");

      await api.delete(`/leads/${lead._id}`);

      if (selectedLead?._id === lead._id) {
        setSelectedLead(null);
      }

      await fetchLeads();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to delete lead."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (leadId, status) => {
    try {
      setUpdatingStatusId(leadId);
      setError("");

      await api.patch(`/leads/${leadId}/status`, {
        status,
      });

      await fetchLeads();

      if (selectedLead?._id === leadId) {
        const response = await api.get(`/leads/${leadId}`);
        setSelectedLead(response.data?.data || null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to update lead status."
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleAssignmentChange = async (leadId, assignedTo) => {
    try {
      setAssigningId(leadId);
      setError("");

      await api.patch(`/leads/${leadId}/assign`, {
        assignedTo: String(assignedTo),
      });

      await fetchLeads();

      if (selectedLead?._id === leadId) {
        const response = await api.get(`/leads/${leadId}`);
        setSelectedLead(response.data?.data || null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to update lead assignment."
      );
    } finally {
      setAssigningId(null);
    }
  };

  const openDetails = async (lead) => {
    try {
      setSelectedLead(lead);

      const response = await api.get(`/leads/${lead._id}`);

      setSelectedLead(response.data?.data || lead);
    } catch (err) {
      setSelectedLead(lead);
    }
  };

  const handleDragStart = (leadId) => {
    setDraggedLeadId(leadId);
  };

  const handleDrop = async (status) => {
    if (!draggedLeadId) return;

    const lead = leads.find(
      (item) => item._id === draggedLeadId
    );

    setDraggedLeadId(null);

    if (!lead || lead.status === status) {
      return;
    }

    await handleStatusChange(draggedLeadId, status);
  };

  const clearFollowUps = () => {
    setFollowUpType("");
  };

  const renderLeadStatusSelect = (lead) => (
    <select
      value={lead.status || "new"}
      onChange={(event) =>
        handleStatusChange(lead._id, event.target.value)
      }
      disabled={updatingStatusId === lead._id}
      aria-label={`Change status for ${lead.name}`}
      className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {LEAD_STATUSES.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );

  const renderAssignmentSelect = (lead) => (
    <div className="relative">
      <select
        value={
          typeof lead.assignedTo === "object"
            ? lead.assignedTo?._id || ""
            : lead.assignedTo || ""
        }
        onChange={(event) =>
          handleAssignmentChange(
            lead._id,
            event.target.value
          )
        }
        disabled={
          assigningId === lead._id || loadingUsers
        }
        aria-label={`Assign ${lead.name}`}
        className="h-9 min-w-32 max-w-44 appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-xs text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <option value="">Unassigned</option>

        {salesUsers.map((user) => (
          <option
            key={user._id}
            value={String(user._id)}
          >
            {user.name}
          </option>
        ))}
      </select>

      {assigningId === lead._id && (
        <Loader2
          className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 animate-spin text-slate-400"
          aria-hidden="true"
        />
      )}
    </div>
  );

  const renderDesktopTable = () => (
    <div className="hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left">
          <thead className="border-b border-slate-200 bg-slate-50/80">
            <tr>
              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Lead
              </th>

              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Source
              </th>

              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Priority
              </th>

              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Assigned to
              </th>

              <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Follow-up
              </th>

              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr
                key={lead._id}
                className="transition-colors hover:bg-slate-50/70"
              >
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => openDetails(lead)}
                    className="group text-left"
                  >
                    <p className="font-semibold text-slate-900 transition group-hover:text-slate-600">
                      {lead.name}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {lead.email ||
                        lead.phone ||
                        "No contact information"}
                    </p>
                  </button>
                </td>

                <td className="px-5 py-4">
                  <span className="text-sm text-slate-600">
                    {SOURCE_LABELS[lead.source] ||
                      formatLabel(lead.source)}
                  </span>
                </td>

                <td className="px-5 py-4">
                  {renderLeadStatusSelect(lead)}
                </td>

                <td className="px-5 py-4">
                  <PriorityBadge priority={lead.priority} />
                </td>

                <td className="px-5 py-4">
                  {renderAssignmentSelect(lead)}
                </td>

                <td className="px-5 py-4">
                  <span className="text-sm text-slate-600">
                    {formatDate(lead.followUpDate)}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => openDetails(lead)}
                      aria-label={`View ${lead.name}`}
                      title="View lead"
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                      <Eye
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(lead)}
                      aria-label={`Edit ${lead.name}`}
                      title="Edit lead"
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-200"
                    >
                      <Pencil
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(lead)}
                      disabled={deletingId === lead._id}
                      aria-label={`Delete ${lead.name}`}
                      title="Delete lead"
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingId === lead._id ? (
                        <Loader2
                          className="h-4 w-4 animate-spin"
                          aria-hidden="true"
                        />
                      ) : (
                        <Trash2
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMobileCards = () => (
    <div className="space-y-3 lg:hidden">
      {leads.map((lead) => (
        <article
          key={lead._id}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <button
              type="button"
              onClick={() => openDetails(lead)}
              className="min-w-0 text-left"
            >
              <h3 className="truncate font-semibold text-slate-900">
                {lead.name}
              </h3>

              <p className="mt-1 truncate text-xs text-slate-500">
                {lead.email ||
                  lead.phone ||
                  "No contact information"}
              </p>
            </button>

            <PriorityBadge priority={lead.priority} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <LeadBadge status={lead.status} />

            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
              {SOURCE_LABELS[lead.source] ||
                formatLabel(lead.source)}
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Status
              </p>

              {renderLeadStatusSelect(lead)}
            </div>

            <div>
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Assigned
              </p>

              {renderAssignmentSelect(lead)}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <CalendarDays
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />

              {formatDate(lead.followUpDate)}
            </div>

            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => openDetails(lead)}
                aria-label={`View ${lead.name}`}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <Eye
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                onClick={() => openEditModal(lead)}
                aria-label={`Edit ${lead.name}`}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <Pencil
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                onClick={() => handleDelete(lead)}
                disabled={deletingId === lead._id}
                aria-label={`Delete ${lead.name}`}
                className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
              >
                {deletingId === lead._id ? (
                  <Loader2
                    className="h-4 w-4 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Trash2
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );

  const renderKanban = () => (
    <div className="grid gap-4 overflow-x-auto pb-2 xl:grid-cols-6">
      {LEAD_STATUSES.map((status) => {
        const columnLeads = leads.filter(
          (lead) => lead.status === status
        );

        return (
          <div
            key={status}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(status)}
            className="min-h-[420px] min-w-[260px] rounded-2xl border border-slate-200 bg-slate-50/70 p-3"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-slate-400" />

                <h3 className="text-sm font-semibold text-slate-800">
                  {STATUS_LABELS[status]}
                </h3>
              </div>

              <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
                {columnLeads.length}
              </span>
            </div>

            <div className="space-y-3">
              {columnLeads.map((lead) => (
                <article
                  key={lead._id}
                  draggable
                  onDragStart={() =>
                    handleDragStart(lead._id)
                  }
                  className={`cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:cursor-grabbing ${
                    draggedLeadId === lead._id
                      ? "opacity-50"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => openDetails(lead)}
                      className="min-w-0 text-left"
                    >
                      <h4 className="truncate text-sm font-semibold text-slate-900">
                        {lead.name}
                      </h4>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {lead.email ||
                          lead.phone ||
                          "No contact"}
                      </p>
                    </button>

                    <GripVertical
                      className="h-4 w-4 shrink-0 text-slate-300"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <PriorityBadge
                      priority={lead.priority}
                    />

                    <span className="text-[11px] text-slate-400">
                      {formatDate(lead.followUpDate)}
                    </span>
                  </div>

                  {lead.assignedTo?.name && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
                      <UserRound
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />

                      <span className="truncate">
                        {lead.assignedTo.name}
                      </span>
                    </div>
                  )}
                </article>
              ))}

              {columnLeads.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white/50 px-3 py-8 text-center text-xs text-slate-400">
                  Drop leads here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderPagination = () => {
    if (pagination.totalPages <= 1) {
      return null;
    }

    return (
      <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Showing{" "}
          <span className="font-medium text-slate-700">
            {leads.length}
          </span>{" "}
          of{" "}
          <span className="font-medium text-slate-700">
            {pagination.total}
          </span>{" "}
          leads
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setPage((current) =>
                Math.max(1, current - 1)
              )
            }
            disabled={page <= 1 || loading}
            aria-label="Previous page"
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>

          <span className="min-w-16 text-center text-xs font-medium text-slate-600">
            {pagination.page} / {pagination.totalPages}
          </span>

          <button
            type="button"
            onClick={() =>
              setPage((current) =>
                Math.min(
                  pagination.totalPages,
                  current + 1
                )
              )
            }
            disabled={
              page >= pagination.totalPages || loading
            }
            aria-label="Next page"
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <CRMPageHeader
          title="Leads"
          description="Manage prospects, assignments, follow-ups, and sales pipeline."
        />

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          <Plus
            className="h-4 w-4"
            aria-hidden="true"
          />
          Add lead
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0"
            aria-hidden="true"
          />

          <p className="flex-1">{error}</p>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
            className="rounded-md p-1 hover:bg-rose-100"
          >
            <X
              className="h-4 w-4"
              aria-hidden="true"
            />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search leads by name, email, or phone..."
              aria-label="Search leads"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:flex">
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by status"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="">All statuses</option>

              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={(event) => {
                setPriorityFilter(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by priority"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="">All priorities</option>

              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {PRIORITY_LABELS[priority]}
                </option>
              ))}
            </select>

            <select
              value={sourceFilter}
              onChange={(event) => {
                setSourceFilter(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by source"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="">All sources</option>

              {SOURCES.map((source) => (
                <option key={source} value={source}>
                  {SOURCE_LABELS[source]}
                </option>
              ))}
            </select>

            <select
              value={assignedFilter}
              onChange={(event) => {
                setAssignedFilter(event.target.value);
                setPage(1);
              }}
              aria-label="Filter by assigned user"
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="">All owners</option>

              {salesUsers.map((user) => (
                <option
                  key={user._id}
                  value={String(user._id)}
                >
                  {user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetFilters}
              title="Reset filters"
              aria-label="Reset filters"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Filter
                className="h-4 w-4"
                aria-hidden="true"
              />
              Reset
            </button>

            <button
              type="button"
              onClick={fetchLeads}
              disabled={loading}
              title="Refresh leads"
              aria-label="Refresh leads"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loading ? "animate-spin" : ""
                }`}
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {/* View + follow-up controls */}
        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">
              View
            </span>

            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "list"
                  ? "bg-slate-950 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
              aria-pressed={viewMode === "list"}
            >
              List
            </button>

            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "kanban"
                  ? "bg-slate-950 text-white"
                  : "text-slate-500 hover:bg-slate-100"
              }`}
              aria-pressed={viewMode === "kanban"}
            >
              Kanban
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={followUpType}
              onChange={(event) =>
                setFollowUpType(event.target.value)
              }
              aria-label="Follow-up filter"
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="">Follow-ups</option>
              <option value="upcoming">Upcoming</option>
              <option value="overdue">Overdue</option>
              <option value="all">All active</option>
            </select>

            {followUpType && (
              <button
                type="button"
                onClick={clearFollowUps}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Clear follow-up filter"
                title="Clear follow-up filter"
              >
                <X
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Follow-up panel */}
      {followUpType && (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {followUpType === "overdue"
                  ? "Overdue follow-ups"
                  : followUpType === "upcoming"
                  ? "Upcoming follow-ups"
                  : "Active follow-ups"}
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                {followUps.length} lead
                {followUps.length === 1 ? "" : "s"}
              </p>
            </div>

            <CalendarDays
              className="h-4 w-4 text-slate-400"
              aria-hidden="true"
            />
          </div>

          {followUpsLoading ? (
            <div className="flex items-center justify-center px-4 py-8">
              <Loader2
                className="h-5 w-5 animate-spin text-slate-400"
                aria-hidden="true"
              />
            </div>
          ) : followUps.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-500">
              No matching follow-ups.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {followUps.slice(0, 5).map((lead) => (
                <button
                  key={lead._id}
                  type="button"
                  onClick={() => openDetails(lead)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {lead.name}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-500">
                      {lead.assignedTo?.name ||
                        "Unassigned"}
                    </p>
                  </div>

                  <span className="shrink-0 text-xs font-medium text-slate-500">
                    {formatDateTime(lead.followUpDate)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Main leads */}
      {loading ? (
        <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div
            className="flex items-center gap-3 text-sm text-slate-500"
            role="status"
            aria-live="polite"
          >
            <Loader2
              className="h-5 w-5 animate-spin"
              aria-hidden="true"
            />
            Loading leads...
          </div>
        </div>
      ) : leads.length === 0 ? (
        <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
            <Users
              className="h-6 w-6 text-slate-500"
              aria-hidden="true"
            />
          </div>

          <h2 className="mt-4 text-base font-semibold text-slate-900">
            No leads found
          </h2>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            Try changing your filters or create a new lead.
          </p>

          <button
            type="button"
            onClick={openCreateModal}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus
              className="h-4 w-4"
              aria-hidden="true"
            />
            Add lead
          </button>
        </div>
      ) : viewMode === "kanban" ? (
        renderKanban()
      ) : (
        <>
          {renderDesktopTable()}
          {renderMobileCards()}

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            {renderPagination()}
          </div>
        </>
      )}

      {/* Create/Edit modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lead-form-title"
        >
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2
                  id="lead-form-title"
                  className="text-base font-semibold text-slate-900"
                >
                  {editingLead ? "Edit lead" : "Add lead"}
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                  {editingLead
                    ? "Update lead information and follow-up details."
                    : "Create a new prospect for the sales pipeline."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeFormModal}
                disabled={saving}
                aria-label="Close lead form"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="overflow-y-auto"
            >
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                {formError && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 sm:col-span-2"
                  >
                    <AlertCircle
                      className="mt-0.5 h-4 w-4 shrink-0"
                      aria-hidden="true"
                    />

                    <span>{formError}</span>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="lead-name"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Name *
                  </label>

                  <input
                    id="lead-name"
                    name="name"
                    value={form.name}
                    onChange={handleFormChange}
                    placeholder="Enter lead name"
                    required
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lead-source"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Source *
                  </label>

                  <select
                    id="lead-source"
                    name="source"
                    value={form.source}
                    onChange={handleFormChange}
                    required
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  >
                    <option value="" disabled>
                      Select source
                    </option>

                    {SOURCES.map((source) => (
                      <option
                        key={source}
                        value={source}
                      >
                        {SOURCE_LABELS[source]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="lead-email"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Email
                  </label>

                  <input
                    id="lead-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleFormChange}
                    placeholder="lead@example.com"
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lead-phone"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Phone
                  </label>

                  <input
                    id="lead-phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleFormChange}
                    placeholder="+91..."
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lead-priority"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Priority
                  </label>

                  <select
                    id="lead-priority"
                    name="priority"
                    value={form.priority}
                    onChange={handleFormChange}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  >
                    {PRIORITIES.map((priority) => (
                      <option
                        key={priority}
                        value={priority}
                      >
                        {PRIORITY_LABELS[priority]}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="lead-service"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Service interest
                  </label>

                  <select
                    id="lead-service"
                    name="serviceInterest"
                    value={form.serviceInterest}
                    onChange={handleFormChange}
                    disabled={loadingServices}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-50"
                  >
                    <option value="">
                      No specific service
                    </option>

                    {services.map((service) => (
                      <option
                        key={service._id}
                        value={String(service._id)}
                      >
                        {service.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="lead-follow-up"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Follow-up date
                  </label>

                  <input
                    id="lead-follow-up"
                    name="followUpDate"
                    type="datetime-local"
                    value={form.followUpDate}
                    onChange={handleFormChange}
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="lead-notes"
                    className="mb-1.5 block text-xs font-semibold text-slate-700"
                  >
                    Notes
                  </label>

                  <textarea
                    id="lead-notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleFormChange}
                    rows={4}
                    placeholder="Add useful context about this lead..."
                    className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50/70 px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeFormModal}
                  disabled={saving}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  )}

                  {editingLead
                    ? "Save changes"
                    : "Create lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead details modal */}
      {selectedLead && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lead-details-title"
        >
          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
              <div className="min-w-0">
                <h2
                  id="lead-details-title"
                  className="truncate text-lg font-semibold text-slate-900"
                >
                  {selectedLead.name}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Created{" "}
                  {formatDateTime(
                    selectedLead.createdAt
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                aria-label="Close lead details"
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-5">
              <div className="flex flex-wrap gap-2">
                <LeadBadge status={selectedLead.status} />

                <PriorityBadge
                  priority={selectedLead.priority}
                />

                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {SOURCE_LABELS[selectedLead.source] ||
                    formatLabel(selectedLead.source)}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Contact
                  </p>

                  <div className="mt-2 space-y-1 text-sm text-slate-700">
                    <p>
                      {selectedLead.email ||
                        "No email"}
                    </p>

                    <p>
                      {selectedLead.phone ||
                        "No phone"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Service interest
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {selectedLead.serviceInterest
                      ?.title ||
                      "No specific service"}
                  </p>

                  {selectedLead.serviceInterest
                    ?.price != null && (
                    <p className="mt-1 text-xs text-slate-500">
                      ₹
                      {Number(
                        selectedLead.serviceInterest
                          .price
                      ).toLocaleString("en-IN")}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Assigned to
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {selectedLead.assignedTo?.name ||
                      "Unassigned"}
                  </p>

                  {selectedLead.assignedTo
                    ?.email && (
                    <p className="mt-1 text-xs text-slate-500">
                      {
                        selectedLead.assignedTo
                          .email
                      }
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Follow-up
                  </p>

                  <p className="mt-2 text-sm font-medium text-slate-800">
                    {formatDateTime(
                      selectedLead.followUpDate
                    )}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Notes
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                  {selectedLead.notes ||
                    "No notes added."}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    openEditModal(selectedLead);
                    setSelectedLead(null);
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Pencil
                    className="h-4 w-4"
                    aria-hidden="true"
                  />
                  Edit lead
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="h-10 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leads;