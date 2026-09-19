const mongoose = require("mongoose");

const Notification = require("../models/notification");
const ApiError = require("../utils/ApiError");
const getPagination = require("../utils/pagination");

// Get notifications for current user
const getNotifications = async (user, query) => {
  const { isRead, type } = query;

  const { page, limit, skip } = getPagination(query);

  const filter = {
    user: user.userId,
  };

  if (isRead !== undefined) {
    filter.isRead = isRead === "true";
  }

  if (type) {
    filter.type = type;
  }

  const [notifications, total] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Notification.countDocuments(filter),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get one notification
const getNotificationById = async (user, notificationId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "Invalid notification ID");
  }

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.user.toString() !== user.userId) {
    throw new ApiError(403, "Access denied");
  }

  return notification;
};

// Mark notification as read
const markAsRead = async (user, notificationId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "Invalid notification ID");
  }

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.user.toString() !== user.userId) {
    throw new ApiError(403, "Access denied");
  }

  notification.isRead = true;

  await notification.save();

  return notification;
};

// Mark all notifications as read
const markAllAsRead = async (user) => {
  const result = await Notification.updateMany(
    {
      user: user.userId,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
      },
    }
  );

  return {
    modifiedCount: result.modifiedCount,
  };
};

// Delete notification
const deleteNotification = async (user, notificationId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "Invalid notification ID");
  }

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.user.toString() !== user.userId) {
    throw new ApiError(403, "Access denied");
  }

  await notification.deleteOne();

  return {
    message: "Notification deleted successfully",
  };
};

module.exports = {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
