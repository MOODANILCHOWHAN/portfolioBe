const jwt        = require("jsonwebtoken");
const User       = require("../models/User.model");
const AppError   = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const TIER_RANK = { open: 0, plus: 1, pro: 2 };

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return next(new AppError("Not authenticated. Please log in.", 401));

  let decoded;
  try {
    decoded = require("jsonwebtoken").verify(token, process.env.JWT_SECRET);
  } catch (err) {
    const msg = err.name === "TokenExpiredError"
      ? "Session expired. Please log in again."
      : "Invalid token. Please log in again.";
    return next(new AppError(msg, 401));
  }

  const user = await User.findById(decoded.id);
  if (!user) return next(new AppError("Account not found.", 401));

  req.user = user;
  next();
});

exports.requirePlan = (...plans) => (req, res, next) => {
  const userRank     = TIER_RANK[req.user?.plan] ?? 0;
  const requiredRank = Math.min(...plans.map((p) => TIER_RANK[p] ?? 99));
  if (userRank >= requiredRank) return next();
  return next(new AppError(`This feature requires a ${plans.join(" or ")} plan.`, 403));
};
