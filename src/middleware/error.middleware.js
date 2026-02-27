const { logger } = require("../utils/logger");

exports.globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  if (err.statusCode >= 500) {
    logger.error(`${req.method} ${req.url} — ${err.message}`, { stack: err.stack });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({ success: false, message: `${field} already exists.` });
  }
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return res.status(422).json({ success: false, message: "Validation failed.", errors });
  }
  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid ID format." });
  }

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    ...(err.errors && { errors: err.errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
