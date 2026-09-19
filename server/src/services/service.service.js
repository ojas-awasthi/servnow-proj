const mongoose = require("mongoose");

const Service = require("../models/service");
const Category = require("../models/category");
const User = require("../models/user");
const ApiError = require("../utils/ApiError");
const getPagination = require("../utils/pagination");

const getServices = async (query) => {
  const {
    search,
    category,
    provider,
    minPrice,
    maxPrice,
    minRating,
    sort = "newest",
    page = 1,
    limit = 12,
  } = query;

  const filter = {
    status: "active",
  };

  // Search
  if (search) {
    filter.$or = [
      {
        title: {
          $regex: search.trim(),
          $options: "i",
        },
      },
      {
        description: {
          $regex: search.trim(),
          $options: "i",
        },
      },
    ];
  }

  // Category filter
  if (category) {
    if (!mongoose.Types.ObjectId.isValid(category)) {
      throw new ApiError(400, "Invalid category ID");
    }

    filter.category = category;
  }

  // Provider filter
  if (provider) {
    if (!mongoose.Types.ObjectId.isValid(provider)) {
      throw new ApiError(400, "Invalid provider ID");
    }

    filter.provider = provider;
  }

  // Price filters
if (minPrice !== undefined || maxPrice !== undefined) {
  filter.price = {};

  if (minPrice !== undefined) {
    const minimum = Number(minPrice);

    if (Number.isNaN(minimum) || minimum < 0) {
      throw new ApiError(400, "Invalid minimum price");
    }

    filter.price.$gte = minimum;
  }

  if (maxPrice !== undefined) {
    const maximum = Number(maxPrice);

    if (Number.isNaN(maximum) || maximum < 0) {
      throw new ApiError(400, "Invalid maximum price");
    }

    filter.price.$lte = maximum;
  }

  if (
    filter.price.$gte !== undefined &&
    filter.price.$lte !== undefined &&
    filter.price.$gte > filter.price.$lte
  ) {
    throw new ApiError(
      400,
      "Minimum price cannot exceed maximum price"
    );
  }
}


  // Rating filter
  if (minRating !== undefined) {
    const rating = Number(minRating);

    if (Number.isNaN(rating) || rating < 0 || rating > 5) {
      throw new ApiError(400, "Invalid minimum rating");
    }

    filter.rating = {
      $gte: rating,
    };
  }

  // Pagination
  const pagination = getPagination(page, limit);

  // Sorting
  let sortOption = {
    createdAt: -1,
  };

  switch (sort) {
    case "price_asc":
      sortOption = { price: 1 };
      break;

    case "price_desc":
      sortOption = { price: -1 };
      break;

    case "rating_desc":
      sortOption = { rating: -1 };
      break;

    case "oldest":
      sortOption = { createdAt: 1 };
      break;

    case "newest":
    default:
      sortOption = { createdAt: -1 };
      break;
  }

  const [services, total] = await Promise.all([
    Service.find(filter)
      .populate("category", "name description image")
      .populate("provider", "name email phone avatar")
      .sort(sortOption)
      .skip(pagination.skip)
      .limit(pagination.limit),

    Service.countDocuments(filter),
  ]);

  return {
    services,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      pages: Math.ceil(total / pagination.limit),
    },
  };
};

const getServiceById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid service ID");
  }

  const service = await Service.findById(id)
    .populate("category", "name description image")
    .populate("provider", "name email phone avatar");

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  return service;
};

const createService = async (data, currentUser) => {
  if (!mongoose.Types.ObjectId.isValid(data.category)) {
    throw new ApiError(400, "Invalid category ID");
  }

  const category = await Category.findById(data.category);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (!category.isActive) {
    throw new ApiError(400, "Category is inactive");
  }

  let providerId = data.provider;

  // Provider users can only create services for themselves.
  if (currentUser.role === "provider") {
    providerId = currentUser.userId;
  }

  if (!providerId) {
    throw new ApiError(400, "Provider is required");
  }

  if (!mongoose.Types.ObjectId.isValid(providerId)) {
    throw new ApiError(400, "Invalid provider ID");
  }

  const provider = await User.findById(providerId);

  if (!provider) {
    throw new ApiError(404, "Provider not found");
  }

  if (provider.role !== "provider") {
    throw new ApiError(
      400,
      "Selected user is not a service provider"
    );
  }

  const service = await Service.create({
    ...data,
    provider: providerId,
  });

  return Service.findById(service._id)
    .populate("category", "name description image")
    .populate("provider", "name email phone avatar");
};

const updateService = async (id, data, currentUser) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid service ID");
  }

  const service = await Service.findById(id);

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  // Provider can only update their own service.
  if (
    currentUser.role === "provider" &&
    service.provider.toString() !== currentUser.userId
  ) {
    throw new ApiError(
      403,
      "You can only update your own services"
    );
  }

  if (data.category) {
    if (!mongoose.Types.ObjectId.isValid(data.category)) {
      throw new ApiError(400, "Invalid category ID");
    }

    const category = await Category.findById(data.category);

    if (!category) {
      throw new ApiError(404, "Category not found");
    }
  }

  // Prevent provider from changing ownership.
  if (currentUser.role === "provider") {
    delete data.provider;
  }

  Object.assign(service, data);

  await service.save();

  return Service.findById(service._id)
    .populate("category", "name description image")
    .populate("provider", "name email phone avatar");
};

const deleteService = async (id, currentUser) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid service ID");
  }

  const service = await Service.findById(id);

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  if (
    currentUser.role === "provider" &&
    service.provider.toString() !== currentUser.userId
  ) {
    throw new ApiError(
      403,
      "You can only delete your own services"
    );
  }

  await service.deleteOne();

  return {
    id,
    message: "Service deleted successfully",
  };
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};
