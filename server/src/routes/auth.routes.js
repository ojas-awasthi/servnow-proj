const express = require("express");

const authController = require("../controllers/auth.controller");
const protect = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const {
  registerSchema,
  loginSchema,
} = require("../validators/auth.validator");

const router = express.Router();

router.post(
  "/register",
  validate(registerSchema),
  authController.register
);

router.post(
  "/login",
  validate(loginSchema),
  authController.login
);

router.get(
  "/me",
  protect,
  authController.getMe
);

module.exports = router;