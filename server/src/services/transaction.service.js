const mongoose = require("mongoose");
const crypto = require("crypto");

const Transaction = require("../models/transaction");
const Booking = require("../models/booking");
const User = require("../models/user");
const Service = require("../models/service");

const ApiError = require("../utils/ApiError");
const createNotification = require("../utils/createNotification");

const createPayment = async (userId, data) => {
  const { booking, paymentMethod } = data;

  if (!mongoose.Types.ObjectId.isValid(booking)) {
    throw new ApiError(400, "Invalid booking ID");
  }

  const bookingExists = await Booking.findOne({
    _id: booking,
    customer: userId,
  });

  if (!bookingExists) {
    throw new ApiError(
      404,
      "Booking not found or does not belong to you"
    );
  }

  if (bookingExists.status === "cancelled") {
    throw new ApiError(
      400,
      "Payment cannot be made for a cancelled booking"
    );
  }

  if (bookingExists.paymentStatus === "paid") {
    throw new ApiError(
      409,
      "Booking has already been paid"
    );
  }

  const transactionId = `TXN-${Date.now()}-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;

  const transaction = await Transaction.create({
    booking: bookingExists._id,
    customer: userId,
    transactionId,
    amount: bookingExists.amount,
    paymentMethod,
    status: "success",
    paidAt: new Date(),
  });

  bookingExists.paymentStatus = "paid";
  await bookingExists.save();

  await createNotification({
    user: userId,
    title: "Payment successful",
    message: `Payment of ₹${bookingExists.amount} was completed successfully.`,
    type: "payment",
    relatedId: bookingExists._id,
  });

  return Transaction.findById(transaction._id)
    .populate("booking")
    .populate("customer", "name email phone");
};

const getMyTransactions = async (userId, query) => {
  const { status } = query;

  const filter = {
    customer: userId,
  };

  if (status) {
    filter.status = status;
  }

  return Transaction.find(filter)
    .populate("booking", "service bookingDate amount status")
    .sort({ createdAt: -1 });
};

const getTransactionById = async (userId, transactionId) => {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    throw new ApiError(400, "Invalid transaction ID");
  }

  const transaction = await Transaction.findOne({
    _id: transactionId,
    customer: userId,
  })
    .populate("booking")
    .populate("customer", "name email phone");

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  return transaction;
};

/*
 * CRM / Admin transaction list
 *
 * This is intentionally separate from getMyTransactions().
 * Customer APIs remain customer-scoped.
 */
const getAdminTransactions = async (query) => {
  const {
    page = 1,
    limit = 10,
    search,
    status,
    paymentMethod,
    sort = "newest",
    dateFrom,
    dateTo,
  } = query;

  const currentPage = Math.max(Number(page) || 1, 1);
  const currentLimit = Math.min(
    Math.max(Number(limit) || 10, 1),
    100
  );

  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (paymentMethod) {
    filter.paymentMethod = paymentMethod;
  }

  if (dateFrom || dateTo) {
    filter.createdAt = {};

    if (dateFrom) {
      const from = new Date(dateFrom);

      if (Number.isNaN(from.getTime())) {
        throw new ApiError(400, "Invalid dateFrom");
      }

      filter.createdAt.$gte = from;
    }

    if (dateTo) {
      const to = new Date(dateTo);

      if (Number.isNaN(to.getTime())) {
        throw new ApiError(400, "Invalid dateTo");
      }

      to.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = to;
    }
  }

  /*
   * Search supports:
   * - transaction ID
   * - customer name
   * - customer email
   * - service title
   */
  if (search && search.trim()) {
    const searchTerm = search.trim();

    const [customers, services] = await Promise.all([
      User.find({
        $or: [
          {
            name: {
              $regex: searchTerm,
              $options: "i",
            },
          },
          {
            email: {
              $regex: searchTerm,
              $options: "i",
            },
          },
        ],
      }).select("_id"),

      Service.find({
        title: {
          $regex: searchTerm,
          $options: "i",
        },
      }).select("_id"),
    ]);

    const customerIds = customers.map((user) => user._id);

    let bookingIds = [];

    if (services.length > 0) {
      const bookings = await Booking.find({
        service: {
          $in: services.map((service) => service._id),
        },
      }).select("_id");

      bookingIds = bookings.map((booking) => booking._id);
    }

    filter.$or = [
      {
        transactionId: {
          $regex: searchTerm,
          $options: "i",
        },
      },
      {
        customer: {
          $in: customerIds,
        },
      },
      {
        booking: {
          $in: bookingIds,
        },
      },
    ];
  }

  let sortOption = {
    createdAt: -1,
  };

  if (sort === "oldest") {
    sortOption = {
      createdAt: 1,
    };
  }

  if (sort === "amount_high") {
    sortOption = {
      amount: -1,
      createdAt: -1,
    };
  }

  if (sort === "amount_low") {
    sortOption = {
      amount: 1,
      createdAt: -1,
    };
  }

  const skip = (currentPage - 1) * currentLimit;

  const [transactions, total] = await Promise.all([
    Transaction.find(filter)
      .populate("customer", "name email phone")
      .populate({
        path: "booking",
        select:
          "service bookingDate amount status paymentStatus address",
        populate: {
          path: "service",
          select: "title price",
        },
      })
      .sort(sortOption)
      .skip(skip)
      .limit(currentLimit),

    Transaction.countDocuments(filter),
  ]);

  return {
    transactions,
    pagination: {
      page: currentPage,
      limit: currentLimit,
      total,
      totalPages: Math.max(
        Math.ceil(total / currentLimit),
        1
      ),
    },
  };
};

/*
 * CRM / Admin transaction details
 */
const getAdminTransactionById = async (transactionId) => {
  if (!mongoose.Types.ObjectId.isValid(transactionId)) {
    throw new ApiError(400, "Invalid transaction ID");
  }

  const transaction = await Transaction.findById(transactionId)
    .populate("customer", "name email phone status")
    .populate({
      path: "booking",
      populate: {
        path: "service",
        select: "title description price duration",
      },
    });

  if (!transaction) {
    throw new ApiError(404, "Transaction not found");
  }

  return transaction;
};

module.exports = {
  createPayment,
  getMyTransactions,
  getTransactionById,
  getAdminTransactions,
  getAdminTransactionById,
};
