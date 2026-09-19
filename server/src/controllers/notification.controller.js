const notificationService = require("../services/notification.service");

const getNotifications = async (req, res, next) => {
  try {
    const result = await notificationService.getNotifications(
      req.user,
      req.query
    );

    res.status(200).json({
      success: true,
      data: result.notifications,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getNotificationById = async (req, res, next) => {
  try {
    const notification =
      await notificationService.getNotificationById(
        req.user,
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(
      req.user,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const result = await notificationService.markAllAsRead(req.user);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    const result = await notificationService.deleteNotification(
      req.user,
      req.params.id
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};