require("dotenv").config();

const connectDB = require("../config/db");
const Notification = require("../models/notification");
const User = require("../models/User");

const createTestNotification = async () => {
  try {
    await connectDB();

    const customer = await User.findOne({
      email: "customer@servnow.test",
    });

    if (!customer) {
      console.error("Customer user not found.");
      process.exit(1);
    }

    const notification = await Notification.create({
      user: customer._id,
      title: "Test Notification",
      message: "This is a test notification from ServNOW.",
      type: "system",
      isRead: false,
    });

    console.log("Test notification created successfully:");
    console.log({
      id: notification._id.toString(),
      user: customer.email,
      title: notification.title,
      type: notification.type,
      isRead: notification.isRead,
    });

    process.exit(0);
  } catch (error) {
    console.error(
      "Failed to create test notification:",
      error.message
    );

    process.exit(1);
  }
};

createTestNotification();
