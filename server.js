require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

const authRoutes = require("./routes/authRoutes");
const goalRoutes = require("./routes/goalRoutes");
const habitRoutes = require("./routes/habitRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const activityRoutes = require("./routes/activityRoutes");
const PORT = process.env.PORT || 6000;

const allowedOrigins = [
  "https://healthyhabitstracker-frontendrepo-sx2k-k6ujcfgs0.vercel.app"
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like Postman or server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true); // allow this origin
    } else {
      callback(new Error("Not allowed by CORS")); // block others
    }
  },
  credentials: true
}));
app.use(express.json());

// Routes (unchanged)
app.use("/auth", authRoutes);
app.use("/goals", goalRoutes);
app.use("/habits", habitRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/activity", activityRoutes);

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