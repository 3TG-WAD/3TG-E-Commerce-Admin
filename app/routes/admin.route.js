const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/admin.controller");
// const authMiddleware = require("../middleware/auth.middleware");

// router.put("/profile", authMiddleware, AdminController.updateProfile);
router.put("/profile", AdminController.updateProfile);

module.exports = router;
