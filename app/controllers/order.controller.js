const ResponseHandler = require("../common/responseHandler");
const OrderModel = require("../models/order.model");
const VariantModel = require("../models/variant.model");
const ProductModel = require("../models/product.model");

class OrderController {
  async getOrderListUI(req, res) {
    try {
      const { page = 1, limit = 10, status } = req.query;

      const filter = {};
      if (status) filter.status = status;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: [{ path: "user_id", select: "username" }],
      };

      const isAjaxRequest =
        req.xhr ||
        req.headers.accept.indexOf("application/json") > -1 ||
        req.get("X-Requested-With") === "XMLHttpRequest";

      const orders = await OrderModel.paginate(filter, options);

      if (isAjaxRequest) {
        return res.status(200).json({
          success: true,
          data: {
            orders: orders.docs.map((order) => ({
              _id: order._id,
              order_id: order.order_id,
              buyer: order.buyer,
              total_amount: order.total_amount,
              status: order.status,
              items: order.items.map((item) => ({
                product_name: item.product_name,
                color: item.color,
                price: item.price,
                quantity: item.quantity,
              })),
            })),
            pagination: {
              currentPage: orders.page,
              totalPages: orders.totalPages,
              totalOrders: orders.totalDocs,
            },
            filters: {
              status: status || "",
            },
          },
        });
      }

      res.render("order", {
        orders: orders.docs,
        totalPages: orders.totalPages,
        currentPage: orders.page,
        currentStatus: status,
        formatCurrency: (amount) => {
          return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(amount);
        },
        getStatusClass: (status) => {
          const statusClasses = {
            Pending: "badge-warning",
            Shipped: "badge-info",
            Delivered: "badge-success",
            Cancelled: "badge-danger",
          };
          return statusClasses[status] || "badge-secondary";
        },
      });
    } catch (error) {
      console.error("Error fetching orders:", error);

      const isAjaxRequest =
        req.xhr ||
        req.headers.accept.indexOf("application/json") > -1 ||
        req.get("X-Requested-With") === "XMLHttpRequest";

      if (isAjaxRequest) {
        return res.status(500).json({
          success: false,
          message: "Error fetching orders",
          error: error.message,
        });
      }

      res.status(500).render("500", {
        message: "System Error",
        error: error.message,
      });
    }
  }

  async renderOrderPage(req, res) {
    try {
      const totalOrders = await OrderModel.countDocuments();

      const totalRevenue = await OrderModel.aggregate([
        { $group: { _id: null, total: { $sum: "$total_amount" } } },
      ]);

      const { page = 1, status } = req.query;

      const filter = {};
      if (status) filter.status = status;

      console.log("Filter:", filter);

      const options = {
        page: Number(page),
        limit: 10,
        sort: { createdAt: -1 },
        populate: ["user_id"],
      };

      const recentOrders = await new Promise((resolve, reject) => {
        OrderModel.paginate(filter, options)
          .then((result) => {
            console.log("Result of paginate:", result);
            resolve(result);
          })
          .catch((error) => {
            console.error("Error paginate:", error);
            reject(error);
          });
      });

      if (!recentOrders || recentOrders.docs.length === 0) {
        return res.render("dashboard", {
          totalOrders: 0,
          totalRevenue: 0,
          recentOrders: [],
          currentPage: 1,
          totalPages: 1,
          currentStatus: status,
          formatCurrency: (amount) =>
            new Intl.NumberFormat("vi-VN", {
              style: "currency",
              currency: "VND",
            }).format(amount || 0),
          getStatusClass: () => "badge-secondary",
        });
      }

      // Render bình thường
      res.render("dashboard", {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders: recentOrders.docs,
        currentPage: recentOrders.page,
        totalPages: recentOrders.totalPages,
        currentStatus: status,
        formatCurrency: (amount) =>
          new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(amount || 0),
        getStatusClass: (status) => {
          const statusClasses = {
            Pending: "badge-warning",
            Processing: "badge-info",
            Shipped: "badge-primary",
            Delivered: "badge-success",
            Cancelled: "badge-danger",
          };
          return statusClasses[status] || "badge-secondary";
        },
      });
    } catch (error) {
      console.error("Chi tiết lỗi render dashboard:", error);

      // Render trang lỗi chi tiết
      res.status(500).render("error", {
        message: "Lỗi tải trang dashboard",
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
      });
    }
  }

  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;

      // Tìm theo order_id
      const order = await OrderModel.findOne({ order_id: orderId });

      if (!order) {
        return ResponseHandler.notFound(res, "Đơn hàng không tồn tại");
      }

      // Validate trạng thái
      const validStatuses = [
        "pending",
        "processing",
        "shipping",
        "completed",
        "cancelled",
      ];

      if (!validStatuses.includes(status)) {
        return ResponseHandler.badRequest(res, "Trạng thái không hợp lệ");
      }

      order.status = status;
      await order.save();

      return ResponseHandler.success(res, order);
    } catch (error) {
      console.error("Update order status error:", error);
      return ResponseHandler.error(res, "Lỗi cập nhật trạng thái đơn hàng");
    }
  }

  async getOrderDetailsUI(req, res) {
    try {
      const { orderId } = req.params;

      const order = await OrderModel.findOne({ order_id: orderId })
        .populate({
          path: "user_id",
          select: "username email phone",
        })
        .populate({
          path: "items.product_id",
          select: "product_name product_code",
        });

      if (!order) {
        return res.status(404).render("error", {
          message: "Đơn hàng không tồn tại",
        });
      }

      res.render("order-detail", {
        order,
        formatCurrency: (amount) => {
          return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(amount);
        },
      });
    } catch (error) {
      console.error("Get order details error:", error);
      res.status(500).render("error", {
        message: "Lỗi truy xuất chi tiết đơn hàng",
      });
    }
  }
}

module.exports = new OrderController();
