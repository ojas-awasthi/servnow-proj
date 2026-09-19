const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");

const router = express.Router();

router.get(
  "/summary",
  protect,
  authorize("admin"),
  dashboardController.getDashboardSummary
);

router.get(
  "/bookings",
  protect,
  authorize("admin"),
  dashboardController.getBookingAnalytics
);

router.get(
  "/revenue",
  protect,
  authorize("admin"),
  dashboardController.getRevenueAnalytics
);

router.get(
  "/leads",
  protect,
  authorize("admin"),
  dashboardController.getLeadAnalytics
);

router.get(
  "/tickets",
  protect,
  authorize("admin"),
  dashboardController.getTicketAnalytics
);

module.exports = router;