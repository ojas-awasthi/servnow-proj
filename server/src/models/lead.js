const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Lead name is required"],
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    source: {
      type: String,
      enum: [
        "website",
        "referral",
        "social_media",
        "advertisement",
        "other",
      ],
      default: "website",
    },

    serviceInterest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "converted",
        "lost",
      ],
      default: "new",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    notes: {
      type: String,
      trim: true,
    },

    followUpDate: {
      type: Date,
    },

    convertedCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

leadSchema.index({
  status: 1,
  assignedTo: 1,
});

module.exports = mongoose.model("Lead", leadSchema);