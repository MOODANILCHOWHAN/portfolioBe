const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const schema = new mongoose.Schema(
  {
    name:      { type: String, required: [true, "Name is required"], trim: true, minlength: 2, maxlength: 80 },
    email:     { type: String, required: [true, "Email is required"], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, "Invalid email"] },
    password:  { type: String, required: [true, "Password is required"], minlength: 6, select: false },
    plan:      { type: String, enum: ["open", "plus", "pro"], default: "open" },
    planExpiry: Date,
    avatar:    String,
    lastLogin: Date,
  },
  { timestamps: true }
);

schema.index({ email: 1 }, { unique: true });

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

schema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

schema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("User", schema);
