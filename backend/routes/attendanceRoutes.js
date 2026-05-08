const express = require("express");

const router = express.Router();

const Attendance = require("../models/Attendance");

const Registration = require("../models/Registration");

const authMiddleware = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

router.post(
    "/mark",
    authMiddleware,
    roleMiddleware(
    "attender",
    "admin",
    "superadmin"
),
    async (req, res) => {

        try {

            const {
                registrationId,
                status
            } = req.body;

            // Check registration exists

            const registration =
                await Registration.findById(
                    registrationId
                );

            if (!registration) {
                return res.status(404).json({
                    message: "Registration not found"
                });
            }

            // Prevent duplicate attendance

            const existingAttendance =
                await Attendance.findOne({
                    registration: registrationId
                });

            if (existingAttendance) {
                return res.status(400).json({
                    message:
                    "Attendance already marked"
                });
            }

            // Create attendance

            const attendance =
                await Attendance.create({
                    registration: registrationId,
                    status
                });

            res.status(201).json({
                message: "Attendance Marked",
                attendance
            });

        } catch (error) {

            res.status(500).json({
                message: error.message
            });
        }
    }
);

router.get(
    "/all",
    authMiddleware,
    async (req, res) => {

        try {

            const attendance =
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

            res.json(attendance);

        } catch (error) {

            res.status(500).json({
                message: error.message
            });
        }
    }
);

module.exports = router;
