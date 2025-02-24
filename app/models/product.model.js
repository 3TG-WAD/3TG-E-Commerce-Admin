const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ProductSchema = new mongoose.Schema({
  product_id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  product_name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category_id: {
    type: String,
    required: true,
    trim: true,
    ref: "Category",
  },
  manufacturer_id: {
    type: String,
    required: true,
    trim: true,
  },
  creation_time: {
    type: Date,
    required: true,
  },
  specifications: mongoose.Schema.Types.Mixed,
  photos: [{ type: String }],
});

ProductSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Product", ProductSchema);
