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

  // async createProduct(req, res) {
  //   const session = await mongoose.startSession();
  //   session.startTransaction();

  //   try {
  //     const {
  //       product_name,
  //       description,
  //       category_id,
  //       manufacturer_id,
  //       specifications,
  //       photos,
  //       variants,
  //     } = req.body;

  //     // Tạo product
  //     const newProduct = await ProductModel.create(
  //       [
  //         {
  //           product_id: `PROD-${Date.now()}`,
  //           product_name,
  //           description,
  //           category_id,
  //           manufacturer_id,
  //           creation_time: new Date(),
  //           specifications,
  //           photos,
  //           variants: [], // Khởi tạo mảng variants rỗng
  //         },
  //       ],
  //       { session }
  //     );

  //     // Tạo variants
  //     if (variants && variants.length > 0) {
  //       const productVariants = variants.map((variant) => ({
  //         variant_id: `VAR-${Date.now()}-${Math.random()
  //           .toString(36)
  //           .substr(2, 9)}`,
  //         product_id: newProduct[0].product_id,
  //         color: variant.color,
  //         material: variant.material,
  //         price: variant.price,
  //         discount: variant.discount || 0,
  //         in_stock: variant.in_stock || 0,
  //       }));

  //       // Tạo variants
  //       const createdVariants = await VariantModel.create(productVariants, {
  //         session,
  //       });

  //       // Cập nhật variants cho product
  //       await ProductModel.findOneAndUpdate(
  //         { product_id: newProduct[0].product_id },
  //         {
  //           variants: createdVariants.map((variant) => variant.variant_id),
  //         },
  //         { session }
  //       );
  //     }

  //     await session.commitTransaction();
  //     session.endSession();

  //     return ResponseHandler.success(res, {
  //       product: newProduct[0],
  //       variants: createdVariants,
  //     });
  //   } catch (error) {
  //     await session.abortTransaction();
  //     session.endSession();
  //     return ResponseHandler.error(res, error);
  //   }
  // }

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

  // async updateProduct(req, res) {
  //   const session = await mongoose.startSession();
  //   session.startTransaction();

  //   try {
  //     const { productId } = req.params;
  //     const {
  //       product_name,
  //       description,
  //       category_id,
  //       manufacturer_id,
  //       specifications,
  //       photos,
  //       variants,
  //     } = req.body;

  //     // Tìm product
  //     const product = await ProductModel.findOne({
  //       product_id: productId,
  //     }).session(session);
  //     if (!product) {
  //       throw new Error("Product not found");
  //     }

  //     // Cập nhật thông tin product
  //     product.product_name = product_name || product.product_name;
  //     product.description = description || product.description;
  //     product.category_id = category_id || product.category_id;
  //     product.manufacturer_id = manufacturer_id || product.manufacturer_id;
  //     product.specifications = specifications || product.specifications;
  //     product.photos = photos || product.photos;

  //     await product.save({ session });

  //     // Cập nhật variants
  //     if (variants && variants.length > 0) {
  //       const variantUpdates = variants.map(async (variantData) => {
  //         if (variantData.variant_id) {
  //           // Cập nhật variant hiện tại
  //           return VariantModel.findOneAndUpdate(
  //             { variant_id: variantData.variant_id },
  //             {
  //               color: variantData.color,
  //               material: variantData.material,
  //               price: variantData.price,
  //               discount: variantData.discount || 0,
  //               in_stock: variantData.in_stock || 0,
  //             },
  //             { session }
  //           );
  //         } else {
  //           // Tạo variant mới
  //           return VariantModel.create(
  //             [
  //               {
  //                 variant_id: `VAR-${Date.now()}-${Math.random()
  //                   .toString(36)
  //                   .substr(2, 9)}`,
  //                 product_id: product.product_id,
  //                 color: variantData.color,
  //                 material: variantData.material,
  //                 price: variantData.price,
  //                 discount: variantData.discount || 0,
  //                 in_stock: variantData.in_stock || 0,
  //               },
  //             ],
  //             { session }
  //           );
  //         }
  //       });

  //       const createdVariants = await Promise.all(variantUpdates);

  //       // Cập nhật mảng variants của product
  //       product.variants = createdVariants.map(
  //         (v) =>
  //           v.variant_id || (Array.isArray(v) ? v[0].variant_id : v.variant_id)
  //       );
  //       await product.save({ session });
  //     }

  //     await session.commitTransaction();
  //     session.endSession();

  //     return ResponseHandler.success(res, { product });
  //   } catch (error) {
  //     await session.abortTransaction();
  //     session.endSession();
  //     return ResponseHandler.error(res, error);
  //   }
  // }
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
