
const supabase = require("../config/supabase.config");

/* ============================= */
/* CREATE HABIT */
/* ============================= */
const createHabit = async (req, res) => {
  try {
    const { title, description, category, goalType, goalAmount } = req.body;

    if (!title || !goalAmount) {
      return res.status(400).json({ status: false, message: "Title and Goal Amount are required" });
    }

    const { data, error } = await supabase
      .from("habit")
      .insert([{
        user_id: req.user.id,
        title,
        description: description || "",
        category: category || "Fitness",
        goal_type: goalType || "daily",
        goal_amount: goalAmount,
        streak: 0,
        last_completed_date: null,
        created_at: new Date(),
        updated_at: new Date(),
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ status: true, message: "Habit created successfully", habit: data });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

/* ============================= */
/* GET HABITS */
/* ============================= */
const getHabits = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("habit")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.status(200).json({ status: true, habits: data });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
}
/* MARK HABIT COMPLETED */
/* ============================= */
const markHabitCompleted = async (req, res) => {
  try {
    const { id } = req.params;

    const { data: habit, error: fetchError } = await supabase
      .from("habit")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!habit) return res.status(404).json({ status: false, message: "Habit not found" });

    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1))
      .toISOString().split("T")[0];

    const lastCompleted = habit.last_completed_date
      ? new Date(habit.last_completed_date).toISOString().split("T")[0]
      : null;

    let newStreak = habit.streak || 0;
    if (lastCompleted === today) {
      return res.status(200).json({ status: true, message: "Habit already completed today", habit });
    }
    if (lastCompleted === yesterday) newStreak += 1;
    else newStreak = 1;

    const { data: updatedHabit, error } = await supabase
      .from("habit")
      .update({ streak: newStreak, last_completed_date: new Date(), updated_at: new Date() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ status: true, message: "Habit marked completed", habit: updatedHabit });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

/* ============================= */
/* DASHBOARD SUMMARY CARDS */
/* ============================= */
const getHabitSummary = async (req, res) => {
  try {
    const { category } = req.query; // filter by category
    let query = supabase.from("habit").select("*").eq("user_id", req.user.id);

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data: habits, error } = await query;
    if (error) throw error;

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday

    let dailyCompleted = 0;
    let weeklyCompleted = 0;
    let longestStreak = 0;

    habits.forEach((habit) => {
      if (!habit.last_completed_date) return;
      const completedDate = new Date(habit.last_completed_date);
      if (completedDate.toDateString() === today.toDateString()) dailyCompleted++;
      if (completedDate >= startOfWeek && completedDate <= endOfWeek) weeklyCompleted++;
      if (habit.streak > longestStreak) longestStreak = habit.streak;
    });

    res.status(200).json({
      status: true,
      summary: {
        totalHabits: habits.length,
        dailyCompleted,
        weeklyCompleted,
        longestStreak,
        habits,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: false, message: "Failed to fetch habit summary" });
  }
};

/* ============================= */
/* UPDATE HABIT */
const updateHabit = async (req, res) => {
  try {
    const id = Number(req.params.id); // convert to number
    const { title, description, category, goalType, goalAmount } = req.body;

    // Fetch the habit to ensure it exists
    const { data: habit, error: fetchError } = await supabase
      .from("habit")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!habit) return res.status(404).json({ status: false, message: "Habit not found" });

    // Check if habit belongs to logged-in user
    if (habit.user_id !== req.user.id) {
      return res.status(403).json({ status: false, message: "Unauthorized to update this habit" });
    }

    // Update habit
    const { data: updatedHabit, error } = await supabase
      .from("habit")
      .update({
        title: title || habit.title,
        description: description || habit.description,
        category: category || habit.category,
        goal_type: goalType || habit.goal_type,
        goal_amount: goalAmount || habit.goal_amount,
        updated_at: new Date(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ status: true, message: "Habit updated successfully", habit: updatedHabit });

  } catch (error) {
    console.error("Update Habit Error:", error.message);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

/* ============================= */
/* DELETE HABIT */
/* ============================= */

  const deleteHabit = async (req, res) => {
  try {
    const id = Number(req.params.id); // convert to number

    // Fetch habit first
    const { data: habit, error: fetchError } = await supabase
      .from("habit")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!habit) return res.status(404).json({ status: false, message: "Habit not found" });

    // Check ownership
    if (habit.user_id !== req.user.id) {
      return res.status(403).json({ status: false, message: "Unauthorized to delete this habit" });
    }

    const { error } = await supabase
      .from("habit")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.status(200).json({ status: true, message: "Habit deleted successfully" });

  } catch (error) {
    console.error("Delete Habit Error:", error.message);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};



module.exports = {
  createHabit,
  getHabits,
  updateHabit,
  deleteHabit,
  markHabitCompleted,
  getHabitSummary,
};
