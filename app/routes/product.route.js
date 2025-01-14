const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/product.controller");

router.get("/", ProductController.loadProducts);
router.post("/", ProductController.createProduct);
router.patch("/:productId/status", ProductController.updateProductStatus);
router.put("/:productId", ProductController.updateProduct);

module.exports = router;
