const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");
// const authMiddleware = require("../middleware/auth.middleware");

// router.get("/", authMiddleware, UserController.getUserList);
// router.get("/:userId", authMiddleware, UserController.getUserDetails);
// router.patch(
//   "/:userId/status",
//   authMiddleware,
//   UserController.toggleUserStatus
// );

router.get("/", UserController.getUserList);
router.patch("/:userId/status", UserController.toggleUserStatus);
router.get("/:userId", UserController.getUserDetails);

module.exports = router;
