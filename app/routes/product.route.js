const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller");
// const authMiddleware = require("../middleware/auth.middleware");
// const uploadMiddleware = require("../middleware/upload.middleware");

// router.get("/", authMiddleware, ProductController.getProductList);
// router.post(
//   "/",
//   authMiddleware,
//   uploadMiddleware.array("photos"),
//   ProductController.createProduct
// );
// router.put(
//   "/:productId",
//   authMiddleware,
//   uploadMiddleware.array("photos"),
//   ProductController.updateProduct
// );

router.get("/", ProductController.getProductList);
router.post("/", ProductController.createProduct);
router.put("/:productId", ProductController.updateProduct);

module.exports = router;
