const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/variant.controller");

router.get("/", ProductController.getProductList);
router.get("/detail/:productId", ProductController.getProductDetail);
router.get("/create", ProductController.getCreateProductForm);

router.get("/edit/:productId", ProductController.getEditProductForm);

router.get("/variants/:productId", ProductController.getProductVariants);

router.post("/create", ProductController.createProduct);
router.put("/edit/:productId", ProductController.updateProduct);

router.post("/variants/update", ProductController.updateVariant);

router.put("/toggle-availability", ProductController.toggleVariantAvailability);

module.exports = router;
