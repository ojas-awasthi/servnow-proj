const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
      maxlength: [150, "Service title cannot exceed 150 characters"],
    },

    description: {
      type: String,
      required: [true, "Service description is required"],
      trim: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },

    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Provider is required"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    duration: {
      type: String,
      trim: true,
    },

    images: [
      {
        type: String,
      },
    ],

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isTrending: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({
  title: "text",
  description: "text",
});

serviceSchema.index({
  category: 1,
  price: 1,
  rating: -1,
});

module.exports = mongoose.model("Service", serviceSchema);