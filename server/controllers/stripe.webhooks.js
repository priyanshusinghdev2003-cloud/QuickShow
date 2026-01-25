import Stripe from "stripe";
import Booking from "../model/Booking.model.js";
import { inngest } from "../inngest/index.js";

export const stripeWebhooks = async (request, response) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (error) {
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        const sessionList = await stripe.checkout.sessions.list({
          payment_intent: paymentIntent.id,
        });
        const session = sessionList.data[0];
        const { bookingId } = session.metadata;
        await Booking.findByIdAndUpdate(bookingId, {
          isPaid: true,
          paymentLink: "",
        });
        await inngest.send({
          name: "app/show.booked",
          data: {
            bookingId,
          },
        });
        break;
      default:
        console.log(`Received unknown event type ${event.type}`);
    }
    response.status(200).json({ received: true });
  } catch (error) {
    console.log("webhook error", error);
    response.status(500).send("Internal Server Error");
  }
};
