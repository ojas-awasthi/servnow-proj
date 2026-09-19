const Joi = require("joi");

const createPaymentSchema = Joi.object({
  body: Joi.object({
    booking: Joi.string().required(),

    paymentMethod: Joi.string()
      .valid(
        "card",
        "upi",
        "netbanking",
        "wallet",
        "mock"
      )
      .required(),
  }),

  params: Joi.object(),

  query: Joi.object(),
});

const transactionIdSchema = Joi.object({
  body: Joi.object(),

  params: Joi.object({
    id: Joi.string().required(),
  }),

  query: Joi.object(),
});

const adminTransactionQuerySchema = Joi.object({
  body: Joi.object(),

  params: Joi.object(),

  query: Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10),

    search: Joi.string()
      .allow("")
      .trim(),

    status: Joi.string().valid(
      "pending",
      "success",
      "failed",
      "refunded"
    ),

    paymentMethod: Joi.string().valid(
      "card",
      "upi",
      "netbanking",
      "wallet",
      "mock"
    ),

    sort: Joi.string().valid(
      "newest",
      "oldest",
      "amount_high",
      "amount_low"
    ),

    dateFrom: Joi.string().allow(""),

    dateTo: Joi.string().allow(""),
  }),
});

module.exports = {
  createPaymentSchema,
  transactionIdSchema,
  adminTransactionQuerySchema,
};