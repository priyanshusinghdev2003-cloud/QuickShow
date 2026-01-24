import express from "express";
import {
  isAdmin,
  getAllBookings,
  getAllShows,
  getDashboardStats,
} from "../controllers/admin.controller.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

router.route("/is-admin").get(protectAdmin, isAdmin);
router.route("/dashboard").get(protectAdmin, getDashboardStats);
router.route("/all-shows").get(protectAdmin, getAllShows);
router.route("/all-bookings").get(protectAdmin, getAllBookings);

export default router;
