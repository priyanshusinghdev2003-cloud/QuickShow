import express from "express";
import {
  getUserBookings,
  getUserFavouriteMovie,
  updateUserFavouriteMovie,
} from "../controllers/user.controller.js";

const router = express.Router();

router.route("/bookings").get(getUserBookings);
router.route("/favourites").get(getUserFavouriteMovie);
router.route("/update-favourite").post(updateUserFavouriteMovie);

export default router;
