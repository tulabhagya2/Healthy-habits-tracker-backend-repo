const supabase = require("../config/supabase.config");

const getAnalytics = async (req, res) => {
  try {
    const { data: habits, error } = await supabase
      .from("habit")
      .select("*")
      .eq("user_id", req.user.id);

    if (error) throw error;

    const stats = habits.map((h) => {
      const completionRate = h.goal_amount
        ? Math.min((h.streak / h.goal_amount) * 100, 100)
        : 0;
      return {
        id: h.id,
        title: h.title,
        category: h.category,
        streak: h.streak,
        completionRate,
      };
    });

    res.status(200).json({ status: true, habits: stats });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

module.exports = { getAnalytics };