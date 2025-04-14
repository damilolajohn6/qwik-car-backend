const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const user = new User({ name, email, phone, password, role: "customer" });
    const token = await user.generateAuthToken();
    await user.save();
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: "Registration failed" });
  }
};

exports.registerAdmin = async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const user = new User({ name, email, phone, password, role: "admin" });
    const token = await user.generateAuthToken();
    await user.save();
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: "Admin registration failed" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // Fetch user with password for comparison
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = await user.generateAuthToken();
    // Exclude password from response
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    res.json({ user: userResponse, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
};
