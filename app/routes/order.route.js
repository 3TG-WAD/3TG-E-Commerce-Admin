const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/order.controller");

router.get("/dashboard", OrderController.renderOrderPage);
router.get("/", OrderController.getOrderListUI);
router.get("/:orderId", OrderController.getOrderDetailsUI);
router.patch("/:orderId/status", OrderController.updateOrderStatus);

module.exports = router;
