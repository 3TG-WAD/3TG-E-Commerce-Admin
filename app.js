const express = require("express");
const config = require("./config/config");
const connectDB = require("./config/database");
const configureExpress = require("./config/express");
// const adminRoutes = require("./app/routes/admin.route");
const userRoutes = require("./app/routes/user.route");
// const productRoutes = require("./app/routes/product.route");
// const orderRoutes = require("./app/routes/order.route");
// const reportRoutes = require("./app/routes/report.route");

const app = express();

// Configure Express
configureExpress(app);

// Connect to Database
connectDB();

// Start server
app.listen(config.server.port, () => {
  console.log(`Server running in ${config.env} mode`);
  console.log(
    `Server listening at http://${config.server.host}:${config.server.port}`
  );
});

app.use(express.json());
// app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/reports", reportRoutes);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});
