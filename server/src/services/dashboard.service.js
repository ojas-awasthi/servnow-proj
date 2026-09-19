const User = require("../models/user");
const Service = require("../models/service");
const Category = require("../models/category");
const Booking = require("../models/booking");
const Transaction = require("../models/transaction");
const Lead = require("../models/lead");
const SupportTicket = require("../models/supportTicket");

const getDashboardSummary = async () => {
  const [
    totalUsers,
    totalCustomers,
    totalProviders,
    totalServices,
    totalCategories,
    totalBookings,
    pendingBookings,
    confirmedBookings,
    inProgressBookings,
    completedBookings,
    cancelledBookings,
    totalLeads,
    activeLeads,
    openTickets,
    successfulTransactions,
  ] = await Promise.all([
    User.countDocuments(),

    User.countDocuments({
      role: "customer",
    }),

    User.countDocuments({
      role: "provider",
    }),

    Service.countDocuments(),

    Category.countDocuments(),

    Booking.countDocuments(),

    Booking.countDocuments({
      status: "pending",
    }),

    Booking.countDocuments({
      status: "confirmed",
    }),

    Booking.countDocuments({
      status: "in_progress",
    }),

    Booking.countDocuments({
      status: "completed",
    }),

    Booking.countDocuments({
      status: "cancelled",
    }),

    Lead.countDocuments(),

    Lead.countDocuments({
      status: {
        $nin: ["converted", "lost"],
      },
    }),

    SupportTicket.countDocuments({
      status: {
        $in: ["open", "assigned", "in_progress"],
      },
    }),

    Transaction.countDocuments({
      status: "success",
    }),
  ]);

  const revenueResult = await Transaction.aggregate([
    {
      $match: {
        status: "success",
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: "$amount",
        },
      },
    },
  ]);

  const totalRevenue =
    revenueResult.length > 0
      ? revenueResult[0].totalRevenue
      : 0;

  return {
    users: {
      total: totalUsers,
      customers: totalCustomers,
      providers: totalProviders,
    },

    catalog: {
      services: totalServices,
      categories: totalCategories,
    },

    bookings: {
      total: totalBookings,
      pending: pendingBookings,
      confirmed: confirmedBookings,
      inProgress: inProgressBookings,
      completed: completedBookings,
      cancelled: cancelledBookings,
    },

    leads: {
      total: totalLeads,
      active: activeLeads,
    },

    support: {
      open: openTickets,
    },

    transactions: {
      successful: successfulTransactions,
      totalRevenue,
    },
  };
};

const getBookingAnalytics = async () => {
  const bookingStatusData = await Booking.aggregate([
    {
      $group: {
        _id: "$status",
        count: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
  ]);

  return bookingStatusData.map((item) => ({
    status: item._id,
    count: item.count,
  }));
};


const getRevenueAnalytics = async () => {
  const revenueData = await Transaction.aggregate([
    {
      $match: {
        status: "success",
      },
    },
    {
      $group: {
        _id: {
          year: {
            $year: "$paidAt",
          },
          month: {
            $month: "$paidAt",
          },
        },
        revenue: {
          $sum: "$amount",
        },
        transactions: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);

  return revenueData.map((item) => ({
    year: item._id.year,
    month: item._id.month,
    revenue: item.revenue,
    transactions: item.transactions,
  }));
};


const getLeadAnalytics = async () => {
  const leadStatusData = await Lead.aggregate([
    {
      $group: {
        _id: "$status",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  const statusOrder = [
    "new",
    "contacted",
    "qualified",
    "proposal",
    "converted",
    "lost",
  ];

  const counts = new Map(
    leadStatusData.map((item) => [
      item._id,
      item.count,
    ])
  );

  return statusOrder.map((status) => ({
    status,
    count: counts.get(status) || 0,
  }));
};

const getTicketAnalytics = async () => {
  const ticketStatusData = await SupportTicket.aggregate([
    {
      $group: {
        _id: "$status",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  const statusOrder = [
    "open",
    "assigned",
    "in_progress",
    "resolved",
    "closed",
  ];

  const counts = new Map(
    ticketStatusData.map((item) => [
      item._id,
      item.count,
    ])
  );

  return statusOrder.map((status) => ({
    status,
    count: counts.get(status) || 0,
  }));
};

module.exports = {
  getDashboardSummary,
  getBookingAnalytics,
  getRevenueAnalytics,
  getLeadAnalytics,
  getTicketAnalytics,
};
