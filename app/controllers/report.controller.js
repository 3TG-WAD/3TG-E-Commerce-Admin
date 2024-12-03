const ResponseHandler = require("../common/responseHandler");
const OrderModel = require("../models/order.model");

class ReportController {
  // Báo cáo doanh thu theo khoảng thời gian
  async getRevenueReport(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const report = await OrderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalAmount" },
          },
        },
      ]);

      return ResponseHandler.success(res, report);
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }

  // Báo cáo sản phẩm doanh thu cao
  async getTopRevenueProducts(req, res) {
    try {
      const { startDate, endDate } = req.query;

      const report = await OrderModel.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
          },
        },
        {
          $unwind: "$orderDetails",
        },
        {
          $group: {
            _id: "$orderDetails.productID",
            totalRevenue: {
              $sum: {
                $multiply: [
                  "$orderDetails.priceAtPurchase",
                  "$orderDetails.quantity",
                ],
              },
            },
          },
        },
        {
          $sort: { totalRevenue: -1 },
        },
        {
          $limit: 10,
        },
      ]);

      return ResponseHandler.success(res, report);
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }
}
