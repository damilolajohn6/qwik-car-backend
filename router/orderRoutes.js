const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const auth = require("../middleware/auth");
const restrictTo = require("../middleware/restrictTo");

router.post("/", auth, orderController.createOrder); // Customer creates order
router.get("/my-orders", auth, orderController.getUserOrders); // Customer views their orders
router.get("/", auth, restrictTo("admin"), orderController.getAllOrders); // Admin views all orders
router.put(
  "/:id",
  auth,
  restrictTo("admin"),
  orderController.updateOrderStatus
); // Admin updates status
router.delete("/:id", auth, restrictTo("admin"), orderController.deleteOrder); // Admin deletes order

module.exports = router;
