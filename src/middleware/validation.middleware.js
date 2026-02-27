const { body, validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(new AppError("Validation failed.", 422, messages));
  }
  next();
};

exports.registerRules = [
  body("name").trim().notEmpty().withMessage("Name is required").isLength({ min: 2, max: 80 }),
  body("email").trim().isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

exports.loginRules = [
  body("email").trim().isEmail().withMessage("Valid email required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

exports.portfolioRules = [
  body("name").trim().notEmpty().withMessage("Full name is required"),
  body("designId").isIn(["O1","O2","O3","P1","P2","P3","P4","P5","R1","R2","R3"]).withMessage("Invalid design ID"),
  body("tier").isIn(["open","plus","pro"]).withMessage("Invalid tier"),
];
