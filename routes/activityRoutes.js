const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");

const {
  addActivity,
  getActivities,
  updateActivity,
  deleteActivity,
} = require("../controllers/activityController");

router.post("/add", protect, addActivity);
router.get("/", protect, getActivities);
router.put("/update/:id", protect, updateActivity);
router.delete("/delete/:id", protect, deleteActivity);

module.exports = router;