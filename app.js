const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const config = require("./config/config");
const connectDB = require("./config/database");
const configureExpress = require("./config/express");
// const adminRoutes = require("./app/routes/admin.route");
const authMiddleware = require("./app/middleware/auth.middleware");
const authRoutes = require("./app/routes/auth.route");
const userRoutes = require("./app/routes/user.route");
const productRoutes = require("./app/routes/product.route");
const orderRoutes = require("./app/routes/order.route");
const reportRoutes = require("./app/routes/report.route");
const variantsRoutes = require("./app/routes/variant.route");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const ejs = require("ejs");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "app/views"));
// app.use(expressLayouts);
// app.set("layout", "layouts/main");
app.use("/css", express.static(path.join(__dirname, "app/views/assets/css")));
app.use("/js", express.static(path.join(__dirname, "app/views/assets/js")));
app.use("/images", express.static(path.join(__dirname, "app/views/images")));
app.use("/assets", express.static(path.join(__dirname, "app/views/assets")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Chỉnh thành true nếu sử dụng HTTPS
  })
);
app.get("/login", (req, res) => {
  res.render("login");
});
app.use("/api/auth", authRoutes);
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", authMiddleware, orderRoutes);
app.use("/api/reports", authMiddleware, reportRoutes);
app.use("/api/variants", authMiddleware, variantsRoutes);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
  process.exit(1);
});
