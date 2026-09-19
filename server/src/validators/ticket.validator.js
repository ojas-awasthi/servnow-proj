const Joi = require("joi");

const createTicketSchema = Joi.object({
  body: Joi.object({
    subject: Joi.string()
      .min(3)
      .max(200)
      .required(),

    description: Joi.string()
      .min(5)
      .max(3000)
      .required(),

    priority: Joi.string()
      .valid("low", "medium", "high", "urgent")
      .optional(),

    category: Joi.string()
      .valid(
        "booking",
        "payment",
        "service",
        "account",
        "technical",
        "other"
      )
      .optional(),
  }),

  params: Joi.object(),
  query: Joi.object(),
});


const updateTicketSchema = Joi.object({
  body: Joi.object({
    subject: Joi.string()
      .min(3)
      .max(200)
      .optional(),

    description: Joi.string()
      .min(5)
      .max(3000)
      .optional(),

    priority: Joi.string()
      .valid("low", "medium", "high", "urgent")
      .optional(),

    category: Joi.string()
      .valid(
        "booking",
        "payment",
        "service",
        "account",
        "technical",
        "other"
      )
      .optional(),
  }),

  params: Joi.object({
    id: Joi.string().required(),
  }),

  query: Joi.object(),
});


const updateTicketStatusSchema = Joi.object({
  body: Joi.object({
    status: Joi.string()
      .valid(
        "open",
        "assigned",
        "in_progress",
        "resolved",
        "closed"
      )
      .required(),
  }),

  params: Joi.object({
    id: Joi.string().required(),
  }),

  query: Joi.object(),
});


const assignTicketSchema = Joi.object({
  body: Joi.object({
    assignedTo: Joi.string().required(),
  }),

  params: Joi.object({
    id: Joi.string().required(),
  }),

  query: Joi.object(),
});

const resolveTicketSchema = Joi.object({
  body: Joi.object({
    resolution: Joi.string()
      .min(3)
      .max(3000)
      .required(),
  }),

  params: Joi.object({
    id: Joi.string().required(),
  }),

  query: Joi.object(),
});

const ticketIdSchema = Joi.object({
  body: Joi.object(),

  params: Joi.object({
    id: Joi.string().required(),
  }),

  query: Joi.object(),
});


module.exports = {
  createTicketSchema,
  updateTicketSchema,
  updateTicketStatusSchema,
  assignTicketSchema,
  resolveTicketSchema,
  ticketIdSchema,
};