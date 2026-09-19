const mongoose = require("mongoose");

const Wishlist = require("../models/wishlist");
const Service = require("../models/service");
const ApiError = require("../utils/ApiError");

const getWishlist = async (userId) => {
  let wishlist = await Wishlist.findOne({ user: userId }).populate({
    path: "services",
    populate: [
      {
        path: "category",
        select: "name",
      },
      {
        path: "provider",
        select: "name email phone avatar",
      },
    ],
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      services: [],
    });
  }

  return wishlist;
};

const addToWishlist = async (userId, serviceId) => {
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    throw new ApiError(400, "Invalid service ID");
  }

  const service = await Service.findOne({
    _id: serviceId,
    status: "active",
  });

  if (!service) {
    throw new ApiError(404, "Service not found");
  }

  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      services: [serviceId],
    });
  } else {
    const alreadyAdded = wishlist.services.some(
      (id) => id.toString() === serviceId
    );

    if (alreadyAdded) {
      throw new ApiError(409, "Service already exists in wishlist");
    }

    wishlist.services.push(serviceId);
    await wishlist.save();
  }

  return getWishlist(userId);
};

const removeFromWishlist = async (userId, serviceId) => {
  if (!mongoose.Types.ObjectId.isValid(serviceId)) {
    throw new ApiError(400, "Invalid service ID");
  }

  const wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  const originalLength = wishlist.services.length;

  wishlist.services = wishlist.services.filter(
    (id) => id.toString() !== serviceId
  );

  if (wishlist.services.length === originalLength) {
    throw new ApiError(404, "Service not found in wishlist");
  }

  await wishlist.save();

  return getWishlist(userId);
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};
