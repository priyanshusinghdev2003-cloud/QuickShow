import express from "express";
import {
  createBooking,
  getOccupiedSeats,
} from "../controllers/booking.controller.js";

const router = express.Router();

router.route("/create").post(createBooking);
router.route("/occupied-seats/:showId").get(getOccupiedSeats);

export default router;
