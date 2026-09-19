const express = require("express");

const userController = require("../controllers/user.controller");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");

const {
  getUsersSchema,
  userIdSchema,
  createUserSchema,
  updateUserSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
} = require("../validators/user.validator");

const router = express.Router();

// Get all users
router.get(
  "/",
  protect,
  authorize("admin"),
  validate(getUsersSchema),
  userController.getUsers
);

// Get single user
router.get(
  "/:id",
  protect,
  authorize("admin"),
  validate(userIdSchema),
  userController.getUserById
);

// Create user
router.post(
  "/",
  protect,
  authorize("admin"),
  validate(createUserSchema),
  userController.createUser
);

// Update user profile
router.put(
  "/:id",
  protect,
  authorize("admin"),
  validate(updateUserSchema),
  userController.updateUser
);

// Change user role
router.patch(
  "/:id/role",
  protect,
  authorize("admin"),
  validate(updateUserRoleSchema),
  userController.updateUserRole
);

// Change user status
router.patch(
  "/:id/status",
  protect,
  authorize("admin"),
  validate(updateUserStatusSchema),
  userController.updateUserStatus
);

// Delete user
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validate(userIdSchema),
  userController.deleteUser
);

module.exports = router;