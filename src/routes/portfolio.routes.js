const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/portfolio.controller");
const { protect }                        = require("../middleware/auth.middleware");
const { validate, portfolioRules }       = require("../middleware/validation.middleware");

router.get("/u/:slug", ctrl.getBySlug);         // public

router.use(protect);
router.post("/",  portfolioRules, validate, ctrl.save);
router.get("/me", ctrl.getMine);
router.delete("/", ctrl.remove);

module.exports = router;
