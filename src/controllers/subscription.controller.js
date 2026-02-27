const crypto       = require("crypto");
const Razorpay     = require("razorpay");
const Subscription = require("../models/Subscription.model");
const User         = require("../models/User.model");
const AppError     = require("../utils/AppError");
const catchAsync   = require("../utils/catchAsync");
const { logger }   = require("../utils/logger");

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const PLANS = {
  plus: { amountPaise: 29900, days: 30 },
  pro:  { amountPaise: 59900, days: 30 },
};

// POST /api/subscription/create-order
exports.createOrder = catchAsync(async (req, res, next) => {
  const { plan } = req.body;
  if (!PLANS[plan]) return next(new AppError("Invalid plan.", 400));

  const order = await razorpay.orders.create({
    amount:   PLANS[plan].amountPaise,
    currency: "INR",
    receipt:  `pf_${req.user._id}_${Date.now()}`,
    notes:    { userId: req.user._id.toString(), plan },
  });

  res.json({ success: true, data: { orderId: order.id, amount: order.amount, currency: order.currency, razorpayKey: process.env.RAZORPAY_KEY_ID } });
});

// POST /api/subscription/verify
exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (expected !== razorpay_signature) {
    logger.warn(`Signature mismatch for user ${req.user._id}`);
    return next(new AppError("Payment verification failed.", 400));
  }

  const cfg    = PLANS[plan];
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + cfg.days);

  await User.findByIdAndUpdate(req.user._id, { plan, planExpiry: expiry });
  await Subscription.create({
    userId:    req.user._id, plan,
    endDate:   expiry, amountINR: cfg.amountPaise / 100,
    paymentId: razorpay_payment_id, orderId: razorpay_order_id, signature: razorpay_signature,
  });

  logger.info(`Plan ${plan} activated for ${req.user._id}`);
  res.json({ success: true, message: `${plan.toUpperCase()} activated until ${expiry.toDateString()}.`, data: { plan, expiry } });
});

// GET /api/subscription/status
exports.getStatus = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select("plan planExpiry");
  res.json({ success: true, data: { plan: user.plan, expiry: user.planExpiry } });
});
