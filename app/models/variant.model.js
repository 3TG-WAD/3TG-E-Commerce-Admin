const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const VariantSchema = new mongoose.Schema(
  {
    variant_id: {
      type: String,
      required: true,
      unique: true,
    },
    product_id: {
      type: String,
      ref: "Product",
      required: true,
    },
    color: {
      type: String,
      trim: true,
    },
    material: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    is_available: {
      type: Boolean,
      default: true,
    },
    in_stock: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

VariantSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Variant", VariantSchema);
