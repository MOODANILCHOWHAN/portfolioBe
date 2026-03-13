const Portfolio  = require("../models/Portfolio.model");
const AppError   = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const TIER_RANK = { open: 0, plus: 1, pro: 2 };

// POST /api/portfolio
exports.save = catchAsync(async (req, res, next) => {
  //commented because of testing the all the portfoliols
  // if (TIER_RANK[req.body.tier] > TIER_RANK[req.user.plan])
  //   return next(new AppError(`A ${req.body.tier} subscription is required.`, 403));

  const portfolio = await Portfolio.findOneAndUpdate(
    { userId: req.user._id },
    { ...req.body, userId: req.user._id, publishedAt: new Date() },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );
  res.status(201).json({ success: true, data: portfolio });
});

// GET /api/portfolio/me
exports.getMine = catchAsync(async (req, res, next) => {
  const p = await Portfolio.findOne({ userId: req.user._id });
  if (!p) return next(new AppError("No portfolio found.", 404));
  res.json({ success: true, data: p });
});

// GET /api/portfolio/u/:slug  (public)
exports.getBySlug = catchAsync(async (req, res, next) => {
  const p = await Portfolio.findOne({ slug: req.params.slug, isPublic: true });
  if (!p) return next(new AppError("Portfolio not found.", 404));
  Portfolio.findByIdAndUpdate(p._id, { $inc: { views: 1 } }).exec();
  res.json({ success: true, data: p });
});

// DELETE /api/portfolio
exports.remove = catchAsync(async (req, res, next) => {
  const p = await Portfolio.findOneAndDelete({ userId: req.user._id });
  if (!p) return next(new AppError("No portfolio to delete.", 404));
  res.json({ success: true, message: "Portfolio deleted." });
});
