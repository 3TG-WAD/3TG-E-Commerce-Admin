const ResponseHandler = require("../common/responseHandler");
const UserModel = require("../models/user.model");

class AdminController {
  async updateProfile(req, res) {
    try {
      const { userId } = req.user;
      const updateData = req.body;

      // Validate input
      const validatedData = validateAdminProfile(updateData);

      const updatedProfile = await UserModel.findByIdAndUpdate(
        userId,
        validatedData,
        { new: true }
      );

      return ResponseHandler.success(res, updatedProfile);
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }
}
