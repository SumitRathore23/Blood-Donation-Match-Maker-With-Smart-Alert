const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: 6,
    select: false, // don't return password by default
  },
}, { timestamps: true });

// Hash password before saving
userProfileSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userProfileSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Prevent OverwriteModelError
module.exports =
  mongoose.models.UserProfile ||
  mongoose.model("UserProfile", userProfileSchema);