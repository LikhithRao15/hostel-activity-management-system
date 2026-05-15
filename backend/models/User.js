const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    usn: String,
    hostelName: String,
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"]
    },
    phoneNumber: String,

    role: {
        type: String,
        enum: ["student", "attender", "admin", "superadmin"],
        default: "student"
    }
});

module.exports = mongoose.model("User", userSchema);