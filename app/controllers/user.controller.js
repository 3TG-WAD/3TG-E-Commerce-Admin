const { response } = require("express");
const ResponseHandler = require("../common/responseHandler");
const UserModel = require("../models/user.model");

class UserController {
  async getUserListUI(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        username,
        email,
        role,
        sortBy = "createdAt",
        sortOrder = "asc",
      } = req.query;

      const filter = {};

      if (username) filter.username = { $regex: username, $options: "i" };
      if (email) filter.email = { $regex: email, $options: "i" };
      if (role) filter.role = { $regex: role, $options: "i" };

      const order = sortOrder.toLowerCase() === "desc" ? -1 : 1;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: order },
        select: "-password",
      };

      const isAjaxRequest =
        req.xhr ||
        req.headers.accept.indexOf("application/json") > -1 ||
        req.get("X-Requested-With") === "XMLHttpRequest";

      const users = await UserModel.paginate(filter, options);

      if (isAjaxRequest) {
        return res.status(200).json({
          success: true,
          data: {
            users: users.docs.map((user) => ({
              _id: user._id,
              username: user.username,
              email: user.email,
              role: user.role,
              avatar: user.avatar || "/images/default-avatar.png",
              is_active: user.isActive,
            })),
            pagination: {
              currentPage: users.page,
              totalPages: users.totalPages,
              totalUsers: users.totalDocs,
            },
            filters: {
              username: username || "",
              email: email || "",
              role: role || "",
              sortBy: sortBy,
              sortOrder: sortOrder,
            },
          },
        });
      }

      res.render("user", {
        users: users.docs || [],
        totalPages: users.totalPages || 1,
        currentPage: users.page || 1,

        currentUsername: username,
        currentEmail: email,
        currentRole: role,
        currentSortBy: sortBy,
        currentSortOrder: sortOrder,
      });
    } catch (error) {
      console.error("Error fetching user list:", error);

      const isAjaxRequest =
        req.xhr ||
        req.headers.accept.indexOf("application/json") > -1 ||
        req.get("X-Requested-With") === "XMLHttpRequest";

      if (isAjaxRequest) {
        return res.status(500).json({
          success: false,
          message: "Error fetching user list",
          error: error.message,
        });
      }

      try {
        res.status(500).render("500", {
          message: "System Error",
          error: error.message,
        });
      } catch (renderError) {
        res.status(500).json({
          message: "System Error",
          error: error.message,
        });
      }
    }
  }

  async getUserDetails(req, res) {
    try {
      const { userId } = req.params;
      const user = await UserModel.findById(userId).select("-password");

      res.render("user-detail", { user });
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }

  async toggleUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const user = await UserModel.findById(userId).select("-password");

      if (!user) {
        return ResponseHandler.error(res, "User not found");
      }

      user.isActive = !user.isActive;
      await user.save({ validateBeforeSave: false });

      return ResponseHandler.success(res, user);
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }
}

module.exports = new UserController();
