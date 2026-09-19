const mongoose = require("mongoose");

const Review = require("../models/review");
const Booking = require("../models/booking");
const Service = require("../models/service");
const ApiError = require("../utils/ApiError");

const recalculateServiceRating = async (serviceId) => {
  const result = await Review.aggregate([
    {
      $match: {
        service: new mongoose.Types.ObjectId(serviceId),
      },
    },
    {
      $group: {
        _id: "$service",
        averageRating: { $avg: "$rating" },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (result.length === 0) {
    await Service.findByIdAndUpdate(serviceId, {
      rating: 0,
      reviewCount: 0,
    });

    return;
  }

  await Service.findByIdAndUpdate(serviceId, {
    rating: Number(result[0].averageRating.toFixed(1)),
    reviewCount: result[0].reviewCount,
  });
};

const getServiceReviews = async (serviceId) => {
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    throw new ApiError(400, "Invalid service ID");
  }

  const service = await Service.findById(serviceId);

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  return Review.find({ service: serviceId })
    .populate("user", "name avatar")
    .sort({ createdAt: -1 });
};

const createReview = async (userId, data) => {
  const { service, booking, rating, comment } = data;

  if (!mongoose.Types.ObjectId.isValid(service)) {
    throw new ApiError(400, "Invalid service ID");
  }

  if (!mongoose.Types.ObjectId.isValid(booking)) {
    throw new ApiError(400, "Invalid booking ID");
  }

  const serviceExists = await Service.findById(service);

  if (!serviceExists) {
    throw new ApiError(404, "Service not found");
  }

  const bookingExists = await Booking.findOne({
    _id: booking,
    customer: userId,
    service,
  });

  if (!bookingExists) {
    throw new ApiError(
      403,
      "You can only review a service you have booked"
    );
  }

  if (bookingExists.status !== "completed") {
    throw new ApiError(
      400,
      "You can review a service only after the booking is completed"
    );
  }

  const existingReview = await Review.findOne({
    user: userId,
    booking,
  });

  if (existingReview) {
    throw new ApiError(409, "You have already reviewed this booking");
  }

  const review = await Review.create({
    user: userId,
    service,
    booking,
    rating,
    comment,
  });

  await recalculateServiceRating(service);

  return Review.findById(review._id).populate(
    "user",
    "name avatar"
  );
};

const updateReview = async (userId, reviewId, data) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ApiError(400, "Invalid review ID");
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (review.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only update your own review");
  }

  if (data.rating !== undefined) {
    review.rating = data.rating;
  }

  if (data.comment !== undefined) {
    review.comment = data.comment;
  }

  await review.save();

  await recalculateServiceRating(review.service);

  return Review.findById(review._id).populate(
    "user",
    "name avatar"
  );
};

const deleteReview = async (userId, reviewId) => {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ApiError(400, "Invalid review ID");
  }

  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  if (review.user.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only delete your own review");
  }

  const serviceId = review.service;

  await review.deleteOne();

  await recalculateServiceRating(serviceId);

  return {
    id: reviewId,
    message: "Review deleted successfully",
  };
};

module.exports = {
  getServiceReviews,
  createReview,
  updateReview,
  deleteReview,
};
