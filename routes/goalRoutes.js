const express = require("express");
const router = express.Router();
const {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  getGoalSummary,
} = require("../controllers/goalController");
const { protect } = require("../middlewares/auth.middleware");

router.post("/add", protect, createGoal);
router.get("/", protect, getGoals);
router.put("/:id", protect, updateGoal);           // update goal details
router.delete("/:id", protect, deleteGoal);        // delete goal
router.put("/:id/progress", protect, updateGoalProgress);
router.get("/summary", protect, getGoalSummary);   // dashboard summary

module.exports = router;