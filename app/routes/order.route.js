const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/order.controller");
// const authMiddleware = require("../middleware/auth.middleware");

// router.get("/", authMiddleware, OrderController.getOrderList);
// router.patch(
//   "/:orderId/status",
//   authMiddleware,
//   OrderController.updateOrderStatus
// );

router.get("/", OrderController.getOrderList);
router.patch("/:orderId/status", OrderController.updateOrderStatus);

module.exports = router;
