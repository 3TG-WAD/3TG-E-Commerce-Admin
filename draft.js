const mongoose = require("mongoose");
const OrderModel = require("./app/models/order.model");
const UserModel = require("./app/models/user.model");
const ProductModel = require("./app/models/product.model");
const VariantModel = require("./app/models/variant.model");

mongoose
  .connect("mongodb://localhost:27017/ecommerce")
  .then(() => {
    console.log("Connected to the database!");
    createOrders();
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });

async function createOrders() {
  try {
    // Lấy các user, product, variant thực tế từ database
    const users = await UserModel.find({});
    const products = await ProductModel.find({});
    const variants = await VariantModel.find({});

    const orders = [
      {
        order_id: "ORDER-001",
        user_id: users[0]._id, // User đầu tiên
        buyer: {
          Name: users[0].username,
          Phone: "0987654321",
        },
        total_amount: variants[0].price * 2,
        order_details: [
          {
            product_id: products[0]._id,
            variant_id: variants[0]._id,
            quantity: 2,
            price_at_purchase: variants[0].price,
          },
        ],
        status: "Pending",
        order_address: {
          Street: users[0].address.street,
          City: users[0].address.city,
          Country: users[0].address.country,
          PostalCode: users[0].address.postal_code,
        },
        order_shipping_cost: 50000,
      },
      {
        order_id: "ORDER-002",
        user_id: users[1]._id, // User thứ hai
        buyer: {
          Name: users[1].username,
          Phone: "0123456789",
        },
        total_amount: variants[1].price,
        order_details: [
          {
            product_id: products[1]._id,
            variant_id: variants[1]._id,
            quantity: 1,
            price_at_purchase: variants[1].price,
          },
        ],
        status: "Shipped",
        order_address: {
          Street: users[1].address.street,
          City: users[1].address.city,
          Country: users[1].address.country,
          PostalCode: users[1].address.postal_code,
        },
        order_shipping_cost: 200000,
      },
      {
        order_id: "ORDER-003",
        user_id: users[2]._id, // User thứ ba
        buyer: {
          Name: users[2].username,
          Phone: "0567891234",
        },
        total_amount: variants[2].price * 3,
        order_details: [
          {
            product_id: products[2]._id,
            variant_id: variants[2]._id,
            quantity: 3,
            price_at_purchase: variants[2].price,
          },
        ],
        status: "Delivered",
        order_address: {
          Street: users[2].address.street,
          City: users[2].address.city,
          Country: users[2].address.country,
          PostalCode: users[2].address.postal_code,
        },
        order_shipping_cost: 30000,
      },
      {
        order_id: "ORDER-004",
        user_id: users[3]._id, // User thứ tư
        buyer: {
          Name: users[3].username,
          Phone: "0345678912",
        },
        total_amount: variants[3].price,
        order_details: [
          {
            product_id: products[3]._id,
            variant_id: variants[3]._id,
            quantity: 1,
            price_at_purchase: variants[3].price,
          },
        ],
        status: "Cancelled",
        order_address: {
          Street: users[3].address.street,
          City: users[3].address.city,
          Country: users[3].address.country,
          PostalCode: users[3].address.postal_code,
        },
        order_shipping_cost: 200000,
      },
      {
        order_id: "ORDER-005",
        user_id: users[4]._id, // User thứ năm
        buyer: {
          Name: users[4].username,
          Phone: "0912345678",
        },
        total_amount: variants[4].price * 2,
        order_details: [
          {
            product_id: products[4]._id,
            variant_id: variants[4]._id,
            quantity: 2,
            price_at_purchase: variants[4].price,
          },
        ],
        status: "Pending",
        order_address: {
          Street: users[4].address.street,
          City: users[4].address.city,
          Country: users[4].address.country,
          PostalCode: users[4].address.postal_code,
        },
        order_shipping_cost: 200000,
      },
    ];

    const savedOrders = await OrderModel.insertMany(orders);
    console.log("Orders saved:", savedOrders);
  } catch (error) {
    console.error("Error saving orders:", error);
    console.error(error.stack);
  } finally {
    mongoose.connection.close();
  }
}
