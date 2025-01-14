const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

// const ProductSchema = new mongoose.Schema(
//   {
//     product_id: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     product_name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       trim: true,
//     },
//     category_id: {
//       type: String,
//       ref: "Category",
//     },
//     price: {
//       type: Number,
//       required: true,
//     },
//     manufacturer_id: {
//       type: String,
//       ref: "Manufacturer",
//     },
//     creation_time: {
//       type: Date,
//       default: Date.now,
//     },
//     specifications: mongoose.Schema.Types.Mixed,
//     photos: [
//       {
//         type: String,
//         validate: {
//           validator: function (v) {
//             return /^https?:\/\/.+/.test(v);
//           },
//           message: (props) => `${props.value} is not a valid URL!`,
//         },
//       },
//     ],
//     status: {
//       type: String,
//       enum: ["active", "inactive", "out_of_stock"], // Các giá trị hợp lệ
//       default: "active", // Giá trị mặc định
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

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
