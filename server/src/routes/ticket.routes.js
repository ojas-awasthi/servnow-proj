const express = require("express");

const ticketController = require("../controllers/ticket.controller");

const protect = require("../middleware/auth.middleware");

const authorize = require("../middleware/role.middleware");

const validate = require("../middleware/validate.middleware");

const {
  createTicketSchema,
  updateTicketSchema,
  updateTicketStatusSchema,
  assignTicketSchema,
  resolveTicketSchema,
  ticketIdSchema,
} = require("../validators/ticket.validator");

const router = express.Router();


// Customer creates ticket

router.post(
  "/",
  protect,
  authorize("customer"),
  validate(createTicketSchema),
  ticketController.createTicket
);


// Customer / Support / Admin view tickets

router.get(
  "/",
  protect,
  authorize("customer", "support", "admin"),
  ticketController.getTickets
);


// Get single ticket

router.get(
  "/:id",
  protect,
  authorize("customer", "support", "admin"),
  validate(ticketIdSchema),
  ticketController.getTicketById
);


// Update ticket

router.put(
  "/:id",
  protect,
  authorize("customer", "support", "admin"),
  validate(updateTicketSchema),
  ticketController.updateTicket
);


// Update ticket status

router.patch(
  "/:id/status",
  protect,
  authorize("support", "admin"),
  validate(updateTicketStatusSchema),
  ticketController.updateTicketStatus
);


// Assign ticket

router.patch(
  "/:id/assign",
  protect,
  authorize("support", "admin"),
  validate(assignTicketSchema),
  ticketController.assignTicket
);


// Resolve ticket

router.patch(
  "/:id/resolve",
  protect,
  authorize("support", "admin"),
  validate(resolveTicketSchema),
  ticketController.resolveTicket
);


// Delete ticket

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validate(ticketIdSchema),
  ticketController.deleteTicket
);


module.exports = router;