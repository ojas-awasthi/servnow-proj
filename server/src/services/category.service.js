const mongoose = require("mongoose");

const Category = require("../models/category");
const ApiError = require("../utils/ApiError");

const getCategories = async (query) => {
  const { search, status } = query;

  const filter = {};

  if (search) {
    filter.name = {
      $regex: search.trim(),
      $options: "i",
    };
  }

  if (status === "active") {
    filter.isActive = true;
  }

  if (status === "inactive") {
    filter.isActive = false;
  }

  const categories = await Category.find(filter).sort({
    createdAt: -1,
  });

  return categories;
};

const getCategoryById = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid category ID");
  }

  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return category;
};

const createCategory = async (data) => {
  const existingCategory = await Category.findOne({
    name: data.name.trim(),
  });

  if (existingCategory) {
    throw new ApiError(409, "Category already exists");
  }

  const category = await Category.create(data);

  return category;
};

const updateCategory = async (id, data) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid category ID");
  }

  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (data.name) {
    const duplicate = await Category.findOne({
      name: data.name.trim(),
      _id: { $ne: id },
    });

    if (duplicate) {
      throw new ApiError(409, "Category already exists");
    }
  }

  Object.assign(category, data);

  await category.save();

  return category;
};

const deleteCategory = async (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid category ID");
  }

  const category = await Category.findById(id);

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  await category.deleteOne();

  return {
    id,
    message: "Category deleted successfully",
  };
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
