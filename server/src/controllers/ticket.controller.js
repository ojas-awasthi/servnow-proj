const ticketService = require("../services/ticket.service");

// Create ticket
const createTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.createTicket(
      req.user.userId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Support ticket created successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};


// Get tickets
const getTickets = async (req, res, next) => {
  try {
    const result = await ticketService.getTickets(
      req.user,
      req.query
    );

    res.status(200).json({
      success: true,
      data: result.tickets,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};


// Get single ticket
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicketById(
      req.user,
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};


// Update ticket
const updateTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.updateTicket(
      req.user,
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Support ticket updated successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};


// Update ticket status
const updateTicketStatus = async (req, res, next) => {
  try {
    const ticket = await ticketService.updateTicketStatus(
      req.params.id,
      req.body.status
    );

    res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};


// Assign ticket
const assignTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.assignTicket(
      req.params.id,
      req.body.assignedTo
    );

    res.status(200).json({
      success: true,
      message: "Ticket assigned successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};


// Resolve ticket
const resolveTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.resolveTicket(
      req.params.id,
      req.body.resolution
    );

    res.status(200).json({
      success: true,
      message: "Ticket resolved successfully",
      data: ticket,
    });
  } catch (error) {
    next(error);
  }
};


// Delete ticket
const deleteTicket = async (req, res, next) => {
  try {
    const result = await ticketService.deleteTicket(
      req.params.id
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
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