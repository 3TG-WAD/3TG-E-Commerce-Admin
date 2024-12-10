const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const OrderSchema = new mongoose.Schema(
  {
    OrderID: {
      type: String,
      required: true,
      unique: true,
    },
    UserID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    Buyer: {
      Name: {
        type: String,
        required: true,
      },
      Phone: {
        type: String,
        required: true,
      },
    },
    TotalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    OrderDetails: [
      {
        ProductID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        VariantID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Variant",
          required: true,
        },
        Quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        PriceAtPurchase: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    Status: {
      type: String,
      enum: ["Pending", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    OrderAddress: {
      Street: String,
      City: String,
      Country: String,
      PostalCode: String,
    },
    OrderShippingCost: {
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
  this.Status = newStatus;
  return this.save();
};

OrderSchema.methods.calculateTotalAmount = function () {
  return this.OrderDetails.reduce(
    (total, item) => total + item.Quantity * item.PriceAtPurchase,
    this.OrderShippingCost
  );
};

module.exports = mongoose.model("Order", OrderSchema);
