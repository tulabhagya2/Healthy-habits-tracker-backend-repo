const supabase = require("../config/supabase.config");

/* ============================= */
/* GET DASHBOARD STATS */
/* ============================= */
const getDashboardStats = async (req, res) => {
  try {
    const categoryFilter = req.query.category || "all";
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: "User not authorized",
      });
    }

    /* ============================= */
    /* 1️⃣ Fetch Habits */
    /* ============================= */
    let habitQuery = supabase
      .from("habit")
      .select("*")
      .eq("user_id", userId);

    if (categoryFilter !== "all") {
      habitQuery = habitQuery.eq("category", categoryFilter);
    }

    const { data: habitsData, error: habitError } = await habitQuery;
    if (habitError) throw habitError;

    const habits = habitsData || [];

    /* ============================= */
    /* 2️⃣ Fetch Goals */
    /* ============================= */
    let goalQuery = supabase
      .from("goal")
      .select("*")
      .eq("user_id", userId);

    if (categoryFilter !== "all") {
      goalQuery = goalQuery.eq("category", categoryFilter);
    }

    const { data: goalsData, error: goalError } = await goalQuery;
    if (goalError) throw goalError;

    const goals = goalsData || [];

    /* ============================= */
    /* 3️⃣ Calculate Stats */
    /* ============================= */
    let dailyCompletions = 0;
    let weeklyCompletions = 0;
    let longestStreak = 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    habits.forEach((h) => {
      if (h.last_completed_date) {
        const completedDate = new Date(h.last_completed_date);
        completedDate.setHours(0, 0, 0, 0);

        if (completedDate.getTime() === today.getTime())
          dailyCompletions++;

        if (completedDate >= weekStart)
          weeklyCompletions++;

        if (h.streak && h.streak > longestStreak)
          longestStreak = h.streak;
      }
    });

    /* ============================= */
    /* 4️⃣ Goal Stats */
    /* ============================= */
    const activeGoals = goals.filter(
      (g) => g.status === "pending"
    ).length;

    const averageGoalProgress =
      goals.length > 0
        ? Math.round(
            goals.reduce((acc, g) => {
              if (!g.target_amount || g.target_amount === 0) {
                return acc;
              }

              const progress =
                (g.current_amount / g.target_amount) * 100;

              return acc + progress;
            }, 0) / goals.length
          )
        : 0;

    const completionRate =
      habits.length > 0
        ? Math.round((dailyCompletions / habits.length) * 100)
        : 0;

    const wellnessScore = Math.round(
      (completionRate + averageGoalProgress) / 2
    );

    /* ============================= */
    /* 5️⃣ Send Response */
    /* ============================= */
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
        activitiesToday: 0, // since activity removed
      },
      habits,
      goals,
      activities: [], // no activity table
    });

  } catch (error) {
    console.error("Dashboard Controller Error:", error);

    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports = { getDashboardStats };