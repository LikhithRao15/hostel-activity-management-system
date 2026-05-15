const express = require("express");

const router = express.Router();

const Registration =
    require("../models/Registration");

const Attendance =
    require("../models/Attendance");

const SaloonBooking =
    require("../models/SaloonBooking");

const authMiddleware =
    require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

router.get(
    "/daily",
    authMiddleware,
    roleMiddleware(
    "admin",
    "superadmin"
),
    async (req, res) => {

        try {

            // Fetch all registrations with student and activity details
            const registrations = await Registration.find()
                .populate("student", "name usn email")
                .populate("activity", "activityName venue");

            // Fetch all attendance records
            const attendanceRecords = await Attendance.find();
            const attendanceMap = {};
            attendanceRecords.forEach(record => {
                attendanceMap[record.registration.toString()] = record.status;
            });

            // Combine registration and attendance
            const detailedReport = registrations.map(reg => ({
                id: reg._id,
                name: reg.student?.name || "N/A",
                usn: reg.student?.usn || "N/A",
                date: reg.registeredAt,
                facility: reg.activity?.activityName || "N/A",
                status: attendanceMap[reg._id.toString()] || "Absent"
            }));

            // Counts for summary
            const totalRegistrations = detailedReport.length;
            const presentCount = detailedReport.filter(r => r.status === "Present").length;
            const absentCount = detailedReport.filter(r => r.status === "Absent").length;

            // Saloon data
            const saloonBookings = await SaloonBooking.find()
                .populate("user", "name usn")
                .populate("service");

            const saloonStats = {
                total: saloonBookings.length,
                completed: saloonBookings.filter(b => b.status === "Completed").length,
                pending: saloonBookings.filter(b => b.status === "Pending").length,
                noShow: saloonBookings.filter(b => b.status === "No-Show").length
            };

            res.json({
                totalRegistrations,
                presentCount,
                absentCount,
                detailedReport, // This is what the user wants for the table/rows
                saloonBookings,
                saloonStats
            });

        } catch (error) {

            res.status(500).json({
                message: error.message
            });
        }
    }
);

module.exports = router;