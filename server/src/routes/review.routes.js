const express = require("express");

const reviewController = require("../controllers/review.controller");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createReviewSchema,
  updateReviewSchema,
  reviewIdSchema,
  serviceReviewsSchema,
} = require("../validators/review.validator");

const router = express.Router();

// Get reviews for a service
router.get(
  "/service/:serviceId",
  validate(serviceReviewsSchema),
  reviewController.getServiceReviews
);

// All remaining review operations require customer authentication
router.use(protect, authorize("customer"));

// Create review
router.post(
  "/",
  validate(createReviewSchema),
  reviewController.createReview
);

// Update review
router.put(
  "/:id",
  validate(updateReviewSchema),
  reviewController.updateReview
);

// Delete review
router.delete(
  "/:id",
  validate(reviewIdSchema),
  reviewController.deleteReview
);

module.exports = router;