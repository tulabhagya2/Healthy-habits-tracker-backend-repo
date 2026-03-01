require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const authRoutes = require("./routes/authRoutes");
const goalRoutes = require("./routes/goalRoutes");
const habitRoutes = require("./routes/habitRoutes");
const dashboardRoutes=require("./routes/dashboardRoutes");
const analyticsRoutes=require("./routes/analyticsRoutes");
const activityRoutes = require("./routes/activityRoutes");
const PORT = process.env.PORT || 6000;

app.use(cors({
  origin: "https://tulabhagya2.github.io/Healthyhabitstracker-frontendrepo/",
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/goals", goalRoutes);
app.use("/habits", habitRoutes);
app.use("/dashboard",dashboardRoutes);
app.use("/analytics",analyticsRoutes);
app.use("/activity", activityRoutes);
// DB check
const checkDBConnection = require("./utils/dbHealthCheck");

app.listen(PORT, async () => {
    const isConnected = await checkDBConnection();
    if (!isConnected) {
        console.log("Server not started due to DB connection failure");
        process.exit(1);
    }
    console.log(`Server is listening on port ${PORT}`);
});