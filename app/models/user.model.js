const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const mongoosePaginate = require("mongoose-paginate-v2");

// const UserSchema = new mongoose.Schema(
//   {
//     user_id: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     username: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//       lowercase: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     address: {
//       street: String,
//       ward: String,
//       district: String,
//       city: String,
//       country: String,
//       postal_code: String,
//     },
//     role: {
//       type: String,
//       enum: ["Customer", "Admin"],
//       default: "Customer",
//     },
//     avatar: String,
//     current_orders: [
//       {
//         type: String,
//       },
//     ],
//     is_active: { type: Boolean, default: true },
//   },
//   {
//     timestamps: true, // Tự động thêm created_at và updated_at
//   }
// );

// // Middleware để hash mật khẩu trước khi lưu
// UserSchema.pre("save", async function (next) {
//   if (this.isModified("password")) {
//     // Đổi thành snake_case
//     this.password = await bcrypt.hash(this.password, 10); // Đổi thành snake_case
//   }
//   next();
// });

// // Phương thức kiểm tra mật khẩu
// UserSchema.methods.comparePassword = async function (candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password); // Đổi thành snake_case
// };

// UserSchema.plugin(mongoosePaginate);

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 6,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z][a-zA-Z0-9_]*$/.test(v) && !/\s/.test(v);
        },
        message:
          "Username must start with a letter and can only contain letters, numbers, and underscores.",
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    address: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
      default:
        "https://64.media.tumblr.com/84365fe19039b5fd917d6d449ca86290/tumblr_op4lb5DPRe1qg6rkio1_1280.jpg",
    },
    currentOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    isActive: {
      type: Boolean,
      default: false,
    },
    activationToken: String, // Token for account activation
    activationTokenExpires: Date, // Expiration date for activation token
    resetPasswordToken: String, // Token for password reset
    resetPasswordExpires: Date, // Expiration date for reset password token
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: String,
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid phone number!`,
      },
    },
  },
  {
    runValidators: false,
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
UserSchema.plugin(mongoosePaginate);
const User = mongoose.model("User", UserSchema);

module.exports = mongoose.model("User", UserSchema);
