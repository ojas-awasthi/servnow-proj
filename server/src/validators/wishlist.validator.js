const Joi = require("joi");

const addWishlistSchema = Joi.object({
  body: Joi.object({
    serviceId: Joi.string().required(),
  }),
  params: Joi.object(),
  query: Joi.object(),
});

const removeWishlistSchema = Joi.object({
  body: Joi.object(),
  params: Joi.object({
    serviceId: Joi.string().required(),
  }),
  query: Joi.object(),
});

module.exports = {
  addWishlistSchema,
  removeWishlistSchema,
};