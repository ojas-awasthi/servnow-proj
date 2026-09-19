const Joi = require("joi");

const notificationIdSchema = Joi.object({
  body: Joi.object(),
  params: Joi.object({
    id: Joi.string().required(),
  }),
  query: Joi.object(),
});

const getNotificationsSchema = Joi.object({
  body: Joi.object(),
  params: Joi.object(),
  query: Joi.object({
    isRead: Joi.string().valid("true", "false").optional(),
    type: Joi.string()
      .valid("booking", "payment", "lead", "ticket", "system")
      .optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  }),
});

module.exports = {
  notificationIdSchema,
  getNotificationsSchema,
};