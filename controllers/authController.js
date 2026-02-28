const supabase = require("../config/supabase.config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ status: false, message: "All fields are required" });
    }
    

    const { data: existing, error: fetchError } = await supabase.from("usermodel").select("*").eq("email", email).maybeSingle();
    if (fetchError) return res.status(500).json({ status: false, message: "Database error" });
    if (existing) return res.status(409).json({ status: false, message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const { error: insertError } = await supabase.from("usermodel").insert([{ name, email, password: hashedPassword }]);
    if (insertError) {
  console.error("Supabase insert error:", insertError);
  return res.status(500).json({ status: false, message: insertError.message });
}
    res.status(201).json({ status: true, message: "Signup successful" });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ status: false, message: "All fields are required" });

    const { data: user, error } = await supabase.from("usermodel").select("*").eq("email", email).maybeSingle();
    if (error) return res.status(500).json({ status: false, message: "Database error" });
    if (!user) return res.status(404).json({ status: false, message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ status: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET,{ expiresIn: "7d" });
    res.status(200).json({ status: true, message: "Login successful", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ status: false, message: "Internal server error" });
  }
};

module.exports = { signup, login };