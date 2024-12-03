const mongoose = require("mongoose");
const UserModel = require("./app/models/user.model"); // Đảm bảo đường dẫn đúng

// Kết nối tới MongoDB
mongoose
  .connect("mongodb://localhost:27017/ecommerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to the database!");
    createUsers(); // Gọi hàm tạo người dùng sau khi kết nối thành công
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });

// Hàm thêm người dùng mới
async function createUsers() {
  try {
    // Tạo một danh sách người dùng mới
    const users = [
      {
        user_id: "U001",
        username: "john_doe",
        email: "john.doe@example.com",
        password: "123456",
        address: {
          Street: "123 Main St",
          Ward: "Ward 1",
          District: "District 1",
          City: "New York",
          Country: "USA",
          PostalCode: "10001",
        },
        role: "Customer",
        avatar: "avatar1.jpg",
        current_orders: ["order1", "order2"],
        is_active: true,
      },
      {
        user_id: "U002",
        username: "jane_doe",
        email: "jane.doe@example.com",
        password: "password123",
        address: {
          Street: "456 Elm St",
          Ward: "Ward 2",
          District: "District 2",
          City: "Los Angeles",
          Country: "USA",
          PostalCode: "90001",
        },
        role: "Admin",
        avatar: "avatar2.jpg",
        current_orders: ["order3", "order4"],
        is_active: true,
      },
      {
        user_id: "U003",
        username: "alice_smith",
        email: "alice.smith@example.com",
        password: "alicepass",
        address: {
          Street: "789 Oak St",
          Ward: "Ward 3",
          District: "District 3",
          City: "Chicago",
          Country: "USA",
          PostalCode: "60601",
        },
        role: "Customer",
        avatar: "avatar3.jpg",
        current_orders: ["order5"],
        is_active: false,
      },
      {
        user_id: "U004",
        username: "bob_jones",
        email: "bob.jones@example.com",
        password: "bobpass123",
        address: {
          Street: "101 Pine St",
          Ward: "Ward 4",
          District: "District 4",
          City: "San Francisco",
          Country: "USA",
          PostalCode: "94101",
        },
        role: "Admin",
        avatar: "avatar4.jpg",
        current_orders: ["order6", "order7", "order8"],
        is_active: true,
      },
      {
        user_id: "U005",
        username: "carol_williams",
        email: "carol.williams@example.com",
        password: "carolpass",
        address: {
          Street: "202 Maple St",
          Ward: "Ward 5",
          District: "District 5",
          City: "Miami",
          Country: "USA",
          PostalCode: "33101",
        },
        role: "Customer",
        avatar: "avatar5.jpg",
        current_orders: ["order9", "order10"],
        is_active: true,
      },
    ];

    // Lưu tất cả người dùng vào cơ sở dữ liệu
    const savedUsers = await UserModel.insertMany(users);

    console.log("Users saved:", savedUsers);
  } catch (error) {
    console.error("Error saving users:", error);
  }
}
