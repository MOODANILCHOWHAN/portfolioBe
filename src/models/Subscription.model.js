const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    userId:      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plan:        { type: String, enum: ["plus","pro"], required: true },
    status:      { type: String, enum: ["active","cancelled","expired"], default: "active" },
    startDate:   { type: Date, default: Date.now },
    endDate:     { type: Date, required: true },
    amountINR:   Number,
    paymentId:   String,
    orderId:     String,
    signature:   String,
    cancelledAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", schema);
