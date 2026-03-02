require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const authRoutes = require("./routes/authRoutes");
const goalRoutes = require("./routes/goalRoutes");
const habitRoutes = require("./routes/habitRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const PORT = process.env.PORT || 6000;

    
app.use(cors({
  origin: [
    "http://localhost:5173", 
    "https://healthyhabitstracker-frontendrepo.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

// Routes (unchanged)
app.use("/auth", authRoutes);
app.use("/goals", goalRoutes);
app.use("/habits", habitRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/analytics", analyticsRoutes);


// DB check (unchanged)
const checkDBConnection = require("./utils/dbHealthCheck");

app.listen(PORT, async () => {
    const isConnected = await checkDBConnection();
    if (!isConnected) {
        console.log("Server not started due to DB connection failure");
        process.exit(1);
    }
    console.log(`Server is listening on port ${PORT}`);
});