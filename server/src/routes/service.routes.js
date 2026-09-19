const express = require("express");

const serviceController = require("../controllers/service.controller");
const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createServiceSchema,
  updateServiceSchema,
  serviceIdSchema,
} = require("../validators/service.validator");

const router = express.Router();

router.get("/", serviceController.getServices);

router.get(
  "/:id",
  validate(serviceIdSchema),
  serviceController.getServiceById
);

router.post(
  "/",
  protect,
  authorize("admin", "provider"),
  validate(createServiceSchema),
  serviceController.createService
);

router.put(
  "/:id",
  protect,
  authorize("admin", "provider"),
  validate(updateServiceSchema),
  serviceController.updateService
);

router.delete(
  "/:id",
  protect,
  authorize("admin", "provider"),
  validate(serviceIdSchema),
  serviceController.deleteService
);

module.exports = router;