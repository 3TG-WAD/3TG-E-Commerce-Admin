const Product = require("../models/product.model");
const Variant = require("../models/variant.model");
const mongoose = require("mongoose");

class ProductController {
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

      const matchStage = {};
      if (category) matchStage.category_id = category;
      if (manufacturer) matchStage.manufacturer_id = manufacturer;
      if (productName) {
        matchStage.product_name = {
          $regex: productName,
          $options: "i",
        };
      }

      const sortStages = {
        creation_time_desc: { creation_time: -1 },
        creation_time_asc: { creation_time: 1 },
        price_asc: { minPrice: 1 },
        price_desc: { minPrice: -1 },
      };

      const sortStage = sortStages[sort] || sortStages["creation_time_desc"];

      const aggregatePipeline = [
        { $match: matchStage },
        {
          $lookup: {
            from: "variants",
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

      const categories = await Product.distinct("category_id");
      const manufacturers = await Product.distinct("manufacturer_id");

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
      console.error("Product Listing Error:", error);
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
          .render("error", { message: "Product not found" });
      }

      const variant = await Variant.findOne({
        product_id: req.params.productId,
      });

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
      res.status(500).render("error", { message: "System error" });
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
        throw new Error("Product Id cannot be empty");
      }

      const photoLinks = photos
        ? photos
            .split("\n")
            .map((link) => link.trim())
            .filter((link) => link !== "")
        : [];
      
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
        message: "Create product successfully",
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

      if (!product) {
        return res
          .status(404)
          .render("error", { message: "Product not found" });
      }
      if (!variant) {
        return res
          .status(404)
          .render("error", { message: "Product not found" });
      }

      res.render("products/edit", { product, variant });
    } catch (error) {
      res.status(404).render("error", { message: "Product not found" });
    }
  }

  updateProduct = async (req, res) => {
    try {
      const { product_id, variant_id, photos, price, ...updateData } = req.body;

      console.log("Full Request Body:", req.body);

      const photoLinks = photos
        ? photos
            .split("\n")
            .map((link) => link.trim())
            .filter((link) => link !== "")
        : [];

      const updatedProduct = await Product.findOneAndUpdate(
        { product_id },
        {
          ...updateData,
          photos: photoLinks,
          creation_time: new Date(updateData.creation_time),
        },
        { new: true }
      );

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
        message: "Update product successfully",
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
        variant_id: `VAR-${product_id}-${color}`,
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

      if (req.xhr || req.headers.accept.includes("application/json")) {
        return res.status(500).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).render("error", { message: error.message });
    }
  }
}

module.exports = new ProductController();
