const ResponseHandler = require("../common/responseHandler");
const OrderModel = require("../models/order.model");
const moment = require("moment");

class ReportController {
  async getRevenueReport(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let matchCondition = {};
      if (startDate && endDate) {
        const start = moment(startDate).startOf("day").toDate();
        const end = moment(endDate).endOf("day").toDate();
        matchCondition.createdAt = { $gte: start, $lte: end };
      }

      const report = await OrderModel.aggregate([
        {
          $match: matchCondition,
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total_amount" },
          },
        },
      ]);

      const totalRevenue = report.length > 0 ? report[0].totalRevenue : 0;
      return totalRevenue; // Trả về dữ liệu trực tiếp
    } catch (error) {
      throw error; // Ném lỗi để xử lý ở hàm gọi
    }
  }

  async getTopRevenueProducts(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let matchCondition = {};
      if (startDate && endDate) {
        const start = moment(startDate).startOf("day").toDate();
        const end = moment(endDate).endOf("day").toDate();
        matchCondition.createdAt = { $gte: start, $lte: end };
      }

      const report = await OrderModel.aggregate([
        {
          $match: matchCondition,
        },
        { $unwind: "$order_details" },
        {
          $lookup: {
            from: "products",
            localField: "order_details.product_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },
        {
          $group: {
            _id: "$order_details.product_id",
            product_name: { $first: "$product.product_name" },
            totalRevenue: {
              $sum: {
                $multiply: [
                  "$order_details.price_at_purchase",
                  "$order_details.quantity",
                ],
              },
            },
            totalSold: { $sum: "$order_details.quantity" },
          },
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: 10 },
      ]);

      return report;
    } catch (error) {
      throw error;
    }
  }

  renderReport = async (req, res) => {
    try {
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;

      const totalRevenue = await this.getRevenueReport({
        query: { startDate, endDate },
      });
      const topProducts = await this.getTopRevenueProducts({
        query: { startDate, endDate },
      });

      console.log(topProducts);

      res.render("report", {
        totalRevenue,
        topProducts,
        startDate,
        endDate,
      });
    } catch (error) {
      console.error("Error in renderReport:", error);
      res.status(500).send("Error loading report");
    }
  };
}

module.exports = new ReportController();
