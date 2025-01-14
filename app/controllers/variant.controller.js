const Product = require("../models/product.model");
const Variant = require("../models/variant.model");
const mongoose = require("mongoose");

class ProductController {
  // async getProductList(req, res) {
  //   try {
  //     const {
  //       page = 1,
  //       limit = 10,
  //       category,
  //       manufacturer,
  //       productName,
  //       sort = "creation_time_desc",
  //     } = req.query;

  //     // Xây dựng query động
  //     const query = {};

  //     // Filter theo danh mục
  //     if (category) {
  //       query.category_id = category;
  //     }

  //     // Filter theo nhà sản xuất
  //     if (manufacturer) {
  //       query.manufacturer_id = manufacturer;
  //     }

  //     // Tìm kiếm theo tên sản phẩm
  //     if (productName) {
  //       query.product_name = {
  //         $regex: productName,
  //         $options: "i", // Case-insensitive
  //       };
  //     }

  //     // Xây dựng logic sắp xếp
  //     const sortOptions = {
  //       creation_time_desc: { creation_time: -1 },
  //       creation_time_asc: { creation_time: 1 },
  //       price_asc: { price: 1 },
  //       price_desc: { price: -1 },
  //     };

  //     const selectedSort =
  //       sortOptions[sort] || sortOptions["creation_time_desc"];

  //     // Cấu hình phân trang
  //     const options = {
  //       page: parseInt(page),
  //       limit: parseInt(limit),
  //       sort: selectedSort,
  //     };

  //     // Truy vấn sản phẩm
  //     const products = await Product.paginate(query, options);

  //     // Lấy các giá trị duy nhất của category_id và manufacturer_id
  //     const categories = await Product.distinct("category_id");
  //     const manufacturers = await Product.distinct("manufacturer_id");

  //     // Kiểm tra xem request có phải AJAX không
  //     if (req.xhr || req.headers.accept.includes("application/json")) {
  //       return res.json({
  //         products: products.docs,
  //         totalPages: products.totalPages,
  //         currentPage: products.page,
  //         total: products.total,
  //         categories,
  //         manufacturers,
  //       });
  //     }

  //     // Render trang nếu không phải AJAX
  //     res.render("products/list", {
  //       products: products.docs,
  //       categories,
  //       manufacturers,
  //       pagination: {
  //         totalPages: products.totalPages,
  //         currentPage: products.page,
  //         total: products.total,
  //       },
  //     });
  //   } catch (error) {
  //     console.error("Product List Error:", error);

  //     // Xử lý lỗi cho cả AJAX và non-AJAX
  //     if (req.xhr || req.headers.accept.includes("application/json")) {
  //       return res.status(500).json({
  //         success: false,
  //         message: error.message,
  //       });
  //     }

  //     // Render trang lỗi nếu không phải AJAX
  //     res.status(500).json({
  //       success: false,
  //       message: error.message,
  //     });
  //   }
  // }

  async getProductList(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        manufacturer,
        productName,
        sort = "creation_time_desc",
      } = req.query;

      // Xây dựng match stage
      const matchStage = {};
      if (category) matchStage.category_id = category;
      if (manufacturer) matchStage.manufacturer_id = manufacturer;
      if (productName) {
        matchStage.product_name = {
          $regex: productName,
          $options: "i",
        };
      }

      // Xây dựng sort stage
      const sortStages = {
        creation_time_desc: { creation_time: -1 },
        creation_time_asc: { creation_time: 1 },
        price_asc: { minPrice: 1 },
        price_desc: { minPrice: -1 },
      };

      const sortStage = sortStages[sort] || sortStages["creation_time_desc"];

      // Aggregate pipeline
      const aggregatePipeline = [
        { $match: matchStage },
        {
          $lookup: {
            from: "variants", // Collection name của variants
            localField: "product_id",
            foreignField: "product_id",
            as: "variants",
          },
        },
        {
          $addFields: {
            minPrice: { $min: "$variants.price" },
          },
        },
        { $sort: sortStage },
      ];

      // Phân trang thủ công
      const skip = (page - 1) * limit;

