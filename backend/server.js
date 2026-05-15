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
  origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : '*',
  credentials: true,
}));
app.use(express.json());

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
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});