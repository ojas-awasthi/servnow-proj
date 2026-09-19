const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Review cannot exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({
  service: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Review", reviewSchema);