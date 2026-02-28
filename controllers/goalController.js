const supabase = require("../config/supabase.config");

/* ============================= */
/* CREATE GOAL */
/* ============================= */
const createGoal = async (req, res) => {
  try {
    const { title, description, category, targetAmount } = req.body;

    if (!title || !targetAmount) {
      return res.status(400).json({
        status: false,
        message: "Title and Target Amount are required",
      });
    }

    const { data, error } = await supabase
      .from("goal")
      .insert([
        {
          user_id: req.user.id,
          title,
          description: description || "",
          category: category || "General",
          target_amount: targetAmount,
          current_amount: 0,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      status: true,
      message: "Goal created successfully",
      goal: data,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

/* ============================= */
/* GET GOALS */
/* ============================= */
const getGoals = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("goal")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({
      status: true,
      goals: data,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

/* ============================= */
/* UPDATE GOAL PROGRESS */
/* ============================= */
const updateGoalProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (amount == null) {
      return res.status(400).json({
        status: false,
        message: "Amount is required",
      });
    }

    const { data: goal, error: fetchError } = await supabase
      .from("goal")
      .select("*")
      .eq("id", id)
      .eq("user_id", req.user.id)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!goal) {
      return res.status(404).json({
        status: false,
        message: "Goal not found",
      });
    }

    const newAmount = Number(goal.current_amount) + Number(amount);
    const status = newAmount >= goal.target_amount ? "completed" : "pending";

    const { data, error } = await supabase
      .from("goal")
      .update({
        current_amount: newAmount,
        status,
        updated_at: new Date(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      status: true,
      message: "Goal progress updated",
      goal: data,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  createGoal,
  getGoals,
  updateGoalProgress,
};