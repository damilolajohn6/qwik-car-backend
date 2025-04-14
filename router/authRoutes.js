const express = require("express");
const router = express.Router();
const authController = require("../controllers/authControllers");
const auth = require("../middleware/auth");
const restrictTo = require("../middleware/restrictTo");

router.post("/register", authController.register);
// Optional: Restrict admin registration to existing admins
router.post(
  "/register-admin",
  auth,
  restrictTo("admin"),
  authController.registerAdmin
);
router.post("/login", authController.login);

module.exports = router;
