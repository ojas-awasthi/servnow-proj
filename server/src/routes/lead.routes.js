const express = require("express");

const leadController = require("../controllers/lead.controller");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware"); 
const validate = require("../middleware/validate.middleware");

const {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
  assignLeadSchema,
  leadIdSchema,
  followUpSchema,
} = require("../validators/lead.validator");

const router = express.Router();


// Create lead
router.post(
  "/",
  protect,
  authorize("sales", "admin"),
  validate(createLeadSchema),
  leadController.createLead
);


// Get all leads
router.get(
  "/",
  protect,
  authorize("sales", "admin"),
  leadController.getLeads
);

router.get(
  "/follow-ups",
  protect,
  authorize("sales", "admin"),
  validate(followUpSchema),
  leadController.getFollowUpLeads
);

// Get single lead
router.get(
  "/:id",
  protect,
  authorize("sales", "admin"),
  validate(leadIdSchema),
  leadController.getLeadById
);


// Update lead
router.put(
  "/:id",
  protect,
  authorize("sales", "admin"),
  validate(updateLeadSchema),
  leadController.updateLead
);


// Update lead status — Kanban
router.patch(
  "/:id/status",
  protect,
  authorize("sales", "admin"),
  validate(updateLeadStatusSchema),
  leadController.updateLeadStatus
);


// Assign lead
router.patch(
  "/:id/assign",
  protect,
  authorize("sales", "admin"),
  validate(assignLeadSchema),
  leadController.assignLead
);


// Delete lead
router.delete(
  "/:id",
  protect,
  authorize("sales", "admin"),
  validate(leadIdSchema),
  leadController.deleteLead
);


module.exports = router;