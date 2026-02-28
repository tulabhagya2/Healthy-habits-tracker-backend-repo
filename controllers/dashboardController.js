const supabase = require("../config/supabase.config");

const getDashboardStats = async (req, res) => {
  try {
    // Fetch all habits for the logged-in user
    const { data: habits, error } = await supabase
      .from("habit")
      .select("*")
      .eq("user_id", req.user.id);

    if (error) throw error;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // reset time to midnight
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    let completedToday = 0;
    let completedWeek = 0;

    habits.forEach((h) => {
      if (h.last_completed_date) {
        const completedDate = new Date(h.last_completed_date);
        completedDate.setHours(0, 0, 0, 0); // reset time to midnight

        if (completedDate.getTime() === today.getTime()) {
          completedToday++;
        }

        if (completedDate >= weekStart) {
          completedWeek++;
        }
      }
    });

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