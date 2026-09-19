const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Provider is required"],
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: [true, "Service is required"],
    },

    bookingDate: {
      type: Date,
      required: [true, "Booking date is required"],
    },

    address: {
      type: String,
      required: [true, "Service address is required"],
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
    },

    amount: {
      type: Number,
      required: [true, "Booking amount is required"],
      min: 0,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({
  customer: 1,
  createdAt: -1,
});

bookingSchema.index({
  provider: 1,
  status: 1,
});

module.exports = mongoose.model("Booking", bookingSchema);