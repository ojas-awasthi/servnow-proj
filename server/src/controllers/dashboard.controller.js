const dashboardService = require("../services/dashboard.service");

const getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getDashboardSummary();

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

const getBookingAnalytics = async (req, res, next) => {
  try {
    const analytics = await dashboardService.getBookingAnalytics();

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

const getRevenueAnalytics = async (req, res, next) => {
  try {
    const analytics = await dashboardService.getRevenueAnalytics();

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

const getLeadAnalytics = async (req, res, next) => {
  try {
    const analytics = await dashboardService.getLeadAnalytics();

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};


const getTicketAnalytics = async (req, res, next) => {
  try {
    const analytics = await dashboardService.getTicketAnalytics();

    res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  getDashboardSummary,
  getBookingAnalytics,
  getRevenueAnalytics,
  getLeadAnalytics,
  getTicketAnalytics,
};