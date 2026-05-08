const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({

    registration: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Registration",
        required: true
    },

    status: {
        type: String,
        enum: ["Present", "Absent"],
        required: true
    },

    markedAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model(
    "Attendance",
    attendanceSchema
);