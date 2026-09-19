const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const categoryRoutes = require("./routes/category.routes");
const serviceRoutes = require("./routes/service.routes");
const bookingRoutes = require("./routes/booking.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const reviewRoutes = require("./routes/review.routes");
const transactionRoutes = require("./routes/transaction.routes");
const leadRoutes = require("./routes/lead.routes");
const ticketRoutes = require("./routes/ticket.routes");
const notificationRoutes = require("./routes/notification.routes");
const userRoutes = require("./routes/user.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const errorHandler = require("./middleware/error.middleware");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ServNOW API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});


app.use(errorHandler);

module.exports = app;