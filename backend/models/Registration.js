const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({

    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    activity: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Activity",
        required: true
    },

    registeredAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model(
    "Registration",
    registrationSchema
);