const ApiError = require("../utils/ApiError");

const validate = (schema) => {
  return (req, res, next) => {

    // console.log("REQUEST BODY:", req.body);

    const { error, value } = schema.validate(
      {
        body: req.body,
        params: req.params,
        query: req.query,
      },
      {
        abortEarly: false,
        allowUnknown: true,
      }
    );

    if (error) {
      const message = error.details
        .map((detail) => detail.message)
        .join(", ");

      return next(new ApiError(400, message));
    }

    req.body = value.body;
    req.params = value.params;
    req.query = value.query;

    next();
  };
};

module.exports = validate;