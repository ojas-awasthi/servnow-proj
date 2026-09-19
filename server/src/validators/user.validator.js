const Joi = require("joi");
const emailSchema = require("./email.validator");

const roles = [
  "customer",
  "provider",
  "sales",
  "support",
  "admin",
];

const statuses = [
  "active",
  "inactive",
  "blocked",
];

// Get users
const getUsersSchema = Joi.object({
  body: Joi.object(),
  params: Joi.object(),
  query: Joi.object({
    search: Joi.string().allow("").optional(),

    role: Joi.string()
      .valid(...roles)
      .optional(),

    status: Joi.string()
      .valid(...statuses)
      .optional(),

    page: Joi.number()
      .integer()
      .min(1)
      .optional(),

    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .optional(),
  }),
});

// User ID
const userIdSchema = Joi.object({
  body: Joi.object(),
  params: Joi.object({
    id: Joi.string().required(),
  }),
  query: Joi.object(),
});

// Create user
const createUserSchema = Joi.object({
  body: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required(),

    email: emailSchema.required(),

    password: Joi.string()
      .min(6)
      .max(100)
      .required(),

    role: Joi.string()
      .valid(...roles)
      .required(),

    phone: Joi.string()
      .allow("")
      .optional(),

    status: Joi.string()
      .valid(...statuses)
      .optional(),
  }),

  params: Joi.object(),
  query: Joi.object(),
});

// Update user
const updateUserSchema = Joi.object({
  body: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .optional(),

    email: emailSchema.optional(),

    phone: Joi.string()
      .allow("")
      .optional(),

    avatar: Joi.string()
      .allow("")
      .optional(),
  }),

  params: Joi.object({
    id: Joi.string().required(),
  }),

  query: Joi.object(),
});

// Change role
const updateUserRoleSchema = Joi.object({
  body: Joi.object({
    role: Joi.string()
      .valid(...roles)
      .required(),
  }),

  params: Joi.object({
    id: Joi.string().required(),
  }),

  query: Joi.object(),
});

// Change status
const updateUserStatusSchema = Joi.object({
  body: Joi.object({
    status: Joi.string()
      .valid(...statuses)
      .required(),
  }),

  params: Joi.object({
    id: Joi.string().required(),
  }),

  query: Joi.object(),
});

module.exports = {
  getUsersSchema,
  userIdSchema,
  createUserSchema,
  updateUserSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
};