const Rental = require("../models/Rental");
const Car = require("../models/Car");

exports.createRental = async (req, res) => {
  const { carId, startDate, endDate, paymentMethod } = req.body;
  const userId = req.user._id; // From auth middleware

  try {
    // Find the car
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ error: "Car not found" });

    // Check if car is available for rent
    if (
      !["rent", "both"].includes(car.category) ||
      car.status !== "available"
    ) {
      return res.status(400).json({ error: "Car is not available for rent" });
    }

    // Calculate rental duration in hours
    const start = new Date(startDate);
    const end = new Date(endDate);
    const bookedHours = Math.ceil((end - start) / (1000 * 60 * 60)); // Convert ms to hours
    if (bookedHours <= 0)
      return res.status(400).json({ error: "Invalid rental duration" });

    // Calculate total price
    const totalPrice = car.rentalPricePerHour * bookedHours;

    // Create rental
    const rental = new Rental({
      userId,
      carId,
      startDate,
      endDate,
      totalPrice,
      bookedHours,
      paymentMethod,
    });

    // Update car status and booked hours
    car.status = "rented";
    car.bookedHours += bookedHours;
    await car.save();

    await rental.save();
    res.status(201).json(rental);
  } catch (error) {
    res.status(400).json({ error: "Failed to create rental" });
  }
};

exports.getUserRentals = async (req, res) => {
  const userId = req.user._id; // From auth middleware
  try {
    const rentals = await Rental.find({ userId }).populate(
      "carId",
      "brand model year"
    );
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rentals" });
  }
};

exports.getAllRentals = async (req, res) => {
  try {
    const rentals = await Rental.find()
      .populate("userId", "name email")
      .populate("carId", "brand model year");
    res.json(rentals);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch all rentals" });
  }
};

exports.updateRentalStatus = async (req, res) => {
  const { status } = req.body; // e.g., 'completed', 'cancelled'
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ error: "Rental not found" });

    // If completing or cancelling, update car status
    if (
      ["completed", "cancelled"].includes(status) &&
      rental.status === "active"
    ) {
      const car = await Car.findById(rental.carId);
      if (status === "completed" || new Date() > new Date(rental.endDate)) {
        car.status = "available";
      }
      await car.save();
    }

    rental.status = status;
    await rental.save();
    res.json(rental);
  } catch (error) {
    res.status(400).json({ error: "Failed to update rental status" });
  }
};

exports.deleteRental = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ error: "Rental not found" });

    // Restore car availability if rental is active
    if (rental.status === "active") {
      const car = await Car.findById(rental.carId);
      car.bookedHours -= rental.bookedHours;
      car.status = "available";
      await car.save();
    }

    await rental.deleteOne();
    res.json({ message: "Rental deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete rental" });
  }
};
