const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const mongoosePaginate = require("mongoose-paginate-v2");

const UserSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      ward: String,
      district: String,
      city: String,
      country: String,
      postal_code: String,
    },
    role: {
      type: String,
      enum: ["Customer", "Admin"],
      default: "Customer",
    },
    avatar: String,
    current_orders: [
      {
        type: String,
      },
    ],
    is_active: { type: Boolean, default: true },
  },
  {
    timestamps: true, // Tự động thêm created_at và updated_at
  }
);

// Middleware để hash mật khẩu trước khi lưu
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    // Đổi thành snake_case
    this.password = await bcrypt.hash(this.password, 10); // Đổi thành snake_case
  }
  next();
});

// Phương thức kiểm tra mật khẩu
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password); // Đổi thành snake_case
};

UserSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("User", UserSchema);
