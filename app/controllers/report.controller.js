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
        matchCondition.created_at = { $gte: start, $lte: end };
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
      return totalRevenue;
    } catch (error) {
      throw error;
    }
  }

  async getTopRevenueProducts(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let matchCondition = {};
      if (startDate && endDate) {
        const start = moment(startDate).startOf("day").toDate();
        const end = moment(endDate).endOf("day").toDate();
        matchCondition.created_at = { $gte: start, $lte: end };
      }

      const report = await OrderModel.aggregate([
        {
          $match: matchCondition,
        },
        { $unwind: "$items" }, // Thay đổi từ $unwind: "$order_details"
        {
          $group: {
            _id: "$items.product_id",
            product_name: { $first: "$items.product_name" },
            totalRevenue: {
              $sum: {
                $multiply: ["$items.price", "$items.quantity"],
              },
            },
            totalSold: { $sum: "$items.quantity" },
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
