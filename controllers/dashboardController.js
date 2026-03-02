const supabase = require("../config/supabase.config");

/* ============================= */
/* GET DASHBOARD STATS */
/* ============================= */
const getDashboardStats = async (req, res) => {
  try {
    const categoryFilter = req.query.category || "all";
    const userId = req.user.id;

    // 1️⃣ Fetch all habits (optionally filtered by category)
    let habitQuery = supabase.from("habit").select("*").eq("user_id", userId);
    if (categoryFilter !== "all") {
      habitQuery = habitQuery.eq("category", categoryFilter);
    }
    const { data: habits, error: habitError } = await habitQuery;
    if (habitError) throw habitError;

    // 2️⃣ Fetch all goals (optionally filtered by category)
    let goalQuery = supabase.from("goal").select("*").eq("user_id", userId);
    if (categoryFilter !== "all") {
      goalQuery = goalQuery.eq("category", categoryFilter);
    }
    const { data: goals, error: goalError } = await goalQuery;
    if (goalError) throw goalError;

    // 3️⃣ Fetch today's activities (optionally filtered by category)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let activityQuery = supabase
      .from("activity")
      .select("*")
      .eq("user_id", userId)
      .gte("date", today.toISOString()); // activities today

    if (categoryFilter !== "all") {
      activityQuery = activityQuery.eq("category", categoryFilter);
    }
    const { data: activities, error: activityError } = await activityQuery;
    if (activityError) throw activityError;

    // 4️⃣ Calculate summary stats
    let dailyCompletions = 0;
    let weeklyCompletions = 0;
    let longestStreak = 0;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    habits.forEach((h) => {
      if (h.last_completed_date) {
        const completedDate = new Date(h.last_completed_date);
        completedDate.setHours(0, 0, 0, 0);

        if (completedDate.getTime() === today.getTime()) dailyCompletions++;
        if (completedDate >= weekStart) weeklyCompletions++;

        if (h.streak > longestStreak) longestStreak = h.streak;
      }
    });

    // 5️⃣ Calculate goal stats
    const activeGoals = goals.filter((g) => g.status === "pending").length;
    const averageGoalProgress =
      goals.length > 0
        ? Math.round(
            goals.reduce((acc, g) => acc + (g.current_amount / g.target_amount) * 100, 0) /
              goals.length
          )
        : 0;

    // 6️⃣ Completion rate
    const completionRate =
      habits.length > 0 ? Math.round((dailyCompletions / habits.length) * 100) : 0;

    // 7️⃣ Wellness score (simple average of completionRate and averageGoalProgress)
    const wellnessScore = Math.round((completionRate + averageGoalProgress) / 2);

    // 8️⃣ Activities today
    const activitiesToday = activities.length;

    res.status(200).json({
      status: true,
      summary: {
        totalHabits: habits.length,
        dailyCompletions,
        weeklyCompletions,
        longestStreak,
        completionRate,
        wellnessScore,
        activeGoals,
        averageGoalProgress,
        activitiesToday,
      },
      habits,
      goals,
      activities,
    });
  } catch (error) {
    console.error("Dashboard Controller Error:", error.message);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

module.exports = { getDashboardStats };