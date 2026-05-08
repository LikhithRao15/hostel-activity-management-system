const express = require("express");

const router = express.Router();

const Registration =
    require("../models/Registration");

const Attendance =
    require("../models/Attendance");

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

            // Total registrations

            const totalRegistrations =
                await Registration.countDocuments();

            // Present count

            const presentCount =
                await Attendance.countDocuments({
                    status: "Present"
                });

            // Absent count

            const absentCount =
                await Attendance.countDocuments({
                    status: "Absent"
                });

            // Attendance details

            const attendanceDetails =
                await Attendance.find()
                    .populate({
                        path: "registration",
                        populate: [
                            {
                                path: "student",
                                select: "name email"
                            },
                            {
                                path: "activity",
                                select:
                                    "activityName venue"
                            }
                        ]
                    });

            res.json({

                totalRegistrations,

                presentCount,

                absentCount,

                attendanceDetails

            });

        } catch (error) {

            res.status(500).json({
                message: error.message
            });
        }
    }
);

module.exports = router;