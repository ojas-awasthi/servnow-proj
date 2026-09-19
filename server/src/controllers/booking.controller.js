const bookingService = require("../services/booking.service");

const createBooking = async (req, res, next) => {
  try {
    const booking = await bookingService.createBooking(
      req.body,
      req.user
    );

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const getBookings = async (req, res, next) => {
  try {
    const result = await bookingService.getBookings(
      req.query,
      req.user
    );

    res.status(200).json({
      success: true,
      data: result.bookings,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await bookingService.getBookingById(
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

const updateBookingStatus = async (req, res, next) => {
  try {
    const booking =
      await bookingService.updateBookingStatus(
        req.params.id,
        req.body.status,
        req.user
      );

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
};