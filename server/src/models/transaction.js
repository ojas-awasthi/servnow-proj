const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: [true, "Booking is required"],
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"],
    },

    transactionId: {
      type: String,
      required: true,
      unique: true,
    },

    amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
      min: 0,
    },

    paymentMethod: {
      type: String,
      enum: ["card", "upi", "netbanking", "wallet", "mock"],
      default: "mock",
    },

    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },

    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({
  customer: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Transaction", transactionSchema);