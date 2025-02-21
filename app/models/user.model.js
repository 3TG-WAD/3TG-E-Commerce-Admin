const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const mongoosePaginate = require("mongoose-paginate-v2");

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
    activationToken: String,
    activationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
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
