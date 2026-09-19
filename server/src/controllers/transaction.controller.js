const transactionService = require("../services/transaction.service");

const createPayment = async (req, res, next) => {
  try {
    const transaction = await transactionService.createPayment(
      req.user.userId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Payment successful",
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

const getMyTransactions = async (req, res, next) => {
  try {
    const transactions =
      await transactionService.getMyTransactions(
        req.user.userId,
        req.query
      );

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const transaction =
      await transactionService.getTransactionById(
        req.user.userId,
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminTransactions = async (req, res, next) => {
  try {
    const result =
      await transactionService.getAdminTransactions(
        req.query
      );

    res.status(200).json({
      success: true,
      data: result.transactions,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminTransactionById = async (req, res, next) => {
  try {
    const transaction =
      await transactionService.getAdminTransactionById(
        req.params.id
      );

    res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPayment,
  getMyTransactions,
  getTransactionById,
  getAdminTransactions,
  getAdminTransactionById,
};