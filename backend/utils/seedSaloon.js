const mongoose = require("mongoose");
const path = require("path");
const SaloonService = require("../models/SaloonService");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const maleServices = [
    { name: "Hair Cut", duration: 20, price: 100, gender: "Male" },
    { name: "Beard Trim", duration: 10, price: 50, gender: "Male" },
    { name: "Hair + Beard", duration: 30, price: 130, gender: "Male" },
    { name: "Facial", duration: 45, price: 300, gender: "Male" },
    { name: "Clean Up", duration: 30, price: 200, gender: "Male" },
    { name: "Detan", duration: 15, price: 100, gender: "Male" },
    { name: "Hair Spa", duration: 45, price: 350, gender: "Male" },
    { name: "Head Massage", duration: 20, price: 120, gender: "Male" }
];

const femaleServices = [
    { name: "Eyebrows", duration: 7, price: 50, gender: "Female" },
    { name: "Face Threading", duration: 15, price: 60, gender: "Female" },
    { name: "Hand Wax + Underarm", duration: 20, price: 350, gender: "Female" },
    { name: "Underarm Wax", duration: 10, price: 100, gender: "Female" },
    { name: "Leg Wax Half", duration: 30, price: 400, gender: "Female" },
    { name: "Leg Wax Full", duration: 45, price: 600, gender: "Female" },
    { name: "Hair Cut Straight", duration: 20, price: 150, gender: "Female" },
    { name: "U Cut", duration: 25, price: 250, gender: "Female" },
    { name: "Step Cut", duration: 30, price: 350, gender: "Female" },
    { name: "Layer Cut", duration: 30, price: 300, gender: "Female" },
    { name: "Hair Spa Normal", duration: 45, price: 600, gender: "Female" },
    { name: "Loreal Spa", duration: 60, price: 1200, gender: "Female" },
    { name: "Premium Smooth Spa", duration: 60, price: 1400, gender: "Female" },
    { name: "Bleach Face", duration: 30, price: 500, gender: "Female" },
    { name: "Detan Face", duration: 15, price: 500, gender: "Female" },
    { name: "Facial", duration: 45, price: 500, gender: "Female" }, // User said 500+ but I'll use 500
    { name: "Clean Up", duration: 30, price: 400, gender: "Female" },
    { name: "Hair Wash", duration: 10, price: 150, gender: "Female" },
    { name: "Head Massage", duration: 20, price: 300, gender: "Female" }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected for seeding");

        await SaloonService.deleteMany({});
        console.log("Old services cleared");

        await SaloonService.insertMany([...maleServices, ...femaleServices]);
        console.log("Services seeded successfully");

        process.exit();
    } catch (error) {
        console.error("Error seeding DB:", error);
        process.exit(1);
    }
};

seedDB();
