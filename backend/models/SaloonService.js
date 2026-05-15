const mongoose = require("mongoose");

const saloonServiceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    gender: {
        type: String,
        enum: ["Male", "Female"],
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model("SaloonService", saloonServiceSchema);
