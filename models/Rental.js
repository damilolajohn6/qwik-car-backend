const mongoose = require("mongoose");

const rentalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    carId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    bookedHours: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    paymentMethod: {
      type: String,
      enum: ["credit_card", "bank_transfer", "cash"],
      required: true,
    },
  },
  { timestamps: true }
);

const Rental = mongoose.model("Rental", rentalSchema);
module.exports = Rental;
