const mongoose = require("mongoose");

const supportTicketSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    subject: {
      type: String,
      required: [true, "Ticket subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },

    description: {
      type: String,
      required: [true, "Ticket description is required"],
      trim: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    status: {
      type: String,
      enum: [
        "open",
        "assigned",
        "in_progress",
        "resolved",
        "closed",
      ],
      default: "open",
    },

    category: {
      type: String,
      enum: [
        "booking",
        "payment",
        "service",
        "account",
        "technical",
        "other",
      ],
      default: "other",
    },

    resolution: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

supportTicketSchema.index({
  status: 1,
  priority: 1,
});

module.exports = mongoose.model(
  "SupportTicket",
  supportTicketSchema
);