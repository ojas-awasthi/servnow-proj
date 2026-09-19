require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const connectDB = require("../config/db");

const User = require("../models/user");
const Category = require("../models/category");
const Service = require("../models/service");

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("Clearing development data...");

    await Service.deleteMany({});
    await Category.deleteMany({});
    await User.deleteMany({});

    console.log("Creating users...");

    const password = await bcrypt.hash("Test123456", 12);

    const admin = await User.create({
      name: "ServNOW Admin",
      email: "admin@servnow.test",
      password,
      role: "admin",
      phone: "9000000001",
    });

    const provider = await User.create({
      name: "Raj Services",
      email: "provider@servnow.test",
      password,
      role: "provider",
      phone: "9000000002",
    });

    const customer = await User.create({
      name: "Ojas Customer",
      email: "customer@servnow.test",
      password,
      role: "customer",
      phone: "9000000003",
    });

    console.log("Creating categories...");

    const categories = await Category.insertMany([
      {
        name: "Home Services",
        description:
          "Professional services for home maintenance and cleaning.",
        isActive: true,
      },
      {
        name: "Technology",
        description:
          "Technology, software and digital services.",
        isActive: true,
      },
      {
        name: "Beauty & Wellness",
        description:
          "Personal wellness, fitness and beauty services.",
        isActive: true,
      },
      {
        name: "Automotive",
        description:
          "Vehicle maintenance and detailing services.",
        isActive: true,
      },
      {
        name: "Education",
        description:
          "Learning, tutoring and educational services.",
        isActive: true,
      },
    ]);

    const homeServices = categories.find(
      (category) => category.name === "Home Services"
    );

    const technology = categories.find(
      (category) => category.name === "Technology"
    );

    const beauty = categories.find(
      (category) => category.name === "Beauty & Wellness"
    );

    const automotive = categories.find(
      (category) => category.name === "Automotive"
    );

    const education = categories.find(
      (category) => category.name === "Education"
    );

    console.log("Creating services...");

    const services = await Service.insertMany([
      {
        title: "Home Deep Cleaning",
        description:
          "Professional deep cleaning service for apartments and houses.",
        category: homeServices._id,
        provider: provider._id,
        price: 2499,
        duration: "3-4 hours",
        images: [],
        rating: 4.8,
        reviewCount: 124,
        isFeatured: true,
        isTrending: true,
        status: "active",
      },
      {
        title: "AC Repair & Service",
        description:
          "Complete AC inspection, cleaning and repair service.",
        category: homeServices._id,
        provider: provider._id,
        price: 799,
        duration: "1-2 hours",
        images: [],
        rating: 4.6,
        reviewCount: 89,
        isFeatured: true,
        isTrending: false,
        status: "active",
      },
      {
        title: "Website Development",
        description:
          "Responsive business website development using modern web technologies.",
        category: technology._id,
        provider: provider._id,
        price: 15000,
        duration: "7-14 days",
        images: [],
        rating: 4.9,
        reviewCount: 56,
        isFeatured: true,
        isTrending: true,
        status: "active",
      },
      {
        title: "Personal Fitness Training",
        description:
          "One-on-one fitness training sessions designed around your goals.",
        category: beauty._id,
        provider: provider._id,
        price: 999,
        duration: "1 hour",
        images: [],
        rating: 4.7,
        reviewCount: 73,
        isFeatured: false,
        isTrending: true,
        status: "active",
      },
      {
        title: "Car Detailing",
        description:
          "Professional interior and exterior car cleaning and detailing.",
        category: automotive._id,
        provider: provider._id,
        price: 1999,
        duration: "3 hours",
        images: [],
        rating: 4.5,
        reviewCount: 41,
        isFeatured: false,
        isTrending: false,
        status: "active",
      },
      {
        title: "Programming Tutoring",
        description:
          "One-on-one programming lessons for beginners and intermediate learners.",
        category: education._id,
        provider: provider._id,
        price: 699,
        duration: "1 hour",
        images: [],
        rating: 4.8,
        reviewCount: 38,
        isFeatured: false,
        isTrending: true,
        status: "active",
      },
    ]);

    console.log("\n=================================");
    console.log("ServNOW seed completed successfully");
    console.log("=================================\n");

    console.log("USERS");
    console.log("-----------------------------");
    console.log(`Admin:     ${admin._id}`);
    console.log(`Provider:  ${provider._id}`);
    console.log(`Customer:  ${customer._id}`);

    console.log("\nCATEGORIES");
    console.log("-----------------------------");

    categories.forEach((category) => {
      console.log(`${category.name}: ${category._id}`);
    });

    console.log("\nSERVICES");
    console.log("-----------------------------");

    services.forEach((service) => {
      console.log(`${service.title}: ${service._id}`);
    });

    console.log("\nTEST CREDENTIALS");
    console.log("-----------------------------");
    console.log("Admin:");
    console.log("  email: admin@servnow.test");
    console.log("  password: Test123456");

    console.log("\nProvider:");
    console.log("  email: provider@servnow.test");
    console.log("  password: Test123456");

    console.log("\nCustomer:");
    console.log("  email: customer@servnow.test");
    console.log("  password: Test123456");

    console.log("\n");
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedDatabase();
