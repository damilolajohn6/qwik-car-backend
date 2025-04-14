const express = require("express");
const router = express.Router();
const carController = require("../controllers/carController");
const authMiddleware = require("../middleware/auth");

router.post("/", authMiddleware, carController.createCar);
router.get("/", carController.getAllCars);
router.get("/:id", carController.getCar);
router.put("/:id", authMiddleware, carController.updateCar);
router.delete("/:id", authMiddleware, carController.deleteCar);
router.get("/search", carController.searchCars);

module.exports = router;
