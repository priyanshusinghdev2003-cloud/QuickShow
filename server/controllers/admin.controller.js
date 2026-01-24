import Booking from "../model/Booking.model.js";
import Show from "../model/Show.model.js";
import User from "../model/User.models.js";

export const isAdmin = async (req, res) => {
  res.json({
    success: true,
    isAdmin: true,
  });
};

export const getDashboardStats = async (req, res) => {
  try {
    const bookings = await Booking.find({ isPaid: true });
    const activeShows = await Show.find({
      showDateTime: { $gte: Date.now() },
    }).populate("movie");
    const totalUsers = await User.countDocuments();
    const dashboardData = {
      totalBookings: bookings.length,
      totalRevenue: bookings.reduce((acc, booking) => acc + booking.amount, 0),
      totalUser: totalUsers,
      activeShows: activeShows,
    };
    return res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      dashboardData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({
      showDateTime: { $gte: Date.now() },
    })
      .populate("movie")
      .sort({ showDateTime: 1 });
    return res.status(200).json({
      success: true,
      message: "Shows fetched successfully",
      shows,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("user")
      .populate({
        path: "show",
        populate: {
          path: "movie",
        },
      })
      .sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      message: "Bookings fetched successfully",
      bookings,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
