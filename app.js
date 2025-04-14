require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./router/authRoutes");
const carRoutes = require("./router/carRoutes");
const orderRoutes = require("./router/orderRoutes");
const rentalRoutes = require("./router/rentalRoutes");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;


app.get("/", (req, res) => {
  res.send("Hello from Qwik Cars API");
}
);
app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/uploads", express.static("uploads"));

mongoose
  .connect(MONGO_URI, {
    dbName: "qwik-cars",
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});
