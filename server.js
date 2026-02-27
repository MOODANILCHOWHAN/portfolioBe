"use strict";

const express       = require("express");
const mongoose      = require("mongoose");
const cors          = require("cors");
const helmet        = require("helmet");
const compression   = require("compression");
const morgan        = require("morgan");
const rateLimit     = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");

require("dotenv").config();

const { connectDB }          = require("./src/config/database");
const { logger }             = require("./src/utils/logger");
const authRoutes             = require("./src/routes/auth.routes");
const portfolioRoutes        = require("./src/routes/portfolio.routes");
const subscriptionRoutes     = require("./src/routes/subscription.routes");
const { globalErrorHandler } = require("./src/middleware/error.middleware");
const { notFound }           = require("./src/middleware/notFound.middleware");

const app = express();

app.use(helmet());
app.use(mongoSanitize());
app.use(compression());

const allowedOrigins = (process.env.CLIENT_URLS || "http://localhost:4200")
  .split(",").map((s) => s.trim());

app.use(
  cors({
    origin: (origin, cb) =>
      !origin || allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error("CORS blocked")),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }));

app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }));
app.use("/api/auth/login",    rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }));
app.use("/api/auth/register", rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }));

app.get("/health", (req, res) =>
  res.json({ status: "ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected" })
);

app.use("/api/auth",         authRoutes);
app.use("/api/portfolio",    portfolioRoutes);
app.use("/api/subscription", subscriptionRoutes);

app.use(notFound);
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => logger.info(`🚀 API running on http://localhost:${PORT}`));
  } catch (err) {
    logger.error("Startup failed:", err);
    process.exit(1);
  }
})();

process.on("unhandledRejection", (err) => { logger.error("Unhandled rejection:", err); process.exit(1); });
process.on("uncaughtException",  (err) => { logger.error("Uncaught exception:",  err); process.exit(1); });

module.exports = app;
