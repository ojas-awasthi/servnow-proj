const express = require("express");

const notificationController = require("../controllers/notification.controller");

const protect = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const {
  notificationIdSchema,
  getNotificationsSchema,
} = require("../validators/notification.validator");

const router = express.Router();

// Get current user's notifications
router.get(
  "/",
  protect,
  validate(getNotificationsSchema),
  notificationController.getNotifications
);

// Mark all as read
router.patch(
  "/read-all",
  protect,
  notificationController.markAllAsRead
);

// Get one notification
router.get(
  "/:id",
  protect,
  validate(notificationIdSchema),
  notificationController.getNotificationById
);

// Mark one as read
router.patch(
  "/:id/read",
  protect,
  validate(notificationIdSchema),
  notificationController.markAsRead
);

// Delete notification
router.delete(
  "/:id",
  protect,
  validate(notificationIdSchema),
  notificationController.deleteNotification
);

module.exports = router;