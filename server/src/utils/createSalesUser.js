require("dotenv").config();

const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const connectDB = require("../config/db");
const User = require("../models/user");

const createSalesUser = async () => {
  try {
    await connectDB();

    const email = "sales@servnow.test";

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("Sales user already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("Test123456", 12);

    const salesUser = await User.create({
      name: "ServNOW Sales",
      email,
      password: hashedPassword,
      role: "sales",
      phone: "",
      status: "active",
    });

    console.log("Sales user created successfully:");
    console.log({
      id: salesUser._id.toString(),
      name: salesUser.name,
      email: salesUser.email,
      role: salesUser.role,
    });

    process.exit(0);
  } catch (error) {
    console.error("Failed to create sales user:", error.message);
    process.exit(1);
  }
};

createSalesUser();
