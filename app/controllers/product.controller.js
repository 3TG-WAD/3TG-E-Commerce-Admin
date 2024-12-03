const ResponseHandler = require("../common/responseHandler");
const ProductModel = require("../models/product.model");

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
        sortBy = "createdAt",
      } = req.query;

      const filter = {};
      if (name) filter.productName = { $regex: name, $options: "i" };
      if (category) filter.categoryID = category;
      if (manufacturer) filter.manufacturerID = manufacturer;

      const products = await ProductModel.paginate(filter, {
        page,
        limit,
        sort: { [sortBy]: 1 },
        populate: ["category", "manufacturer"],
      });

      return ResponseHandler.success(res, products);
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }

  // Tạo sản phẩm mới
  async createProduct(req, res) {
    try {
      const productData = req.body;
      const photos = req.files; // Uploads từ middleware

      // Validate input
      const validatedData = validateProductInput(productData);

      const newProduct = await ProductModel.create({
        ...validatedData,
        photos: photos.map((file) => file.path),
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
      const updateData = req.body;
      const photos = req.files;

      const product = await ProductModel.findById(productId);

      // Cập nhật thông tin
      product.set(updateData);

      // Xử lý ảnh
      if (photos && photos.length) {
        product.photos = [
          ...product.photos,
          ...photos.map((file) => file.path),
        ];
      }

      await product.save();

      return ResponseHandler.success(res, product);
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }
}
