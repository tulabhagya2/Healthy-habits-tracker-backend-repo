const express = require("express");
const router = express.Router();
const { getAnalytics } = require("../controllers/analyticsController");
const { protect } = require("../middlewares/auth.middleware"); // user auth middleware


router.get("/", protect,getAnalytics);

module.exports = router;