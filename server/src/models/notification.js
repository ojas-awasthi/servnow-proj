const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: [
        "booking",
        "payment",
        "lead",
        "ticket",
        "system",
      ],
      default: "system",
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({
  user: 1,
  isRead: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Notification", notificationSchema);