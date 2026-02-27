const jwt        = require("jsonwebtoken");
const User       = require("../models/User.model");
const AppError   = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const { logger } = require("../utils/logger");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

const respond = (res, code, user, token) =>
  res.status(code).json({ success: true, token, user });

// POST /api/auth/register
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) return next(new AppError("Email already registered.", 409));

  const user  = await User.create({ name, email, password });
  const token = signToken(user._id);
  logger.info(`New user: ${email}`);
  respond(res, 201, user, token);
});

// POST /api/auth/login
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password)))
    return next(new AppError("Invalid email or password.", 401));

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });
  logger.info(`Login: ${email}`);
  respond(res, 200, user, signToken(user._id));
});

// GET /api/auth/me
exports.getMe = catchAsync(async (req, res) =>
  res.json({ success: true, data: req.user })
);

// POST /api/auth/logout
exports.logout = (req, res) =>
  res.json({ success: true, message: "Logged out." });

// PATCH /api/auth/change-password
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.comparePassword(currentPassword)))
    return next(new AppError("Current password is wrong.", 401));
  user.password = newPassword;
  await user.save();
  respond(res, 200, user, signToken(user._id));
});
