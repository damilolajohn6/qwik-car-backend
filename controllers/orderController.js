const Order = require("../models/Order");
const Car = require("../models/Car");

exports.createOrder = async (req, res) => {
  const { carId, quantity, paymentMethod, deliveryAddress } = req.body;
  const userId = req.user._id; // From auth middleware

  try {
    // Find the car
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ error: "Car not found" });

    // Check if car is available for sale
    if (
      !["sale", "both"].includes(car.category) ||
      car.status !== "available" ||
      car.quantity < quantity
    ) {
      return res
        .status(400)
        .json({ error: "Car is not available for purchase" });
    }

    // Calculate total price
    const totalPrice = car.price * quantity;

    // Create order
    const order = new Order({
      userId,
      carId,
      totalPrice,
      quantity,
      paymentMethod,
      deliveryAddress,
    });

    // Update car quantity and status
    car.quantity -= quantity;
    if (car.quantity === 0) car.status = "sold";
    await car.save();

    await order.save();
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: "Failed to create order" });
  }
};

exports.getUserOrders = async (req, res) => {
  const userId = req.user._id; // From auth middleware
  try {
    const orders = await Order.find({ userId }).populate(
      "carId",
      "brand model year"
    );
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("carId", "brand model year");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch all orders" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body; // e.g., 'completed', 'cancelled'
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // If cancelling, restore car quantity
    if (status === "cancelled" && order.status === "pending") {
      const car = await Car.findById(order.carId);
      car.quantity += order.quantity;
      car.status = "available";
      await car.save();
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (error) {
    res.status(400).json({ error: "Failed to update order status" });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Restore car quantity if order is still pending
    if (order.status === "pending") {
      const car = await Car.findById(order.carId);
      car.quantity += order.quantity;
      car.status = "available";
      await car.save();
    }

    await order.deleteOne();
    res.json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete order" });
  }
};
