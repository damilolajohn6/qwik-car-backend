const express = require("express");
const router = express.Router();
const rentalController = require("../controllers/rentalController");
const auth = require("../middleware/auth");
const restrictTo = require("../middleware/restrictTo");

router.post("/", auth, rentalController.createRental); // Customer creates rental
router.get("/my-rentals", auth, rentalController.getUserRentals); // Customer views their rentals
router.get("/", auth, restrictTo("admin"), rentalController.getAllRentals); // Admin views all rentals
router.put(
  "/:id",
  auth,
  restrictTo("admin"),
  rentalController.updateRentalStatus
); // Admin updates status
router.delete("/:id", auth, restrictTo("admin"), rentalController.deleteRental); // Admin deletes rental

module.exports = router;
