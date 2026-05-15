const mongoose = require("mongoose");

const saloonBookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "SaloonService",
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Completed", "No-Show"],
        default: "Pending"
    }
}, { timestamps: true });

module.exports = mongoose.model("SaloonBooking", saloonBookingSchema);
