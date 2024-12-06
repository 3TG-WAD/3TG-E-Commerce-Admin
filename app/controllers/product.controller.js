const ResponseHandler = require("../common/responseHandler");
const ProductModel = require("../models/product.model");
const validateProductInput = require("../utilities/validateProductInput");

class ProductController {
  // Danh sách sản phẩm với filter
  async getProductList(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        name,
        category,
        manufacturer,
        sortBy = "creation_time",
        sortOrder = "asc",
      } = req.query;

      const filter = {};
      if (name) filter.product_name = { $regex: name, $options: "i" };
      if (category) filter.category_id = { $regex: category, $options: "i" };
      if (manufacturer)
        filter.manufacturer_id = { $regex: manufacturer, $options: "i" };

      const sortDirection = sortOrder === "desc" ? -1 : 1;

      const products = await ProductModel.paginate(filter, {
        page,
        limit,
        sort: { [sortBy]: sortDirection },
      });

      return ResponseHandler.success(res, products);
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }

  // Tạo sản phẩm mới
  // async createProduct(req, res) {
  //   try {
  //     const productData = req.body;
  //     const photos = req.files; // Uploads từ middleware

  //     // Validate input
  //     const validatedData = validateProductInput(productData);

  //     const newProduct = await ProductModel.create({
  //       ...validatedData,
  //       photos: photos.map((file) => file.path),
  //     });

  //     return ResponseHandler.success(res, newProduct);
  //   } catch (error) {
  //     return ResponseHandler.error(res, error);
  //   }
  // }

  async createProduct(req, res) {
    try {
      const productData = req.body;

      // Validate input
      const validatedData = validateProductInput(productData);

      // Tạo sản phẩm mới
      const newProduct = await ProductModel.create({
        ...validatedData,
        photos: productData.photos, // Lưu trực tiếp từ req.body
      });

      return ResponseHandler.success(res, newProduct);
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }

  // Cập nhật sản phẩm
  async updateProduct(req, res) {
    try {
      const { productId } = req.params;
      const updateData = validateProductInput(req.body);

      const product = await ProductModel.findOne({ product_id: productId });
      if (!product) {
        return ResponseHandler.error(res, "Product not found");
      }

      product.set(updateData);

      if (updateData.photos && Array.isArray(updateData.photos)) {
        product.photos = updateData.photos;
      }

      await product.save();

      return ResponseHandler.success(res, product);
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }
}

module.exports = new ProductController();
