const supabase = require("../config/supabase.config");

/* =========================================
   GET ANALYTICS
========================================= */
const getAnalytics = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ status: false, message: "User not authorized" });
    }

    // =============================
    // 1️⃣ Fetch habits
    // =============================
    const { data: habitsData, error: habitError } = await supabase
      .from("habit")
      .select("*")
      .eq("user_id", userId);

    if (habitError) throw habitError;

    const habits = habitsData || [];

    // =============================
    // 2️⃣ Fetch goals
    // =============================
    const { data: goalsData, error: goalError } = await supabase
      .from("goal")
      .select("*")
      .eq("user_id", userId);

    if (goalError) throw goalError;

    const goals = goalsData || [];

    // =============================
    // 3️⃣ Category stats (Pie chart)
    // =============================
    const categoryMap = {};
    habits.forEach((h) => {
      const cat = h.category || "General";
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });
    const categoryStats = Object.keys(categoryMap).map((key) => ({
      category: key,
      count: categoryMap[key],
    }));

    // =============================
    // 4️⃣ Weekly completion stats (Bar chart)
    // =============================
    const today = new Date();
    const weekStart = new Date();
    weekStart.setDate(today.getDate() - 6); // last 7 days

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyStats = days.map((day, index) => ({ day, completed: 0 }));

    habits.forEach((h) => {
      if (h.last_completed_date) {
        const d = new Date(h.last_completed_date);
        if (d >= weekStart) {
          const dayIndex = d.getDay();
          weeklyStats[dayIndex].completed += 1;
        }
      }
    });

    // =============================
    // 5️⃣ Streak vs Goal (Bar chart)
    // =============================
    const streakStats = habits.map((h) => ({
      title: h.title,
      streak: h.streak || 0,
      goal_amount: h.goal_amount || 0,
    }));

    // =============================
    // 6️⃣ Summary
    // =============================
    const totalHabits = habits.length;
    const completedToday = habits.filter(
      (h) =>
        h.last_completed_date &&
        new Date(h.last_completed_date).toDateString() === today.toDateString()
    ).length;
    const totalStreaks = habits.reduce((acc, h) => acc + (h.streak || 0), 0);
    const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;

    const summary = {
      totalHabits,
      totalCompleted: completedToday,
      totalStreaks,
      completionRate,
      totalGoals: goals.length,
    };

    // =============================
    // 7️⃣ Send response
    // =============================
    res.status(200).json({
      summary,
      categoryStats,
      weeklyStats,
      streakStats,
      habits,
      goals,
    });

  } catch (error) {
    console.error("Analytics Error:", error);
    res.status(500).json({ status: false, message: "Analytics failed", error: error.message });
  }
};

module.exports = { getAnalytics };