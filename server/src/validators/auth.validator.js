const Joi = require("joi");
const emailSchema = require("./email.validator");

const registerSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(100).required(),

    email: emailSchema.required(),

    password: Joi.string().min(6).required(),

    phone: Joi.string().allow("").optional(),
  }),

  params: Joi.object(),
  query: Joi.object(),
});

const loginSchema = Joi.object({
  body: Joi.object({
    email: emailSchema.required(),

    password: Joi.string().required(),
  }),

  params: Joi.object(),
  query: Joi.object(),
});

module.exports = {
  registerSchema,
  loginSchema,
};