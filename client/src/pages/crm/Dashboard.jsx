import {
  Activity,
  CalendarDays,
  IndianRupee,
  RefreshCw,
  Users,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import CRMPageHeader from "../../components/crm/CRMPageHeader";
import api from "../../services/api";

function Dashboard() {
  const [analytics, setAnalytics] = useState({
    summary: null,
    bookings: [],
    revenue: [],
    leads: [],
    tickets: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [
        summaryResponse,
        bookingsResponse,
        revenueResponse,
        leadsResponse,
        ticketsResponse,
      ] = await Promise.all([
        api.get("/dashboard/summary"),
        api.get("/dashboard/bookings"),
        api.get("/dashboard/revenue"),
        api.get("/dashboard/leads"),
        api.get("/dashboard/tickets"),
      ]);

      setAnalytics({
        summary: summaryResponse.data.data,
        bookings: bookingsResponse.data.data || [],
        revenue: revenueResponse.data.data || [],
        leads: leadsResponse.data.data || [],
        tickets: ticketsResponse.data.data || [],
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to load CRM dashboard analytics."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const revenueChartData = useMemo(() => {
    return analytics.revenue.map((item) => ({
      name: `${item.year}-${String(item.month).padStart(2, "0")}`,
      revenue: item.revenue,
      transactions: item.transactions,
    }));
  }, [analytics.revenue]);

  const bookingChartData = useMemo(() => {
    return analytics.bookings
      .filter((item) => item.count > 0)
      .map((item) => ({
        name: formatBookingStatus(item.status),
        value: item.count,
      }));
  }, [analytics.bookings]);

  const leadChartData = useMemo(() => {
    return analytics.leads.map((item) => ({
      name: formatLeadStatus(item.status),
      count: item.count,
    }));
  }, [analytics.leads]);

  const ticketChartData = useMemo(() => {
    return analytics.tickets.map((item) => ({
      name: formatTicketStatus(item.status),
      count: item.count,
    }));
  }, [analytics.tickets]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
        <CRMPageHeader
          title="Dashboard"
          description="Monitor ServNOW marketplace activity, revenue, leads, and support operations."
        />

        <div
          className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          role="status"
          aria-live="polite"
        >
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          ))}
        </div>

        <p className="sr-only">
          Loading CRM dashboard analytics.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
        <CRMPageHeader
          title="Dashboard"
          description="Monitor ServNOW marketplace activity, revenue, leads, and support operations."
        />

        <div
          className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5"
          role="alert"
        >
          <p className="text-sm font-semibold text-red-900">
            Unable to load dashboard
          </p>

          <p className="mt-1 text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={loadDashboard}
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-800 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2"
          >
            <RefreshCw
              className="h-4 w-4"
              aria-hidden="true"
            />
            Try again
          </button>
        </div>
      </div>
    );
  }

  const summary = analytics.summary;

  const stats = [
    {
      label: "Customers",
      value: summary?.users?.customers ?? "—",
      icon: Users,
    },
    {
      label: "Providers",
      value: summary?.users?.providers ?? "—",
      icon: Activity,
    },
    {
      label: "Bookings",
      value: summary?.bookings?.total ?? "—",
      icon: CalendarDays,
    },
    {
      label: "Revenue",
      value:
        summary?.transactions?.totalRevenue !== undefined
          ? `₹${Number(
              summary.transactions.totalRevenue
            ).toLocaleString("en-IN")}`
          : "—",
      icon: IndianRupee,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
      <CRMPageHeader
        title="Dashboard"
        description="Monitor ServNOW marketplace activity, revenue, leads, and support operations."
        actions={
          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
              aria-hidden="true"
            />

            <span>
              {loading ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        }
      />

      {/* KPI CARDS */}
      <section
        className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="CRM overview"
      >
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>

                  <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                    {stat.value}
                  </p>
                </div>

                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700"
                  aria-hidden="true"
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* SECONDARY SUMMARY */}
      <section
        className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Additional CRM metrics"
      >
        <MetricCard
          label="Services"
          value={summary?.catalog?.services ?? "—"}
        />

        <MetricCard
          label="Categories"
          value={summary?.catalog?.categories ?? "—"}
        />

        <MetricCard
          label="Active leads"
          value={summary?.leads?.active ?? "—"}
        />

        <MetricCard
          label="Open tickets"
          value={summary?.support?.open ?? "—"}
        />
      </section>

      {/* REVENUE + BOOKINGS */}
      <section
        className="mt-6 grid gap-6 xl:grid-cols-2"
        aria-label="Marketplace analytics"
      >
        <AnalyticsCard
          title="Revenue overview"
          description="Revenue performance over time."
        >
          {revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueChartData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) =>
                    `₹${Number(value).toLocaleString("en-IN")}`
                  }
                />

                <Tooltip
                  formatter={(value, name) => [
                    name === "revenue"
                      ? `₹${Number(value).toLocaleString(
                          "en-IN"
                        )}`
                      : value,
                    name === "revenue"
                      ? "Revenue"
                      : "Transactions",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#0f172a"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartState message="No revenue data available." />
          )}
        </AnalyticsCard>

        <AnalyticsCard
          title="Booking overview"
          description="Booking activity and status distribution."
        >
          {bookingChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookingChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {bookingChartData.map((entry, index) => (
                    <Cell
                      key={`${entry.name}-${index}`}
                    />
                  ))}
                </Pie>

                <Tooltip />

                <Legend
                  verticalAlign="bottom"
                  height={36}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartState message="No booking data available." />
          )}
        </AnalyticsCard>
      </section>

      {/* LEADS + TICKETS */}
      <section
        className="mt-6 grid gap-6 xl:grid-cols-2"
        aria-label="CRM pipeline analytics"
      >
        <AnalyticsCard
          title="Lead pipeline"
          description="Track leads through each CRM stage."
        >
          {leadChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={leadChartData}
                layout="vertical"
                margin={{
                  top: 5,
                  right: 20,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                />

                <XAxis
                  type="number"
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  width={85}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  name="Leads"
                  fill="#0f172a"
                  radius={[0, 5, 5, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartState message="No lead data available." />
          )}
        </AnalyticsCard>

        <AnalyticsCard
          title="Support tickets"
          description="Monitor customer support workload by status."
        >
          {ticketChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={ticketChartData}
                margin={{
                  top: 5,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11 }}
                  interval={0}
                />

                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip />

                <Bar
                  dataKey="count"
                  name="Tickets"
                  fill="#334155"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartState message="No ticket data available." />
          )}
        </AnalyticsCard>
      </section>

      {/* BOOKING STATUS SUMMARY */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Booking status
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current distribution of marketplace bookings.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatusMetric
            label="Pending"
            value={summary?.bookings?.pending ?? 0}
          />

          <StatusMetric
            label="Confirmed"
            value={summary?.bookings?.confirmed ?? 0}
          />

          <StatusMetric
            label="In progress"
            value={summary?.bookings?.inProgress ?? 0}
          />

          <StatusMetric
            label="Completed"
            value={summary?.bookings?.completed ?? 0}
          />

          <StatusMetric
            label="Cancelled"
            value={summary?.bookings?.cancelled ?? 0}
          />
        </div>
      </section>

      {/* TRANSACTION SUMMARY */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Transaction summary
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Current payment performance across the marketplace.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Successful transactions
            </p>

            <p className="mt-1 text-xl font-semibold text-slate-950">
              {summary?.transactions?.successful ?? 0}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Total revenue
            </p>

            <p className="mt-1 text-xl font-semibold text-slate-950">
              ₹
              {Number(
                summary?.transactions?.totalRevenue ?? 0
              ).toLocaleString("en-IN")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-xl font-semibold text-slate-950">
        {value}
      </p>
    </article>
  );
}

function StatusMetric({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function AnalyticsCard({
  title,
  description,
  children,
}) {
  return (
    <article className="min-h-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-slate-950">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <div
        className="mt-5 h-56 sm:h-64"
        role="img"
        aria-label={`${title} chart`}
      >
        {children}
      </div>
    </article>
  );
}

function EmptyChartState({ message }) {
  return (
    <div
      className="flex h-full items-center justify-center rounded-xl bg-slate-50"
      role="status"
    >
      <p className="text-sm text-slate-400">
        {message}
      </p>
    </div>
  );
}

function formatBookingStatus(status) {
  const labels = {
    pending: "Pending",
    confirmed: "Confirmed",
    in_progress: "In progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };

  return labels[status] || status;
}

function formatLeadStatus(status) {
  const labels = {
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    proposal: "Proposal",
    converted: "Converted",
    lost: "Lost",
  };

  return labels[status] || status;
}

function formatTicketStatus(status) {
  const labels = {
    open: "Open",
    assigned: "Assigned",
    in_progress: "In progress",
    resolved: "Resolved",
    closed: "Closed",
  };

  return labels[status] || status;
}

export default Dashboard;