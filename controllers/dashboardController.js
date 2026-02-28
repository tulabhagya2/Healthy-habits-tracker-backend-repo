const supabase = require("../config/supabase.config");

const getDashboardStats = async (req, res) => {
  try {
    // Fetch all habits for the logged-in user
    const { data: habits, error } = await supabase
      .from("habit")
      .select("*")
      .eq("user_id", req.user.id);

    if (error) throw error;

    const today = new Date().toISOString().split("T")[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);

    // Convert last_completed_date safely
    const completedToday = habits.filter((h) => {
      if (!h.last_completed_date) return false;
      const date = new Date(h.last_completed_date);
      return date.toISOString().split("T")[0] === today;
    }).length;

    const completedWeek = habits.filter((h) => {
      if (!h.last_completed_date) return false;
      const date = new Date(h.last_completed_date);
      return date >= weekStart;
    }).length;

    const longestStreak = habits.reduce(
      (max, h) => (h.streak > max ? h.streak : max),
      0
    );

    res.status(200).json({
      status: true,
      data: {
        totalHabits: habits.length,
        completedToday,
        completedWeek,
        longestStreak,
        habits,
      },
    });
  } catch (error) {
    console.error("Dashboard controller error:", error.message);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

module.exports = { getDashboardStats };