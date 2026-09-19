const serviceService = require("../services/service.service");

const getServices = async (req, res, next) => {
  try {
    const result = await serviceService.getServices(
      req.query
    );

    res.status(200).json({
      success: true,
      data: result.services,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

const getServiceById = async (req, res, next) => {
  try {
    const service = await serviceService.getServiceById(
      req.params.id
    );

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

const createService = async (req, res, next) => {
  try {
    const service = await serviceService.createService(
      req.body,
      req.user
    );

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

const updateService = async (req, res, next) => {
  try {
    const service = await serviceService.updateService(
      req.params.id,
      req.body,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

const deleteService = async (req, res, next) => {
  try {
    const result = await serviceService.deleteService(
      req.params.id,
      req.user
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        id: result.id,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
};