const ResponseHandler = require("../common/responseHandler");
const UserModel = require("../models/user.model");

class UserController {
  // Danh sách người dùng với filter và phân trang
  async getUserList(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        username,
        email,
        sortBy = "createdAt",
        sortOrder = "asc", // Mặc định là tăng dần
      } = req.query;

      const filter = {};
      if (username) filter.username = { $regex: username, $options: "i" };
      if (email) filter.email = { $regex: email, $options: "i" };

      console.log("Filter: ", filter);

      // Xác định thứ tự sắp xếp
      const order = sortOrder.toLowerCase() === "desc" ? -1 : 1;

      // Thực hiện phân trang và sắp xếp
      const users = await UserModel.paginate(filter, {
        page,
        limit,
        sort: { [sortBy]: order },
        select: "-password", // Không trả về password
      });

      return ResponseHandler.success(res, users);
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }

  // Chi tiết người dùng
  async getUserDetails(req, res) {
    try {
      const { userId } = req.params;
      const user = await UserModel.findOne({
        user_id: userId, // Sử dụng user_id thay vì UserID
      }).select("-password"); // Không trả về password
      return ResponseHandler.success(res, user);
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }

  // Khóa/mở khóa tài khoản
  async toggleUserStatus(req, res) {
    try {
      const { userId } = req.params;
      const user = await UserModel.findOne({
        user_id: userId, // Sử dụng user_id thay vì UserID
      }).select("-password"); // Không trả về password

      if (!user) {
        return ResponseHandler.error(res, "User not found");
      }

      // Tắt/mở khóa tài khoản
      user.is_active = !user.is_active; // Sử dụng is_active thay vì isActive
      await user.save();

      return ResponseHandler.success(res, user);
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }
}

module.exports = new UserController();
