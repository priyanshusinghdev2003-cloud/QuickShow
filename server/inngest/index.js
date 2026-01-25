import { Inngest } from "inngest";
import User from "../model/User.models.js";
import Booking from "../model/Booking.model.js";
import Show from "../model/Show.model.js";
import sendEmail from "../config/nodemailer.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "movie-ticket-booking" });

// inngest function to save user data to a database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    const userData = {
      _id: id,
      name: `${first_name} ${last_name}`,
      email: email_addresses[0].email_address,
      image: image_url,
    };
    await User.create(userData);
  },
);

// Inngest function to delete user data from the database
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    await User.findByIdAndDelete(id);
  },
);

// Inngest function to update user data in the database
const syncUserUpdate = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    const userData = {
      name: `${first_name} ${last_name}`,
      email: email_addresses[0].email_address,
      image: image_url,
    };
    await User.findByIdAndUpdate(id, userData);
  },
);

// inngest functon to cancel booking and release seats of shows after 10 minutes of booking cancel if payment is not done
const cancelBookingAndReleaseSeats = inngest.createFunction(
  { id: "release-seats-delete-booking" },
  { event: "app/checkpayment" },
  async ({ event, step }) => {
    const tenminutesLater = new Date(Date.now() + 10 * 60 * 1000);
    await step.sleepUntil("wait-for-10-minutes", tenminutesLater);
    await step.run("check-payment-status", async () => {
      const bookingId = event.data.bookingId;
      const booking = await Booking.findById(bookingId);
      // if payment is not done then release the seats
      if (!booking.isPaid) {
        const show = await Show.findById(booking.show);
        booking.bookedSeats.forEach((seat) => {
          delete show.occupiedSeats[seat];
        });
        show.markModified("occupiedSeats");
        await show.save();
        await Booking.findByIdAndDelete(booking._id);
      }
    });
  },
);

//  inngest function to send email to user after booking
const sendBookingEmail = inngest.createFunction(
  { id: "send-booking-confirmation-email" },
  { event: "app/show.booked" },
  async ({ event, step }) => {
    const { bookingId } = event.data;
    const booking = await Booking.findById(bookingId)
      .populate({
        path: "show",
        populate: {
          path: "movie",
          model: "Movie",
        },
      })
      .populate("user");
    await sendEmail({
      to: booking.user.email,
      subject: `Payment Confirmation: "${booking.show.movie.title}" booked1`,
      body: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #1a1a1a; padding: 20px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 24px;">Booking Confirmed!</h1>
          </div>
          <div style="padding: 30px; color: #333333; line-height: 1.6;">
            <p>Hi <strong>${booking.user.name}</strong>,</p>
            <p>Get ready for an amazing time! Your booking for <strong>${booking.show.movie.title}</strong> has been successfully confirmed.</p>
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #e50914;">
              <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${new Date(booking.show.showDateTime).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
              <p style="margin: 0 0 10px 0;"><strong>Time:</strong> ${new Date(booking.show.showDateTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
              <p style="margin: 0;"><strong>Seats:</strong> ${booking.bookedSeats.join(", ")}</p>
            </div>
            <p style="font-size: 18px; font-weight: bold; text-align: center; color: #e50914; margin-top: 30px;">Enjoy the show!</p>
          </div>
          <div style="padding: 20px; text-align: center; font-size: 12px; color: #999999; background-color: #f4f4f4;">
            <p>Please show this confirmation at the theater entrance.</p>
          </div>
        </div>
      `,
    });
  },
);

// Create an empty array where we'll export future Inngest functions
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdate,
  cancelBookingAndReleaseSeats,
  sendBookingEmail,
];
