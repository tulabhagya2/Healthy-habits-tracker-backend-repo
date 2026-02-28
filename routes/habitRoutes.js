const express = require("express");
const router = express.Router();

const {
  createHabit,
  getHabits,
  markHabitCompleted,
  getHabitSummary, // ✅ added summary
} = require("../controllers/habitController");

const { protect } = require("../middlewares/auth.middleware");

// Create a new habit
router.post("/add", protect, createHabit);

// Get all habits for the logged-in user
router.get("/", protect, getHabits);

// Mark a habit as completed (updates streak)
router.put("/:id/complete", protect, markHabitCompleted);

// Get dashboard summary (daily/weekly completed habits)
router.get("/summary", protect, getHabitSummary); // ✅ new route

module.exports = router;