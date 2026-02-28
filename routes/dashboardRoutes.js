const express = require("express");
const router = express.Router();
const { getDashboardStats } = require("../controllers/dashboardController");
const { protect } = require("../middlewares/auth.middleware");

// GET /dashboard → protected route
router.get("/", protect, getDashboardStats);

module.exports = router;