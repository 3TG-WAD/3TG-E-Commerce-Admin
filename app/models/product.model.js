const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const ProductSchema = new mongoose.Schema(
  {
    ProductID: {
      type: String,
      required: true,
      unique: true,
    },
    ProductName: {
      type: String,
      required: true,
      trim: true,
    },
    Description: {
      type: String,
      trim: true,
    },
    CategoryID: {
      type: String,
      ref: "Category",
    },
    ManufacturerID: {
      type: String,
      ref: "Manufacturer",
    },
    CreationTime: {
      type: Date,
      default: Date.now,
    },
    Specifications: {
      Length: String,
      Width: String,
      Origin: String,
    },
    Photos: [
      {
        type: String,
        validate: {
          validator: function (v) {
            return /^https?:\/\/.+/.test(v);
          },
          message: (props) => `${props.value} is not a valid URL!`,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

ProductSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Product", ProductSchema);
