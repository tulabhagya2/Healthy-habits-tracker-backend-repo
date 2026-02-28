const express = require("express");
const router = express.Router();
const { createGoal, getGoals, updateGoalProgress } = require("../controllers/goalController");
const { protect } = require("../middlewares/auth.middleware");

// Create a new goal
router.post("/add", protect, createGoal);

// Get all goals for the logged-in user
router.get("/", protect, getGoals);

// Update goal progress
router.put("/:id/progress", protect, updateGoalProgress);

module.exports = router;