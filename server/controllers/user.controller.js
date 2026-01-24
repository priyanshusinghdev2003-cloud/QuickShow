import Booking from "../model/Booking.model.js";
import { clerkClient } from "@clerk/express";
import Movie from "../model/Movie.models.js";

export const getUserBookings = async (req, res) => {
  try {
    const user = req.auth().userId;
    const bookings = await Booking.find({ user })
      .populate({
        path: "show",
        populate: {
          path: "movie",
        },
      })
      .sort({ createdAt: -1 });
    res.status(200).json({ bookings, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

//api controller function to update favourite movie in clerk user metadata
export const updateUserFavouriteMovie = async (req, res) => {
  try {
    const { movieId } = req.body;
    const userId = req.auth().userId;
    const user = await clerkClient.users.getUser(userId);
    if (!user.privateMetadata.favorites) {
      user.privateMetadata.favorites = [];
    }
    if (!user.privateMetadata.favorites.includes(movieId)) {
      user.privateMetadata.favorites.push(movieId);
    } else {
      user.privateMetadata.favorites = user.privateMetadata.favorites.filter(
        (id) => id !== movieId,
      );
    }
    await clerkClient.users.updateUserMetadata(userId, {
      privateMetadata: user.privateMetadata,
    });
    res
      .status(200)
      .json({ message: "Favourite movie updated successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};

export const getUserFavouriteMovie = async (req, res) => {
  try {
    const userId = req.auth().userId;
    const user = await clerkClient.users.getUser(userId);
    const favorites = user.privateMetadata.favorites;

    const movies = await Movie.find({ _id: { $in: favorites } });
    res.status(200).json({ movies, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
};
