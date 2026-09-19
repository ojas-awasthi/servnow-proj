const Joi = require("joi");

const createCategorySchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    description: Joi.string().max(500).allow("").optional(),
    image: Joi.string().allow("").optional(),
    isActive: Joi.boolean().optional(),
  }),
  params: Joi.object(),
  query: Joi.object(),
});

const updateCategorySchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    description: Joi.string().max(500).allow("").optional(),
    image: Joi.string().allow("").optional(),
    isActive: Joi.boolean().optional(),
  }),
  params: Joi.object({
    id: Joi.string().required(),
  }),
  query: Joi.object(),
});

const categoryIdSchema = Joi.object({
  body: Joi.object(),
  params: Joi.object({
    id: Joi.string().required(),
  }),
  query: Joi.object(),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
};