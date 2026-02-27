const express  = require("express");
const router   = express.Router();
const ctrl     = require("../controllers/auth.controller");
const { protect }                              = require("../middleware/auth.middleware");
const { validate, registerRules, loginRules }  = require("../middleware/validation.middleware");

router.post("/register",        registerRules, validate, ctrl.register);
router.post("/login",           loginRules,    validate, ctrl.login);
router.post("/logout",          protect,               ctrl.logout);
router.get("/me",               protect,               ctrl.getMe);
router.patch("/change-password", protect,              ctrl.changePassword);

module.exports = router;
