import "dotenv/config";
import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import showRouter from "./routes/show.routes.js";
import bookingRouter from "./routes/booking.route.js";
import adminRouter from "./routes/admin.routes.js";
import userRouter from "./routes/user.routes.js";
import { stripeWebhooks } from "./controllers/stripe.webhooks.js";
import helmet from "helmet";
import ratelimit from "express-rate-limit";

const app = express();

//stripe webhook
app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks,
);

//Middleware
app.use(helmet());

app.use(clerkMiddleware());
app.use(cors());
app.use(express.json());

//Rate Limiting
const limiter = ratelimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: "Too many requests from this IP, please try again after 15 minutes",
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use(limiter);
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

export default app;
