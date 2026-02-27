const mongoose = require("mongoose");

const DESIGN_IDS = ["O1","O2","O3","P1","P2","P3","P4","P5","R1","R2","R3"];

const schema = new mongoose.Schema(
  {
    userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    designId:   { type: String, required: true, enum: DESIGN_IDS },
    tier:       { type: String, enum: ["open","plus","pro"], required: true },
    designName: { type: String, required: true },
    name:       { type: String, required: [true, "Full name is required"], trim: true },
    role:       String,
    email:      String,
    phone:      String,
    location:   String,
    linkedin:   String,
    bio:        { type: String, maxlength: 2000 },
    techSkills: [String],
    softSkills: [String],
    education:  [{ degree: String, school: String, year: String, grade: String, _id: false }],
    experience: [{ title: String, company: String, duration: String, desc: String, _id: false }],
    projects:   [{ name: String, desc: String, tech: String, link: String, _id: false }],
    github:     String,
    website:    String,
    certs:      String,
    langs:      String,
    slug:       { type: String, unique: true, sparse: true },
    views:      { type: Number, default: 0 },
    isPublic:   { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

schema.pre("save", function (next) {
  if (this.slug) return next();
  const base = this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  this.slug  = `${base}-${Date.now().toString(36)}`;
  next();
});

module.exports = mongoose.model("Portfolio", schema);
