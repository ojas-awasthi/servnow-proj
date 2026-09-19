const express = require("express");

const categoryController = require("../controllers/category.controller");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
} = require("../validators/category.validator");

const router = express.Router();

router.get("/", categoryController.getCategories);

router.get(
  "/:id",
  validate(categoryIdSchema),
  categoryController.getCategoryById
);

router.post(
  "/",
  protect,
  authorize("admin"),
  validate(createCategorySchema),
  categoryController.createCategory
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  validate(updateCategorySchema),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validate(categoryIdSchema),
  categoryController.deleteCategory
);

module.exports = router;