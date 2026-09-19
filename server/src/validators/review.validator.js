const Joi = require("joi");

const createReviewSchema = Joi.object({
  body: Joi.object({
    service: Joi.string().required(),
    booking: Joi.string().required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    comment: Joi.string().max(1000).allow("").optional(),
  }),
  params: Joi.object(),
  query: Joi.object(),
});

const updateReviewSchema = Joi.object({
  body: Joi.object({
    rating: Joi.number().integer().min(1).max(5).optional(),
    comment: Joi.string().max(1000).allow("").optional(),
  }),
  params: Joi.object({
    id: Joi.string().required(),
  }),
  query: Joi.object(),
});

const reviewIdSchema = Joi.object({
  body: Joi.object(),
  params: Joi.object({
    id: Joi.string().required(),
  }),
  query: Joi.object(),
});

const serviceReviewsSchema = Joi.object({
  body: Joi.object(),
  params: Joi.object({
    serviceId: Joi.string().required(),
  }),
  query: Joi.object(),
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
  reviewIdSchema,
  serviceReviewsSchema,
};