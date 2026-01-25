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
      subject: `Payment Confirmation: "${booking.show.movie.title}" booked!`,
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

//inngest function to send reminders
const sendShowReminders = inngest.createFunction(
  { id: "send-show-reminders" },
  { cron: "0 */8 * * *" }, // every 8 hours
  async ({ step }) => {
    const now = new Date();
    const in8Hours = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const windowStart = new Date(in8Hours.getTime() - 10 * 60 * 1000);

    // prepare reminder tasks
    const reminderTasks = await step.run("prepare-reminder-tasks", async () => {
      const shows = await Show.find({
        showDateTime: {
          $gte: windowStart,
          $lte: in8Hours,
        },
      }).populate("movie");
      const tasks = [];
      for (const show of shows) {
        if (!show.movie || !show.occupiedSeats) continue;
        const userIds = [...new Set(Object.values(show.occupiedSeats))];
        if (userIds.length === 0) continue;
        const users = await User.find({ _id: { $in: userIds } }).select(
          "email name",
        );
        for (const user of users) {
          tasks.push({
            userEmail: user.email,
            userName: user.name,
            movieTitle: show.movie.title,
            showDateTime: show.showDateTime,
            bookedSeats: show.bookedSeats,
          });
        }
      }
      return tasks;
    });
    if (reminderTasks.length === 0) {
      return { send: 0, message: "No reminders to send" };
    }
    // send reminders
    const results = await step.run("send-all-reminders", async () => {
      return await Promise.allSettled(
        reminderTasks.map(async (task) => {
          return await sendEmail({
            to: task.userEmail,
            subject: `Reminder: "${task.movieTitle}" is showing soon!`,
            body: `
              <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #1a1a1a; padding: 20px; text-align: center; color: #ffffff;">
                  <h1 style="margin: 0; font-size: 24px;">Reminder!</h1>
                </div>
                <div style="padding: 30px; color: #333333; line-height: 1.6;">
                  <p>Hi <strong>${task.userName}</strong>,</p>
                  <p>Don't miss out on the movie you booked! Your show for <strong>${task.movieTitle}</strong> is just 8 hours away.</p>
                  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #e50914;">
                    <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${new Date(task.showDateTime).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                    <p style="margin: 0 0 10px 0;"><strong>Time:</strong> ${new Date(task.showDateTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                    <p style="margin: 0;"><strong>Seats:</strong> ${task.bookedSeats.join(", ")}</p>
                  </div>
                  <p style="font-size: 18px; font-weight: bold; text-align: center; color: #e50914; margin-top: 30px;">See you there!</p>
                </div>
                <div style="padding: 20px; text-align: center; font-size: 12px; color: #999999; background-color: #f4f4f4;">
                  <p>Please show this confirmation at the theater entrance.</p>
                </div>
              </div>
            `,
          });
        }),
      );
    });

    const sent = results.filter(
      (result) => result.status === "fulfilled",
    ).length;
    const failed = results.length - sent;
    return {
      sent,
      failed,
      message: `Sent ${sent} reminders, failed to send ${failed}`,
    };
  },
);

const sendNewShowNotifications = inngest.createFunction(
  { id: "send-new-show-notifications" },
  { event: "app/show.added" },
  async ({ event }) => {
    const { movieTitle } = event.data;
    const users = await User.find({});
    for (const user of users) {
      const userEmail = user.email;
      const userName = user.name;
      const subject = `New Show Added: ${movieTitle}`;
      const body = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e1e1; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #1a1a1a; padding: 20px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px;">New Show Added!</h1>
        </div>
        <div style="padding: 30px; color: #333333; line-height: 1.6;">
          <p>Hi <strong>${userName}</strong>,</p>
          <p>A new show for <strong>${movieTitle}</strong> has been added to our theater.</p>
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #e50914;">
            <p style="margin: 0 0 10px 0;"><strong>Movie:</strong> ${movieTitle}</p>
          </div>
          <p style="font-size: 18px; font-weight: bold; text-align: center; color: #e50914; margin-top: 30px;">Check it out!</p>
        </div>
        <div style="padding: 20px; text-align: center; font-size: 12px; color: #999999; background-color: #f4f4f4;">
          <p>Please show this confirmation at the theater entrance.</p>
        </div>
      </div>
    `;
      await sendEmail({
        to: userEmail,
        subject,
        body,
      });
    }
    return { sent: users.length, message: "New show notifications sent" };
  },
);

// Create an empty array where we'll export future Inngest functions
export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdate,
  cancelBookingAndReleaseSeats,
  sendBookingEmail,
  sendShowReminders,
  sendNewShowNotifications,
];