      const [results, total] = await Promise.all([
        Product.aggregate([
          ...aggregatePipeline,
          { $skip: skip },
          { $limit: parseInt(limit) },
        ]),
        Product.aggregate([...aggregatePipeline, { $count: "total" }]),
      ]);

      const totalPages = Math.ceil(total[0]?.total / limit);

      // Lấy các giá trị duy nhất
      const categories = await Product.distinct("category_id");
      const manufacturers = await Product.distinct("manufacturer_id");

      // Trả về kết quả
      if (req.xhr || req.headers.accept.includes("application/json")) {
        return res.json({
          products: results,
          totalPages,
          currentPage: page,
          total: total[0]?.total,
          categories,
          manufacturers,
        });
      }

      // Render trang
      res.render("products/list", {
        products: results,
        categories,
        manufacturers,
        pagination: {
          totalPages,
          currentPage: page,
          total: total[0]?.total,
        },
      });
    } catch (error) {
      console.error("Product List Error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getProductDetail(req, res) {
    try {
      const product = await Product.findOne({
        product_id: req.params.productId,
      });

      if (!product) {
        return res
          .status(404)
          .render("error", { message: "Sản phẩm không tồn tại" });
      }

      const variant = await Variant.findOne({
        product_id: req.params.productId,
      });

      // Tạo một bản sao an toàn của product
      const safeProduct = {
        ...product.toObject(),
        price: variant?.price || product.price || 0,
        photos: product.photos || [],
        description: product.description || "",
        specifications: product.specifications || {},
      };

      res.render("products/detail", {
        product: safeProduct,
        variant,
      });
    } catch (error) {
      console.error(error);
      res.status(500).render("error", { message: "Lỗi hệ thống" });
    }
  }

  getCreateProductForm(req, res) {
    res.render("products/create");
  }

  async createProduct(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      console.log("Full Request Body:", req.body);
      const {
        product_id,
        product_name,
        description,
        category_id,
        manufacturer_id,
        price,
        creation_time,
        specifications,
        photos,
        ...variantData
      } = req.body;

      if (!product_id) {
        throw new Error("Mã sản phẩm không được để trống");
      }

      const photoLinks = photos
        ? photos
            .split("\n")
            .map((link) => link.trim())
            .filter((link) => link !== "")
        : [];
      // Create product
      const newProduct = new Product({
        product_id,
        product_name,
        description,
        category_id,
        manufacturer_id,
        creation_time: new Date(creation_time),
        specifications,
        photos: photoLinks,
      });

      console.log(newProduct);

      // Create variant
      const newVariant = new Variant({
        variant_id: `VAR-${product_id}`,
        product_id: product_id,
        color: variantData.color,
        material: variantData.material,
        price: Number(price),
        discount: Number(variantData.discount) || 0,
        in_stock: Number(variantData.in_stock) || 0,
      });

      console.log(newVariant);

      await newProduct.validate();
      await newVariant.validate();
      console.log("Validate success");
      // Save both
      const savedProduct = await newProduct.save();
      console.log("Saved Product:", savedProduct);

      const savedVariant = await newVariant.save();
      console.log("Saved Variant:", savedVariant);

      await session.commitTransaction();
      session.endSession();

      return res.json({
        success: true,
        message: "Tạo sản phẩm thành công",
        redirectUrl: "/api/variants",
      });
    } catch (error) {
      if (!session.transaction.isCommitted) {
        await session.abortTransaction();
      }

      session.endSession();

      res.status(400).render("products/create", {
        error: error.message,
        product: req.body,
      });
    }
  }

  async getEditProductForm(req, res) {
    try {
      const product = await Product.findOne({
        product_id: req.params.productId,
      });
      const variant = await Variant.findOne({
        product_id: req.params.productId,
      });
      res.render("products/edit", { product, variant });
    } catch (error) {
      res.status(404).render("error", { message: "Sản phẩm không tồn tại" });
    }
  }

  // updateProduct = async (req, res) => {
  //   const session = await mongoose.startSession();
  //   session.startTransaction();

  //   try {
  //     const { product_id, photos, ...updateData } = req.body;

  //     // Cập nhật product
  //     await Product.findOneAndUpdate(
  //       { product_id },
  //       {
  //         ...updateData,
  //         photos: Array.isArray(photos) ? photos : [photos],
  //       },
  //       { session }
  //     );

  //     // Cập nhật variant
  //     await Variant.findOneAndUpdate({ product_id }, updateData, { session });
  //     console.log("Updated variant");
  //     await session.commitTransaction();
  //     session.endSession();

  //     res.redirect("/api/variants");
  //   } catch (error) {
  //     await session.abortTransaction();
  //     session.endSession();

  //     res.status(400).render("products/edit", {
  //       error: error.message,
  //       product: req.body,
  //     });
  //   }
  // };

  updateProduct = async (req, res) => {
    try {
      const { product_id, variant_id, photos, price, ...updateData } = req.body;

      console.log("Full Request Body:", req.body);

      // Xử lý ảnh - loại bỏ khoảng trắng thừa
      const photoLinks = photos
        ? photos
            .split("\n")
            .map((link) => link.trim())
            .filter((link) => link !== "")
        : [];

      // Cập nhật product
      const updatedProduct = await Product.findOneAndUpdate(
        { product_id },
        {
          ...updateData,
          photos: photoLinks,
          creation_time: new Date(updateData.creation_time),
        },
        { new: true }
      );

      // Cập nhật variant
      const updatedVariant = await Variant.findOneAndUpdate(
        { product_id },
        {
          color: updateData.color,
          material: updateData.material,
          price: Number(price),
          in_stock: Number(updateData.in_stock) || 0,
          discount: Number(updateData.discount) || 0,
        },
        { new: true }
      );

      return res.json({
        success: true,
        message: "Cập nhật sản phẩm thành công",
        redirectUrl: "/api/variants",
      });
    } catch (error) {
      console.error("Update Product Error:", error);

      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  async getProductVariants(req, res) {
    try {
      const variants = await Variant.find({ product_id: req.params.productId });
      res.render("products/variants", { variants });
    } catch (error) {
      res.status(500).render("error", { message: error.message });
    }
  }

  async createVariant(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { product_id, color, material, price, discount, in_stock } =
        req.body;

      const newVariant = new Variant({
        variant_id: `VAR-${product_id}-${color}`, // Unique variant ID based on product and color
        product_id,
        color,
        material,
        price,
        discount,
        in_stock,
      });

      await newVariant.save({ session });
      await session.commitTransaction();
      session.endSession();

      res.redirect(`/products/variants/${product_id}`);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      res.status(400).render("products/variants", {
        error: error.message,
        product_id: req.body.product_id,
      });
    }
  }

  async updateVariant(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { variant_id, color, material, price, discount, in_stock } =
        req.body;

      const variantData = {
        color,
        material,
        price,
        discount,
        in_stock,
      };

      await Variant.findOneAndUpdate({ variant_id }, variantData, { session });

      await session.commitTransaction();
      session.endSession();

      res.redirect(`/products/variants/${req.body.product_id}`);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();

      res.status(400).render("products/variants", {
        error: error.message,
        product_id: req.body.product_id,
      });
    }
  }

  async toggleVariantAvailability(req, res) {
    console.log("Full Request Body:", req.body);
    console.log("Request Headers:", req.headers);
    try {
      const { variant_id } = req.body;
      console.log("Hello", variant_id);

      const variant = await Variant.findOne({ product_id: variant_id });

      if (!variant) {
        return res.status(404).json({
          success: false,
          message: "Variant not found",
        });
      }

      variant.is_available = !variant.is_available;
      await variant.save();

      return res.status(200).json({
        success: true,
        message: "Status updated successfully",
        is_available: variant.is_available,
      });
    } catch (error) {
      console.error(error);

      // Kiểm tra nếu là request AJAX
      if (req.xhr || req.headers.accept.includes("application/json")) {
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }

      // Nếu không phải AJAX thì render error
      res.status(500).render("error", { message: error.message });
    }
  }
}

module.exports = new ProductController();
