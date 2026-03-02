const express = require("express");
const router = express.Router();
const { getAnalytics } = require("../controllers/analyticsController");
const { protect } = require("../middlewares/auth.middleware"); // user auth middleware

// GET analytics data for dashboard
router.get("/", protect, getAnalytics);

module.exports = router;