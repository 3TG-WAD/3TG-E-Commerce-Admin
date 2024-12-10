const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const VariantSchema = new mongoose.Schema(
  {
    VariantID: {
      type: String,
      required: true,
      unique: true,
    },
    ProductID: {
      type: String,
      ref: "Product",
      required: true,
    },
    Color: {
      type: String,
      trim: true,
    },
    Material: {
      type: String,
      trim: true,
    },
    Price: {
      type: Number,
      required: true,
      min: 0,
    },
    Discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    IsAvailable: {
      type: Boolean,
      default: true,
    },
    InStock: {
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
