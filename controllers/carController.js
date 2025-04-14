const Car = require("../models/Car");
const cloudinary = require("../config/cloudinary");

exports.createCar = async (req, res) => {
  const {
    brand,
    model,
    year,
    color,
    price,
    retailPrice,
    rentalPricePerHour,
    category,
    engineCC,
    maxPower,
    airbags,
    rearCamera,
    seats,
    quantity,
    images,
  } = req.body;

  try {
    // Validate required fields
    if (
      !brand ||
      !model ||
      !year ||
      !color ||
      !price ||
      !category ||
      !images.length
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Handle pre-uploaded image URLs
    const imageObjects = images.map((image) => ({
      url: image,
      publicId: null, // Null is fine since publicId is optional
    }));

    const car = new Car({
      brand,
      model,
      year,
      color,
      price,
      retailPrice,
      rentalPricePerHour,
      category,
      engineCC,
      maxPower,
      airbags,
      rearCamera,
      seats,
      quantity,
      images: imageObjects,
    });

    await car.save();
    res.status(201).json(car);
  } catch (error) {
    console.error("Error creating car:", error);
    res
      .status(400)
      .json({ error: "Failed to create car", details: error.message });
  }
};

exports.getAllCars = async (req, res) => {
  const { category, status } = req.query;
  try {
    const query = {};
    if (category) query.category = category;
    if (status) query.status = status;

    const cars = await Car.find(query);
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cars" });
  }
};

exports.getCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: "Car not found" });
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch car" });
  }
};

exports.updateCar = async (req, res) => {
  const updates = req.body;
  try {
    if (updates.images) {
      updates.images = updates.images.map((image) => ({
        url: image,
        publicId: null,
      }));
    }

    const car = await Car.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!car) return res.status(404).json({ error: "Car not found" });
    res.json(car);
  } catch (error) {
    console.error("Error updating car:", error);
    res
      .status(400)
      .json({ error: "Failed to update car", details: error.message });
  }
};

exports.deleteCar = async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: "Car not found" });

    // Delete images from Cloudinary
    await Promise.all(
      car.images.map((img) => cloudinary.uploader.destroy(img.publicId))
    );
    await car.deleteOne();
    res.json({ message: "Car deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete car" });
  }
};

exports.searchCars = async (req, res) => {
  const { q } = req.query; // Search query (e.g., "Toyota Camry")
  try {
    const cars = await Car.find({ $text: { $search: q } });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
};
