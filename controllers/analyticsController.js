const supabase = require("../config/supabase.config");

const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch habits
    const { data: habits, error: habitError } = await supabase
      .from("habit")
      .select("*")
      .eq("user_id", userId);

    if (habitError) throw habitError;

    // Fetch activities linked to habits
    const { data: activities, error: activityError } = await supabase
      .from("activity")
      .select("*")
      .eq("user_id", userId);

    if (activityError) throw activityError;

    // Calculate weekly trend (Monday-Sunday)
    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weeklyTrend = weekDays.map((day) => {
      const dayCount = activities.filter((a) => {
        const aDate = new Date(a.created_at);
        return aDate.toLocaleString("en-US", { weekday: "short" }) === day;
      }).length;
      return { name: day, completions: dayCount };
    });

    // Monthly goal progress (example: split activities into 4 weeks)
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const monthlyGoalProgress = [1, 2, 3, 4].map((weekNum) => {
      const startDay = (weekNum - 1) * 7 + 1;
      const endDay = startDay + 6;
      const progressCount = activities.filter((a) => {
        const aDate = new Date(a.created_at);
        return (
          aDate.getMonth() === currentMonth &&
          aDate.getFullYear() === currentYear &&
          aDate.getDate() >= startDay &&
          aDate.getDate() <= endDay
        );
      }).length;
      return { name: `Week ${weekNum}`, progress: progressCount };
    });

    // Best and worst habits by completion
    const habitStats = habits.map((h) => {
      const linkedActivities = activities.filter((a) => a.habit_id === h.id);
      const completionRate = h.goal_amount
        ? Math.min((linkedActivities.length / h.goal_amount) * 100, 100)
        : 0;
      return {
        id: h.id,
        title: h.title,
        category: h.category,
        completion_rate: Math.round(completionRate),
      };
    });

    const bestHabits = habitStats
      .sort((a, b) => b.completion_rate - a.completion_rate)
      .slice(0, 5);
    const worstHabits = habitStats
      .sort((a, b) => a.completion_rate - b.completion_rate)
      .slice(0, 5);

    // Summary stats
    const totalHabits = habits.length;
    const completedToday = activities.filter(
      (a) => new Date(a.created_at).toDateString() === new Date().toDateString()
    ).length;
    const activeGoals = habits.filter((h) => h.goal_amount > 0).length;
    const avgCompletionRate =
      habitStats.reduce((acc, h) => acc + h.completion_rate, 0) /
      (habitStats.length || 1);

    res.status(200).json({
      weekly_trend: weeklyTrend,
      monthly_goal_progress: monthlyGoalProgress,
      best_habits: bestHabits,
      worst_habits: worstHabits,
      total_habits: totalHabits,
      completed_today: completedToday,
      active_goals: activeGoals,
      avg_completion_rate: Math.round(avgCompletionRate),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { getAnalytics };