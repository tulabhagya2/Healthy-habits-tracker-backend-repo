const supabase = require("../config/supabase.config");

// ================= ADD =================
exports.addActivity = async (req, res) => {
  try {
    const { title, description, category, duration } = req.body;

    const { data, error } = await supabase
      .from("activities")
      .insert([
        {
          title,
          description,
          category,
          duration,
          user_id: req.user.id,
        },
      ])
      .select();

    if (error) throw error;

    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= GET =================
exports.getActivities = async (req, res) => {
  try {
    let query = supabase.from("activities").select("*");

    if (req.user.role !== "admin") {
      query = query.eq("user_id", req.user.id);
    }

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= UPDATE =================
exports.updateActivity = async (req, res) => {
  try {
    const { id } = req.params;

    let query = supabase
      .from("activities")
      .update(req.body)
      .eq("id", id);

    if (req.user.role !== "admin") {
      query = query.eq("user_id", req.user.id);
    }

    const { data, error } = await query.select();

    if (error) throw error;

    if (!data.length) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ================= DELETE =================
exports.deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    let query = supabase
      .from("activities")
      .delete()
      .eq("id", id);

    if (req.user.role !== "admin") {
      query = query.eq("user_id", req.user.id);
    }

    const { error } = await query;

    if (error) throw error;

    res.json({ message: "Activity deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};