const mongoose = require("mongoose");

const SupportTicket = require("../models/supportTicket");
const User = require("../models/user");
const ApiError = require("../utils/ApiError");
const getPagination = require("../utils/pagination");
const createNotification = require("../utils/createNotification");


// Create a ticket
const createTicket = async (customerId, data) => {
  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    throw new ApiError(400, "Invalid customer ID");
  }

  const customer = await User.findById(customerId);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  const ticket = await SupportTicket.create({
    customer: customerId,
    subject: data.subject,
    description: data.description,
    priority: data.priority || "medium",
    category: data.category || "other",
    status: "open",
  });

  return SupportTicket.findById(ticket._id)
    .populate("customer", "name email phone")
    .populate("assignedTo", "name email role");
};


// Get tickets
const getTickets = async (user, query) => {
  const {
    search,
    status,
    priority,
    category,
    assignedTo,
  } = query;

  const { page, limit, skip } = getPagination(query);

  const filter = {};

  /*
   * Customers can only see their own tickets.
   * Support and admin can see all tickets.
   */
  if (user.role === "customer") {
  filter.customer = new mongoose.Types.ObjectId(
    String(user.userId)
  );
}

  if (search) {
    filter.$or = [
      { subject: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (status) {
    filter.status = status;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (category) {
    filter.category = category;
  }

  if (assignedTo) {
    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      throw new ApiError(400, "Invalid assigned user ID");
    }

    filter.assignedTo = assignedTo;
  }

  const [tickets, total] = await Promise.all([
    SupportTicket.find(filter)
      .populate("customer", "name email phone")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    SupportTicket.countDocuments(filter),
  ]);

  return {
    tickets,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


// Get one ticket
const getTicketById = async (user, ticketId) => {
  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    throw new ApiError(400, "Invalid ticket ID");
  }

  const ticket = await SupportTicket.findById(ticketId)
    .populate("customer", "name email phone")
    .populate("assignedTo", "name email role");

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  // Customer can only access their own ticket
  if (
    user.role === "customer" &&
    ticket.customer._id.toString() !== user.userId
  ) {
    throw new ApiError(403, "Access denied");
  }

  return ticket;
};


// Update ticket
const updateTicket = async (user, ticketId, data) => {
  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    throw new ApiError(400, "Invalid ticket ID");
  }

  const ticket = await SupportTicket.findById(ticketId);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  // Customers can only update their own tickets
  if (
    user.role === "customer" &&
    ticket.customer.toString() !== user.userId
  ) {
    throw new ApiError(403, "Access denied");
  }

  Object.assign(ticket, data);

  await ticket.save();

  return SupportTicket.findById(ticket._id)
    .populate("customer", "name email phone")
    .populate("assignedTo", "name email role");
};


// Update ticket status
const updateTicketStatus = async (ticketId, status) => {
  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    throw new ApiError(400, "Invalid ticket ID");
  }

  const ticket = await SupportTicket.findById(ticketId);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  ticket.status = status;

  await ticket.save();

  return SupportTicket.findById(ticket._id)
    .populate("customer", "name email phone")
    .populate("assignedTo", "name email role");
};


// Assign ticket
const assignTicket = async (ticketId, assignedTo) => {
  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    throw new ApiError(400, "Invalid ticket ID");
  }

  if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(assignedTo);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!["support", "admin"].includes(user.role)) {
    throw new ApiError(
      400,
      "Ticket can only be assigned to support or admin users"
    );
  }

  if (user.status !== "active") {
    throw new ApiError(
      400,
      "Ticket cannot be assigned to an inactive or blocked user"
    );
  }

  const ticket = await SupportTicket.findById(ticketId);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  ticket.assignedTo = assignedTo;

  // Automatically move open ticket to assigned
  if (ticket.status === "open") {
    ticket.status = "assigned";
  }

  await ticket.save();

  await createNotification({
    user: assignedTo,
    title: "New ticket assigned",
    message: `A support ticket has been assigned to you: ${ticket.subject}.`,
    type: "ticket",
    relatedId: ticket._id,
  });

  return SupportTicket.findById(ticket._id)
    .populate("customer", "name email phone")
    .populate("assignedTo", "name email role");
};


// Add resolution and resolve ticket
const resolveTicket = async (ticketId, resolution) => {
  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    throw new ApiError(400, "Invalid ticket ID");
  }

  const ticket = await SupportTicket.findById(ticketId);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  if (!resolution || !resolution.trim()) {
    throw new ApiError(400, "Resolution is required");
  }

  ticket.resolution = resolution;
  ticket.status = "resolved";

  await ticket.save();

  await createNotification({
    user: ticket.customer,
    title: "Ticket resolved",
    message: `Your support ticket "${ticket.subject}" has been resolved.`,
    type: "ticket",
    relatedId: ticket._id,
  });

  return SupportTicket.findById(ticket._id)
    .populate("customer", "name email phone")
    .populate("assignedTo", "name email role");
};


// Delete ticket
const deleteTicket = async (ticketId) => {
  if (!mongoose.Types.ObjectId.isValid(ticketId)) {
    throw new ApiError(400, "Invalid ticket ID");
  }

  const ticket = await SupportTicket.findById(ticketId);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  await ticket.deleteOne();

  return {
    message: "Ticket deleted successfully",
  };
};


module.exports = {
  createTicket,
  getTickets,
  getTicketById,
  updateTicket,
  updateTicketStatus,
  assignTicket,
  resolveTicket,
  deleteTicket,
};
