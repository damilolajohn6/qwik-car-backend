const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Covers both customer name and adminName
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["customer", "admin"], default: "customer" }, // Role-based distinction
  createdAt: { type: Date, default: Date.now },
  messages: [
    // Optional: Kept from your original User model
    {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      message: { type: String, required: true },
      date: { type: Date, default: Date.now },
    },
  ],
  tokens: [
    {
      token: { type: String, required: true },
    },
  ],
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Generate JWT token
userSchema.methods.generateAuthToken = async function () {
  try {
    const token = jwt.sign(
      { _id: this._id, role: this.role }, // Include role in token
      process.env.SECRET_KEY,
      { expiresIn: "7d" } // Token expiration
    );
    this.tokens = this.tokens.concat({ token });
    await this.save();
    return token;
  } catch (err) {
    throw new Error("Token generation failed");
  }
};

// Add message (optional feature for customers)
userSchema.methods.addMessage = async function (name, email, phone, message) {
  try {
    this.messages = this.messages.concat({ name, email, phone, message });
    await this.save();
    return this.messages;
  } catch (error) {
    throw new Error("Failed to save message");
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
