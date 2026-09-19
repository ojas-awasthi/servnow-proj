const reviewService = require("../services/review.service");

const getServiceReviews = async (req, res, next) => {
  try {
    const reviews = await reviewService.getServiceReviews(
      req.params.serviceId
    );

    res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(
      req.user.userId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const review = await reviewService.updateReview(
      req.user.userId,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const result = await reviewService.deleteReview(
      req.user.userId,
      req.params.id
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        id: result.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServiceReviews,
  createReview,
  updateReview,
  deleteReview,
};