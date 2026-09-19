const express = require("express");

const transactionController = require("../controllers/transaction.controller");

const protect = require("../middleware/auth.middleware");
const authorize = require("../middleware/role.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createPaymentSchema,
  transactionIdSchema,
  adminTransactionQuerySchema,
} = require("../validators/transaction.validator");

const router = express.Router();

/*
 * Customer payment
 */
router.post(
  "/pay",
  protect,
  authorize("customer"),
  validate(createPaymentSchema),
  transactionController.createPayment
);

/*
 * CRM / Admin transaction list
 */
router.get(
  "/admin",
  protect,
  authorize("admin", "sales", "support"),
  validate(adminTransactionQuerySchema),
  transactionController.getAdminTransactions
);

/*
 * CRM / Admin transaction details
 */
router.get(
  "/admin/:id",
  protect,
  authorize("admin", "sales", "support"),
  validate(transactionIdSchema),
  transactionController.getAdminTransactionById
);

/*
 * Customer transaction list
 */
router.get(
  "/",
  protect,
  authorize("customer"),
  transactionController.getMyTransactions
);

/*
 * Customer transaction details
 */
router.get(
  "/:id",
  protect,
  authorize("customer"),
  validate(transactionIdSchema),
  transactionController.getTransactionById
);

module.exports = router;