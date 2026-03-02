const express = require("express");
const router = express.Router();

const {
  createHabit,
  getHabits,
  updateHabit,
  deleteHabit,
  markHabitCompleted,
  getHabitSummary,
} = require("../controllers/habitController");

const { protect } = require("../middlewares/auth.middleware");

// Habit CRUD
router.post("/add", protect, createHabit);
router.get("/", protect, getHabits);
router.put("/:id", protect, updateHabit);
router.delete("/:id", protect, deleteHabit);

// Mark as completed
router.put("/:id/complete", protect, markHabitCompleted);

// Dashboard summary
router.get("/summary", protect, getHabitSummary);

module.exports = router;