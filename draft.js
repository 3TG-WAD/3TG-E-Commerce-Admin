const mongoose = require("mongoose");
const ProductModel = require("./app/models/product.model"); // Đảm bảo đường dẫn đúng

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
        product_id: "NK-AM-270-001",
        product_name: "Nike Air Max 270",
        description:
          "Lifestyle sneaker with large Air unit for maximum comfort and modern style",
        category_id: "LIFESTYLE_SHOES",
        manufacturer_id: "NIKE",
        creation_time: "2020-07-22T15:40:00Z",
        specifications: {
          length: "27 cm",
          width: "10.5 cm",
          weight: "340 g",
          material: "Mesh and Synthetic Leather",
          origin: "China",
          size_range: "US 6-13",
        },
        photos: [
          "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/gorfwjchoasrrzr1fggt/AIR+MAX+270.png",
          "https://static.nike.com/a/images/t_PDP_1728_v1/f_auto,q_auto:eco/ee277c7b-7765-4b8a-bbc6-3393ea7c0631/AIR+MAX+270.png",
        ],
      },
      {
        product_id: "AD-ULTRABOOST-002",
        product_name: "Adidas Ultraboost",
        description:
          "High-performance running shoes with responsive cushioning.",
        category_id: "RUNNING_SHOES",
        manufacturer_id: "ADIDAS",
        creation_time: "2020-08-15T10:00:00Z",
        specifications: {
          length: "26 cm",
          width: "10 cm",
          weight: "340 g",
          material: "Primeknit",
          origin: "Vietnam",
          size_range: "US 5-12",
        },
        photos: [
          "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/53a3ca19c06b4c5abc39131398fae837_9366/Giay_Ultraboost_5x_DJen_JI1334_HM3_hover.jpg",
          "https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/99933e8f66514773996d6e3c347b6e53_9366/Giay_Ultraboost_5x_trang_IH0638_HM3_hover.jpg",
        ],
      },
      {
        product_id: "PUMA-RS-X-003",
        product_name: "Puma RS-X",
        description: "Retro-inspired sneaker with bold colors and cushioning.",
        category_id: "LIFESTYLE_SHOES",
        manufacturer_id: "PUMA",
        creation_time: "2020-09-10T12:30:00Z",
        specifications: {
          length: "27 cm",
          width: "11 cm",
          weight: "350 g",
          material: "Mesh and Synthetic",
          origin: "China",
          size_range: "US 6-13",
        },
        photos: [
          "https://authentic-shoes.com/wp-content/uploads/2023/04/369818_08.png_c0d906b4dd0c4ab6a4ca8e3c59fa0256.png",
          "https://authentic-shoes.com/wp-content/uploads/2023/04/557163_01.jpg_5bd6d22699164eb4bb39b7b7ea7cd446-1536x791.png",
        ],
      },
      {
        product_id: "NB-990V5-004",
        product_name: "New Balance 990v5",
        description:
          "Classic running shoe with premium materials and cushioning.",
        category_id: "RUNNING_SHOES",
        manufacturer_id: "NEW_BALANCE",
        creation_time: "2020-10-05T14:00:00Z",
        specifications: {
          length: "28 cm",
          width: "10.5 cm",
          weight: "400 g",
          material: "Suede and Mesh",
          origin: "USA",
          size_range: "US 7-14",
        },
        photos: [
          "https://authentic-shoes.com/wp-content/uploads/2023/04/1613109025729_newbalance2_473f9b5a36d44d3a8880d5c227ca1b90.jpeg",
          "https://authentic-shoes.com/wp-content/uploads/2023/04/6aa63decf325f2dc8ccaa8bae895439f_fd9b6d22db894331959c3d7dc39b3e16.png",
        ],
      },
      {
        product_id: "ASICS-GEL-KAYANO-005",
        product_name: "ASICS Gel-Kayano",
        description:
          "Stability running shoe with excellent support and cushioning.",
        category_id: "RUNNING_SHOES",
        manufacturer_id: "ASICS",
        creation_time: "2020-11-01T09:00:00Z",
        specifications: {
          length: "27.5 cm",
          width: "10.5 cm",
          weight: "350 g",
          material: "Mesh",
          origin: "Vietnam",
          size_range: "US 6-12",
        },
        photos: [
          "https://cms-static.asics.com/media-libraries/65528/file.jpg?",
          "https://cms-static.asics.com/media-libraries/67922/file.pcp.png?",
        ],
      },
    ];

    // Lưu tất cả người dùng vào cơ sở dữ liệu
    const savedUsers = await ProductModel.insertMany(users);

    console.log("Users saved:", savedUsers);
  } catch (error) {
    console.error("Error saving users:", error);
  }
}
