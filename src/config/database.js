const mongoose   = require("mongoose");
const { logger } = require("../utils/logger");

const connectDB = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI not set in .env");

  mongoose.connection.on("connected",    () => logger.info("✅  MongoDB connected"));
  mongoose.connection.on("disconnected", () => logger.warn("⚠️   MongoDB disconnected"));
  mongoose.connection.on("error",   (e) => logger.error("❌  MongoDB error", e));

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });
};

module.exports = { connectDB };
