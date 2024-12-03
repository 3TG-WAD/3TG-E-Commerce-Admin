const express = require("express");
const router = express.Router();
const ReportController = require("../controllers/report.controller");
// const authMiddleware = require("../middleware/auth.middleware");

// router.get("/revenue", authMiddleware, ReportController.getRevenueReport);
// router.get(
//   "/top-products",
//   authMiddleware,
//   ReportController.getTopRevenueProducts
// );

router.get("/revenue", ReportController.getRevenueReport);
router.get("/top-products", ReportController.getTopRevenueProducts);

module.exports = router;
