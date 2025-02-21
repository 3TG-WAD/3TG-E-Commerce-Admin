const ResponseHandler = require("../common/responseHandler");
const ProductModel = require("../models/product.model");
const validateProductInput = require("../utilities/validateProductInput");

class ProductController {
  async loadProducts(req, res) {
    try {
      const {
        page = 1,
        limit = 9,
        name,
        category,
        manufacturer,
        sortBy = "creation_time",
        sortOrder = "asc",
      } = req.query;

      const filter = {};
      if (name) filter.product_name = { $regex: name, $options: "i" };
      if (category) filter.category_id = category;
      if (manufacturer) filter.manufacturer_id = manufacturer;

      const sortDirection = sortOrder === "desc" ? -1 : 1;

      const products = await ProductModel.paginate(filter, {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sortBy]: sortDirection },
        select: "product_name category_id manufacturer_id price photos status",
      });

      if (req.xhr || req.headers.accept.indexOf("json") > -1) {
        return res.json({
          products: products.docs || [],
          totalPages: products.totalPages || 1,
          currentPage: products.page || 1,
        });
      }

      res.render("product", {
        products: products.docs || [],
        totalPages: products.totalPages || 1,
        currentPage: products.page || 1,

        currentName: name,
        currentCategory: category,
        currentManufacturer: manufacturer,
        currentSortBy: sortBy,
        currentSortOrder: sortOrder,
        getStatusClass: (status) => {
          const statusClasses = {
            Active: "badge-success",
            Inactive: "badge-danger",
          };
          return statusClasses[status] || "badge-secondary";
        },
      });
    } catch (error) {
      console.error("Lỗi render trang sản phẩm:", error);

      try {
        res.status(500).render("500", {
          message: "Lỗi hệ thống",
          error: error.message,
        });
      } catch (renderError) {
        res.status(500).json({
          message: "Lỗi hệ thống",
          error: error.message,
        });
      }
    }
  }

  async createProduct(req, res) {
    try {
      const productData = req.body;
      console.log(productData);

      const validatedData = validateProductInput(productData);

      const newProduct = await ProductModel.create({
        ...validatedData,
        photos: productData.photos,
      });

      return ResponseHandler.success(res, newProduct);
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }

  async updateProduct(req, res) {
    try {
      const { productId } = req.params;
      const updateData = req.body;

      const product = await ProductModel.findById(productId);
      if (!product) {
        return ResponseHandler.error(res, "Product not found");
      }

      if (updateData.product_name)
        product.product_name = updateData.product_name;
      if (updateData.category_id) product.category_id = updateData.category_id;
      if (updateData.manufacturer_id)
        product.manufacturer_id = updateData.manufacturer_id;
      if (updateData.description !== "")
        product.description = updateData.description;
      console.log(product.description);
      console.log(updateData.description);
      if (updateData.status) product.status = updateData.status;

      if (updateData.photos && updateData.photos.length > 0) {
        product.photos = updateData.photos;
      }

      if (updateData.price) product.price = updateData.price;

      await product.save();

      return ResponseHandler.success(res, product);
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }

  async updateProductStatus(req, res) {
    try {
      const { productId } = req.params;
      const { status } = req.body;

      const validStatuses = ["active", "inactive", "out_of_stock"];
      if (!validStatuses.includes(status)) {
        return ResponseHandler.error(res, "Invalid status");
      }

      const product = await ProductModel.findById(productId);

      if (!product) {
        return ResponseHandler.error(res, "Product not found");
      }

      product.status = status;
      await product.save();

      return ResponseHandler.success(res, product);
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }
}

module.exports = new ProductController();
