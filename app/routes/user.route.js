const express = require("express");
const router = express.Router();
const UserController = require("../controllers/user.controller");

router.get("/", UserController.getUserListUI);
router.patch("/:userId/status", UserController.toggleUserStatus);
router.get("/:userId", UserController.getUserDetails);

module.exports = router;
