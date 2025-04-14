const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true },
    retailPrice: { type: Number },
    rentalPricePerHour: { type: Number },
    category: { type: String, enum: ["sale", "rent", "both"], required: true },
    status: {
      type: String,
      enum: ["available", "sold", "rented", "unavailable"],
      default: "available",
    },
    quantity: { type: Number, default: 1 },
    engineCC: { type: Number },
    maxPower: { type: String },
    airbags: { type: Number },
    rearCamera: { type: Boolean },
    seats: { type: Number },
    bookedHours: { type: Number, default: 0 },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String }, // Optional, no longer required
      },
    ],
  },
  { timestamps: true }
);

carSchema.index({ brand: "text", model: "text" });

const Car = mongoose.model("Car", carSchema);
module.exports = Car;
