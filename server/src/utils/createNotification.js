const Notification = require("../models/notification");

const createNotification = async ({
  user,
  title,
  message,
  type,
  relatedId = null,
}) => {
  return Notification.create({
    user,
    title,
    message,
    type,
    relatedId,
  });
};

module.exports = createNotification;
