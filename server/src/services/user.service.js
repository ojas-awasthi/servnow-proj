const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const User = require("../models/user");
const ApiError = require("../utils/ApiError");
const getPagination = require("../utils/pagination");

const roles = [
  "customer",
  "provider",
  "sales",
  "support",
  "admin",
];

const statuses = [
  "active",
  "inactive",
  "blocked",
];

// Remove sensitive fields
const sanitizeUser = (user) => {
  const userObject = user.toObject();

  delete userObject.password;

  return userObject;
};

// Get all users
const getUsers = async (query) => {
  const { search, role, status } = query;

  const { page, limit, skip } = getPagination(query);

  const filter = {};

  if (search) {
    filter.$or = [
      {
        name: {
          $regex: search,
          $options: "i",
        },
      },
      {
        email: {
          $regex: search,
          $options: "i",
        },
      },
      {
        phone: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  if (role) {
    filter.role = role;
  }

  if (status) {
    filter.status = status;
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    User.countDocuments(filter),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get single user
const getUserById = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(userId)
    .select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

// Create user
const createUser = async (data) => {
  const email = data.email.trim().toLowerCase();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(409, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(
    data.password,
    12
  );

  const user = await User.create({
    name: data.name.trim(),
    email,
    password: hashedPassword,
    role: data.role,
    phone: data.phone || "",
    status: data.status || "active",
  });

  return User.findById(user._id)
    .select("-password");
};

// Update user profile
const updateUser = async (userId, data) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (data.email) {
    const email = data.email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email,
      _id: { $ne: userId },
    });

    if (existingUser) {
      throw new ApiError(
        409,
        "Email is already registered"
      );
    }

    user.email = email;
  }

  if (data.name !== undefined) {
    user.name = data.name.trim();
  }

  if (data.phone !== undefined) {
    user.phone = data.phone;
  }

  if (data.avatar !== undefined) {
    user.avatar = data.avatar;
  }

  await user.save();

  return User.findById(user._id)
    .select("-password");
};

// Change role
const updateUserRole = async (userId, role) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  if (!roles.includes(role)) {
    throw new ApiError(400, "Invalid user role");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.role = role;

  await user.save();

  return User.findById(user._id)
    .select("-password");
};

// Change status
const updateUserStatus = async (userId, status) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  if (!statuses.includes(status)) {
    throw new ApiError(400, "Invalid user status");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.status = status;

  await user.save();

  return User.findById(user._id)
    .select("-password");
};

// Delete user
const deleteUser = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await user.deleteOne();

  return {
    message: "User deleted successfully",
  };
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  updateUserStatus,
  deleteUser,
};
