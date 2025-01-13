const express = require("express");
const router = express.Router();
const ReportController = require("../controllers/report.controller");

router.get("/revenue", ReportController.getRevenueReport);
router.get("/top-products", ReportController.getTopRevenueProducts);
router.get("/", ReportController.renderReport);

module.exports = router;
