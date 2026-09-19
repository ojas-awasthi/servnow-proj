const leadService = require("../services/lead.service");

const createLead = async (req, res, next) => {
  try {
    const lead = await leadService.createLead(req.body);

    res.status(201).json({
      success: true,
      message: "Lead created successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

const getLeads = async (req, res, next) => {
  try {
    const result = await leadService.getLeads(req.query);

    res.status(200).json({
      success: true,
      data: result.leads,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getLeadById = async (req, res, next) => {
  try {
    const lead = await leadService.getLeadById(req.params.id);

    res.status(200).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

const updateLead = async (req, res, next) => {
  try {
    const lead = await leadService.updateLead(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Lead updated successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

const updateLeadStatus = async (req, res, next) => {
  try {
    const lead = await leadService.updateLeadStatus(
      req.params.id,
      req.body.status
    );

    res.status(200).json({
      success: true,
      message: "Lead status updated successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

const assignLead = async (req, res, next) => {
  try {
    const lead = await leadService.assignLead(
      req.params.id,
      req.body.assignedTo
    );

    res.status(200).json({
      success: true,
      message: "Lead assigned successfully",
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

const getFollowUpLeads = async (req, res, next) => {
  try {
    const type = req.query.type || "upcoming";

    const leads = await leadService.getFollowUpLeads(type);

    res.status(200).json({
      success: true,
      data: leads,
    });
  } catch (error) {
    next(error);
  }
};

const deleteLead = async (req, res, next) => {
  try {
    const result = await leadService.deleteLead(req.params.id);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};





module.exports = {
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  updateLeadStatus,
  assignLead,
  getFollowUpLeads,
  deleteLead,
};