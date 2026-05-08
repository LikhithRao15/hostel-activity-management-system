const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({

    activityName: {
        type: String,
        required: true
    },

    venue: {
        type: String,
        required: true
    },

    timing: {
        type: String,
        required: true
    },

    capacity: {
        type: Number,
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model(
    "Activity",
    activitySchema
);