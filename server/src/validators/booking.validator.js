const Joi = require("joi");

const createBookingSchema = Joi.object({
  body: Joi.object({
    service: Joi.string().required(),
    bookingDate: Joi.date().iso().required(),
    address: Joi.string().min(5).max(500).required(),
    notes: Joi.string().max(1000).allow("").optional(),
  }),
  params: Joi.object(),
  query: Joi.object(),
});

const bookingIdSchema = Joi.object({
  body: Joi.object(),
  params: Joi.object({
    id: Joi.string().required(),
  }),
  query: Joi.object(),
});

const updateBookingStatusSchema = Joi.object({
  body: Joi.object({
    status: Joi.string()
      .valid(
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled"
      )
      .required(),
  }),
  params: Joi.object({
    id: Joi.string().required(),
  }),
  query: Joi.object(),
});

module.exports = {
  createBookingSchema,
  bookingIdSchema,
  updateBookingStatusSchema,
};