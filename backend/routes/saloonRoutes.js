const express = require("express");
const router = express.Router();
const SaloonService = require("../models/SaloonService");
const SaloonBooking = require("../models/SaloonBooking");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// --- Service CRUD (Admin Only) ---

// Create Service
router.post("/services", authMiddleware, roleMiddleware("admin"), async (req, res) => {
    try {
        const service = await SaloonService.create(req.body);
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get All Services (or filter by gender)
router.get("/services", authMiddleware, async (req, res) => {
    try {
        const { gender } = req.query;
        let query = {};
        if (gender && gender !== "undefined" && gender !== "null") {
            query.gender = gender;
        }
        const services = await SaloonService.find(query);
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update Service
router.put("/services/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
    try {
        const service = await SaloonService.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete Service
router.delete("/services/:id", authMiddleware, roleMiddleware("admin"), async (req, res) => {
    try {
        await SaloonService.findByIdAndDelete(req.params.id);
        res.json({ message: "Service deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- Booking Logic ---

// Get Bookings (Admin sees all, User sees own)
router.get("/bookings", authMiddleware, async (req, res) => {
    try {
        let query = {};
        if (req.user.role !== "admin" && req.user.role !== "superadmin" && req.user.role !== "attender") {
            query.user = req.user.id;
        }
        
        // Optionally filter by date
        const { date } = req.query;
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }

        const bookings = await SaloonBooking.find(query)
            .populate("user", "name usn gender")
            .populate("service")
            .sort({ startTime: 1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Book Appointment
router.post("/book", authMiddleware, async (req, res) => {
    try {
        const { serviceId, startTime, date } = req.body;
        const service = await SaloonService.findById(serviceId);
        if (!service) return res.status(404).json({ message: "Service not found" });

        const start = new Date(startTime);
        const end = new Date(start.getTime() + service.duration * 60000);

        // Check if within 6:45 PM - 9:00 PM
        const bookingDate = new Date(date);
        const limitStart = new Date(bookingDate);
        limitStart.setHours(18, 45, 0, 0);
        const limitEnd = new Date(bookingDate);
        limitEnd.setHours(21, 0, 0, 0);

        if (start < limitStart || end > limitEnd) {
            return res.status(400).json({ message: "Booking must be between 6:45 PM and 9:00 PM" });
        }

        // Check for overlaps
        const overlapping = await SaloonBooking.findOne({
            date: { 
                $gte: new Date(bookingDate.setHours(0,0,0,0)), 
                $lte: new Date(bookingDate.setHours(23,59,59,999)) 
            },
            $or: [
                { startTime: { $lt: end, $gte: start } },
                { endTime: { $gt: start, $lte: end } },
                { startTime: { $lte: start }, endTime: { $gte: end } }
            ]
        });

        if (overlapping) {
            return res.status(400).json({ message: "This slot is already booked" });
        }

        const booking = await SaloonBooking.create({
            user: req.user.id,
            service: serviceId,
            startTime: start,
            endTime: end,
            date: new Date(date),
            status: "Pending"
        });

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Mark Attendance (Barber/Attender/Admin)
router.put("/attendance/:id", authMiddleware, async (req, res) => {
    try {
        if (!["admin", "superadmin", "attender"].includes(req.user.role)) {
            return res.status(403).json({ message: "Unauthorized" });
        }
        const { status } = req.body;
        const booking = await SaloonBooking.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
