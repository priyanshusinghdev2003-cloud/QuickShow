import express from "express";
import { getNowPlayingMovies,addShow } from "../controllers/show.controller.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

router.route("/now-playing").get(protectAdmin,getNowPlayingMovies);
router.route("/add").post(protectAdmin,addShow);

export default router;
