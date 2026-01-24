import express from "express";
import {
  getNowPlayingMovies,
  addShow,
  getShows,
  getShowById,
} from "../controllers/show.controller.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

router.route("/now-playing").get(protectAdmin, getNowPlayingMovies);
router.route("/add").post(protectAdmin, addShow);
router.route("/all").get(getShows);
router.route("/:movieId").get(getShowById);
export default router;
