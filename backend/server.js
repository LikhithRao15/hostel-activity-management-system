const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const activityRoutes = require("./routes/activityRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/activity", activityRoutes);

app.use("/api/registration",registrationRoutes);

app.use("/api/attendance",attendanceRoutes);

app.use("/api/report",reportRoutes);

app.get("/", (req, res) => {
    res.send("API Running");
});

app.get("/test", (req, res) => {
    res.send("Working");
});

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.listen(3000, () => {
    console.log("Server running on port 5000");
});