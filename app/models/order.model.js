const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const OrderSchema = new mongoose.Schema(
  {
    order_id: {
      type: String,
      required: true,
      unique: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyer: {
      Name: {
        type: String,
        required: true,
      },
      Phone: {
        type: String,
        required: true,
      },
    },
    total_amount: {
      type: Number,
      required: true,
      min: 0,
    },
    order_details: [
      {
        product_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variant_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Variant",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price_at_purchase: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    shipping_address: {
      type: String,
      required: true,
    },
    order_address: {
      Street: String,
      City: String,
      Country: String,
      PostalCode: String,
    },
    order_shipping_cost: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.plugin(mongoosePaginate);

OrderSchema.methods.updateStatus = function (newStatus) {
  this.status = newStatus;
  return this.save();
};

OrderSchema.methods.calculateTotalAmount = function () {
  return this.order_details.reduce(
    (total, item) => total + item.quantity * item.price_at_purchase,
    this.order_shipping_cost
  );
};

module.exports = mongoose.model("Order", OrderSchema);
