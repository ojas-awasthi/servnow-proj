const wishlistService = require("../services/wishlist.service");

const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.getWishlist(req.user.userId);

    res.status(200).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

const addToWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.addToWishlist(
      req.user.userId,
      req.body.serviceId
    );

    res.status(201).json({
      success: true,
      message: "Service added to wishlist",
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.removeFromWishlist(
      req.user.userId,
      req.params.serviceId
    );

    res.status(200).json({
      success: true,
      message: "Service removed from wishlist",
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};