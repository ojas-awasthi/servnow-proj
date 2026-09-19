const Joi = require("joi");
const emailSchema = require("./email.validator");

const createLeadSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(100).required(),

    email: emailSchema.allow("").optional(),

    phone: Joi.string().allow("").optional(),

    source: Joi.string()
      .valid(
        "website",
        "referral",
        "social_media",
        "advertisement",
        "other"
      )
      .optional(),

    serviceInterest: Joi.string().allow("").optional(),

    priority: Joi.string()
      .valid("low", "medium", "high")
      .optional(),

    notes: Joi.string().max(2000).allow("").optional(),

    followUpDate: Joi.date().iso().allow(null).optional(),
  }),

  params: Joi.object(),
  query: Joi.object(),
});

const updateLeadSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(100).optional(),

    email: emailSchema.allow("").optional(),

    phone: Joi.string().allow("").optional(),

    source: Joi.string()
      .valid(
        "website",
        "referral",
        "social_media",
        "advertisement",
        "other"
      )
      .optional(),

    serviceInterest: Joi.string().allow("").optional(),

    priority: Joi.string()
      .valid("low", "medium", "high")
      .optional(),

    notes: Joi.string().max(2000).allow("").optional(),

    followUpDate: Joi.date().iso().allow(null).optional(),
  }),

  params: Joi.object({
    id: Joi.string().required(),
  }),

  query: Joi.object(),
});

const updateLeadStatusSchema = Joi.object({
  body: Joi.object({
    status: Joi.string()
      .valid(
        "new",
        "contacted",
        "qualified",
        "proposal",
        "converted",
        "lost"
      )
      .required(),
  }),

  params: Joi.object({
    id: Joi.string().required(),
  }),

  query: Joi.object(),
});

const assignLeadSchema = Joi.object({
  assignedTo: Joi.string().allow("").required(),
});

const followUpSchema = Joi.object({
  body: Joi.object(),

  params: Joi.object(),

  query: Joi.object({
    type: Joi.string()
      .valid("upcoming", "overdue", "all")
      .optional(),
  }),
});


const leadIdSchema = Joi.object({
  body: Joi.object(),

  params: Joi.object({
    id: Joi.string().required(),
  }),

  query: Joi.object(),
});

module.exports = {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
  assignLeadSchema,
  leadIdSchema,
  followUpSchema,
};