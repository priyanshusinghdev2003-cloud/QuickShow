import Booking from "../model/Booking.model.js";
import Show from "../model/Show.model.js";

const checkSeatAvailability = async (showID, selectedSeats) => {
  try {
    const showData = await Show.findById(showID);
    if (!showData) {
      return false;
    }
    const occupiedSeats = showData.occupiedSeats;
    const isAnySeatTaken = selectedSeats.some((seat) => occupiedSeats[seat]);
    if (isAnySeatTaken) {
      return false;
    }
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { showId, selectedSeats } = req.body;
    const { origin } = req.headers;
    const isSeatAvailable = await checkSeatAvailability(showId, selectedSeats);
    if (!isSeatAvailable) {
      return res
        .status(400)
        .json({ message: "Selected seats are not available" });
    }
    // get the show detail
    const showData = await Show.findById(showId).populate("movie");
    if (!showData) {
      return res.status(404).json({ message: "Show not found" });
    }
    const booking = await Booking.create({
      user: userId,
      show: showId,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
    });

    selectedSeats.map((seat) => {
      showData.occupiedSeats[seat] = userId;
    });
    showData.markModified("occupiedSeats");
    await showData.save();

    // stripe payment
    res.status(200).json({
      message: "Booking created successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Failed to create booking",
      success: false,
    });
  }
};

export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const showData = await Show.findById(showId);
    const occupiedSeats = Object.keys(showData.occupiedSeats);

    res.status(200).json({
      message: "Occupied seats fetched successfully",
      success: true,
      occupiedSeats,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: error.message || "Failed to fetch occupied seats",
      success: false,
    });
  }
};
