const ResponseHandler = require("../common/responseHandler");
const OrderModel = require("../models/order.model");

class OrderController {
  // Danh sách đơn hàng
  async getOrderList(req, res) {
    try {
      const { page = 1, limit = 10, status, sortBy = "createdAt" } = req.query;

      const filter = {};
      if (status) filter.status = status;

      const orders = await OrderModel.paginate(filter, {
        page,
        limit,
        sort: { [sortBy]: -1 },
        populate: ["user", "orderDetails.product"],
      });

      return ResponseHandler.success(res, orders);
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }

  // Cập nhật trạng thái đơn hàng
  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      const order = await OrderModel.findById(orderId);
      order.status = status;
      await order.save();

      return ResponseHandler.success(res, order);
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }
}
