const mongoose = require("mongoose");

const Booking = require("../models/booking");
const Service = require("../models/service");
const ApiError = require("../utils/ApiError");
const getPagination = require("../utils/pagination");
const createNotification = require("../utils/createNotification");

const createBooking = async (data, currentUser) => {
  if (!mongoose.Types.ObjectId.isValid(data.service)) {
    throw new ApiError(400, "Invalid service ID");
  }

  const service = await Service.findById(data.service);

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  if (service.status !== "active") {
    throw new ApiError(400, "Service is not available");
  }

  const bookingDate = new Date(data.bookingDate);

  if (Number.isNaN(bookingDate.getTime())) {
    throw new ApiError(400, "Invalid booking date");
  }

  if (bookingDate <= new Date()) {
    throw new ApiError(
      400,
      "Booking date must be in the future"
    );
  }

  const booking = await Booking.create({
    customer: currentUser.userId,
    provider: service.provider,
    service: service._id,
    bookingDate,
    address: data.address,
    notes: data.notes || "",
    amount: service.price,
    status: "pending",
    paymentStatus: "pending",
  });

  await createNotification({
    user: currentUser.userId,
    title: "Booking created",
    message: `Your booking for ${service.title} has been created successfully.`,
    type: "booking",
    relatedId: booking._id,
  });

  await createNotification({
    user: service.provider,
    title: "New booking received",
    message: `You have received a new booking for ${service.title}.`,
    type: "booking",
    relatedId: booking._id,
  });

  return Booking.findById(booking._id)
    .populate("customer", "name email phone")
    .populate("provider", "name email phone")
    .populate("service", "title description price duration images");
};

const getBookings = async (query, currentUser) => {
  const {
    status,
    paymentStatus,
    page = 1,
    limit = 10,
  } = query;

  const filter = {};

  // Customer sees only their bookings.
  if (currentUser.role === "customer") {
    filter.customer = currentUser.userId;
  }

  // Provider sees bookings belonging to their services.
  if (currentUser.role === "provider") {
    filter.provider = currentUser.userId;
  }

  if (status) {
    const validStatuses = [
      "pending",
      "confirmed",
      "in_progress",
      "completed",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      throw new ApiError(400, "Invalid booking status");
    }

    filter.status = status;
  }

  if (paymentStatus) {
    const validPaymentStatuses = [
      "pending",
      "paid",
      "failed",
      "refunded",
    ];

    if (!validPaymentStatuses.includes(paymentStatus)) {
      throw new ApiError(
        400,
        "Invalid payment status"
      );
    }

    filter.paymentStatus = paymentStatus;
  }

  const pagination = getPagination(page, limit);

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate("customer", "name email phone")
      .populate("provider", "name email phone")
      .populate(
        "service",
        "title description price duration images"
      )
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit),

    Booking.countDocuments(filter),
  ]);

  return {
    bookings,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit),
    },
  };
};

const getBookingById = async (id, currentUser) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid booking ID");
  }

  const booking = await Booking.findById(id)
    .populate("customer", "name email phone")
    .populate("provider", "name email phone")
    .populate(
      "service",
      "title description price duration images"
    );

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Customer can only see their own booking.
  if (
    currentUser.role === "customer" &&
    booking.customer._id.toString() !== currentUser.userId
  ) {
    throw new ApiError(403, "Access denied");
  }

  // Provider can only see their own service bookings.
  if (
    currentUser.role === "provider" &&
    booking.provider._id.toString() !== currentUser.userId
  ) {
    throw new ApiError(403, "Access denied");
  }

  return booking;
};

const updateBookingStatus = async (
  id,
  status,
  currentUser
) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid booking ID");
  }

  const booking = await Booking.findById(id);

  if (!booking) {
    throw new ApiError(404, "Booking not found");
  }

  // Provider can only update their own bookings.
  if (
    currentUser.role === "provider" &&
    booking.provider.toString() !== currentUser.userId
  ) {
    throw new ApiError(
      403,
      "You can only update your own bookings"
    );
  }

  const allowedStatuses = [
    "pending",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new ApiError(400, "Invalid booking status");
  }

  booking.status = status;

  await booking.save();

  return Booking.findById(booking._id)
    .populate("customer", "name email phone")
    .populate("provider", "name email phone")
    .populate(
      "service",
      "title description price duration images"
    );
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
};
