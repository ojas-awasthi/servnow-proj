require("dotenv").config();

const bcrypt = require("bcrypt");

const connectDB = require("../config/db");
const User = require("../models/user");

const createSupportUser = async () => {
  try {
    await connectDB();

    const email = "support@servnow.test";

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("Support user already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Test123456", 12);

    const supportUser = await User.create({
      name: "ServNOW Support",
      email,
      password: hashedPassword,
      role: "support",
      phone: "",
      status: "active",
    });

    console.log("Support user created successfully:");
    console.log({
      id: supportUser._id.toString(),
      name: supportUser.name,
      email: supportUser.email,
      role: supportUser.role,
    });

    process.exit(0);
  } catch (error) {
    console.error("Failed to create support user:", error.message);
    process.exit(1);
  }
};

createSupportUser();
