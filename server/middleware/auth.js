import { clerkClient } from "@clerk/express";
import User from "../model/User.models.js";
export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = req.auth();
    const user = await clerkClient.users.getUser(userId);
    const mongoUser = await User.findById(userId);

    if (user.privateMetadata.role !== "admin" || mongoUser.role == "user") {
      return res.json({
        success: false,
        message: "not authorized",
      });
    }
    next();
  } catch (error) {
    res.json({
      success: false,
      message: "not authorized",
    });
  }
};
