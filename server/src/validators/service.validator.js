const Joi = require("joi");

const createServiceSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().min(2).max(150).required(),
    description: Joi.string().min(10).required(),
    category: Joi.string().required(),
    provider: Joi.string().optional(),
    price: Joi.number().min(0).required(),
    duration: Joi.string().allow("").optional(),
    images: Joi.array().items(Joi.string()).optional(),
    rating: Joi.number().min(0).max(5).optional(),
    reviewCount: Joi.number().min(0).optional(),
    isFeatured: Joi.boolean().optional(),
    isTrending: Joi.boolean().optional(),
    status: Joi.string()
      .valid("active", "inactive", "draft")
      .optional(),
  }),
  params: Joi.object(),
  query: Joi.object(),
});

const updateServiceSchema = Joi.object({
  body: Joi.object({
    title: Joi.string().min(2).max(150).optional(),
    description: Joi.string().min(10).optional(),
    category: Joi.string().optional(),
    provider: Joi.string().optional(),
    price: Joi.number().min(0).optional(),
    duration: Joi.string().allow("").optional(),
    images: Joi.array().items(Joi.string()).optional(),
    isFeatured: Joi.boolean().optional(),
    isTrending: Joi.boolean().optional(),
    status: Joi.string()
      .valid("active", "inactive", "draft")
      .optional(),
  }),
  params: Joi.object({
    id: Joi.string().required(),
  }),
  query: Joi.object(),
});

const serviceIdSchema = Joi.object({
  body: Joi.object(),
  params: Joi.object({
    id: Joi.string().required(),
  }),
  query: Joi.object(),
});

module.exports = {
  createServiceSchema,
  updateServiceSchema,
  serviceIdSchema,
};