const mongoose = require("mongoose");

const Lead = require("../models/lead");
const User = require("../models/user");
const Service = require("../models/service");
const ApiError = require("../utils/ApiError");
const getPagination = require("../utils/pagination");
const createNotification = require("../utils/createNotification");

const createLead = async (data) => {
  const {
    name,
    email,
    phone,
    source,
    serviceInterest,
    priority,
    notes,
    followUpDate,
  } = data;

  // Validate service interest if provided
  if (serviceInterest) {
    if (!mongoose.Types.ObjectId.isValid(serviceInterest)) {
      throw new ApiError(400, "Invalid service ID");
    }

    const service = await Service.findById(serviceInterest);

    if (!service) {
      throw new ApiError(404, "Service not found");
    }
  }

  const lead = await Lead.create({
    name,
    email,
    phone,
    source,
    serviceInterest: serviceInterest || undefined,
    priority,
    notes,
    followUpDate,
  });

  return Lead.findById(lead._id)
    .populate("serviceInterest", "title price")
    .populate("assignedTo", "name email role")
    .populate("convertedCustomer", "name email");
};

const getLeads = async (query) => {
  const {
    search,
    status,
    priority,
    assignedTo,
    source,
  } = query;

  const { page, limit, skip } = getPagination(query);

  const filter = {};

  // Search
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  // Filters
  if (status) {
    filter.status = status;
  }

  if (priority) {
    filter.priority = priority;
  }

  if (source) {
    filter.source = source;
  }

  if (assignedTo) {
    if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
      throw new ApiError(400, "Invalid assigned user ID");
    }

    filter.assignedTo = assignedTo;
  }

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .populate("serviceInterest", "title price")
      .populate("assignedTo", "name email role")
      .populate("convertedCustomer", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Lead.countDocuments(filter),
  ]);

  return {
    leads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getLeadById = async (leadId) => {
  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError(400, "Invalid lead ID");
  }

  const lead = await Lead.findById(leadId)
    .populate("serviceInterest", "title description price")
    .populate("assignedTo", "name email role")
    .populate("convertedCustomer", "name email");

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  return lead;
};

const updateLead = async (leadId, data) => {
  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError(400, "Invalid lead ID");
  }

  // Validate service interest if provided
  if (data.serviceInterest) {
    if (!mongoose.Types.ObjectId.isValid(data.serviceInterest)) {
      throw new ApiError(400, "Invalid service ID");
    }

    const service = await Service.findById(data.serviceInterest);

    if (!service) {
      throw new ApiError(404, "Service not found");
    }
  }

  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  Object.assign(lead, data);

  await lead.save();

  return Lead.findById(lead._id)
    .populate("serviceInterest", "title price")
    .populate("assignedTo", "name email role")
    .populate("convertedCustomer", "name email");
};

const updateLeadStatus = async (leadId, status) => {
  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError(400, "Invalid lead ID");
  }

  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  lead.status = status;

  await lead.save();

  return Lead.findById(lead._id)
    .populate("serviceInterest", "title price")
    .populate("assignedTo", "name email role")
    .populate("convertedCustomer", "name email");
};

const assignLead = async (leadId, assignedTo) => {
  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError(400, "Invalid lead ID");
  }

  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  /*
   * Allow a lead to be unassigned.
   *
   * Frontend sends:
   * {
   *   assignedTo: ""
   * }
   *
   * The database stores:
   * assignedTo: null
   */
  if (assignedTo === null || assignedTo === "") {
    lead.assignedTo = null;

    await lead.save();

    return Lead.findById(lead._id)
      .populate("serviceInterest", "title price")
      .populate("assignedTo", "name email role")
      .populate("convertedCustomer", "name email");
  }

  // Normal assignment flow
  if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const user = await User.findById(assignedTo);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!["sales", "admin"].includes(user.role)) {
    throw new ApiError(
      400,
      "Lead can only be assigned to sales or admin users"
    );
  }

  if (user.status !== "active") {
    throw new ApiError(
      400,
      "Lead cannot be assigned to an inactive or blocked user"
    );
  }

  lead.assignedTo = assignedTo;

  await lead.save();

  await createNotification({
    user: assignedTo,
    title: "New lead assigned",
    message: `A new lead has been assigned to you: ${lead.name}.`,
    type: "lead",
    relatedId: lead._id,
  });

  return Lead.findById(lead._id)
    .populate("serviceInterest", "title price")
    .populate("assignedTo", "name email role")
    .populate("convertedCustomer", "name email");
};

const getFollowUpLeads = async (type = "upcoming") => {
  const now = new Date();

  const filter = {
    followUpDate: {
      $ne: null,
    },
    status: {
      $nin: ["converted", "lost"],
    },
  };

  if (type === "overdue") {
    filter.followUpDate.$lt = now;
  } else if (type === "upcoming") {
    filter.followUpDate.$gte = now;
  } else if (type !== "all") {
    throw new ApiError(
      400,
      "Invalid follow-up type. Use upcoming, overdue, or all"
    );
  }

  const leads = await Lead.find(filter)
    .populate("serviceInterest", "title price")
    .populate("assignedTo", "name email role")
    .sort({ followUpDate: 1 });

  return leads;
};

const deleteLead = async (leadId) => {
  if (!mongoose.Types.ObjectId.isValid(leadId)) {
    throw new ApiError(400, "Invalid lead ID");
  }

  const lead = await Lead.findById(leadId);

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  await lead.deleteOne();

  return {
    message: "Lead deleted successfully",
  };
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
