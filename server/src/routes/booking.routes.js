const express = require("express");

const bookingController = require("../controllers/booking.controller");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createBookingSchema,
  bookingIdSchema,
  updateBookingStatusSchema,
} = require("../validators/booking.validator");

const router = express.Router();

router.get(
  "/",
  protect,
  authorize("customer", "provider", "admin"),
  bookingController.getBookings
);

router.post(
  "/",
  protect,
  authorize("customer"),
  validate(createBookingSchema),
  bookingController.createBooking
);

router.get(
  "/:id",
  protect,
  authorize("customer", "provider", "admin"),
  validate(bookingIdSchema),
  bookingController.getBookingById
);

router.patch(
  "/:id/status",
  protect,
  authorize("provider", "admin"),
  validate(updateBookingStatusSchema),
  bookingController.updateBookingStatus
);

module.exports = router;