const winston = require("winston");
const path    = require("path");
const { combine, timestamp, colorize, printf, json } = winston.format;

const consoleFmt = printf(({ level, message, timestamp }) =>
  `[${timestamp}] ${level}: ${message}`
);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: "HH:mm:ss" }), consoleFmt),
    }),
    new winston.transports.File({ filename: path.join(__dirname, "../../logs/error.log"),    level: "error" }),
    new winston.transports.File({ filename: path.join(__dirname, "../../logs/combined.log") }),
  ],
});

module.exports = { logger };
