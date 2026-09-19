const Joi = require("joi");

const emailSchema =
  process.env.NODE_ENV === "development"
    ? Joi.string().email({ tlds: { allow: false } })
    : Joi.string().email();

module.exports = emailSchema;