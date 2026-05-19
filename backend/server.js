const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const activityRoutes = require("./routes/activityRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const reportRoutes = require("./routes/reportRoutes");
const saloonRoutes = require("./routes/saloonRoutes");

const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // Automatically allow local development and Vercel subdomains
    if (!origin || origin.startsWith("http://localhost") || origin.endsWith("vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json());
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/auth", authRoutes);

app.use("/api/activity", activityRoutes);

app.use("/api/registration",registrationRoutes);

app.use("/api/attendance",attendanceRoutes);

app.use("/api/report",reportRoutes);
app.use("/api/saloon", saloonRoutes);

app.get("/", (req, res) => {
    res.send("API Running");
});

app.get("/test", (req, res) => {
    res.send("Working");
});

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));
const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;