const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/subscription.controller");
const { protect } = require("../middleware/auth.middleware");

router.use(protect);
router.post("/create-order", ctrl.createOrder);
router.post("/verify",       ctrl.verifyPayment);
router.get("/status",        ctrl.getStatus);

module.exports = router;
