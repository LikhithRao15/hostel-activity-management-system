const express = require("express");

const router = express.Router();

const Registration = require("../models/Registration");

const Activity = require("../models/Activity");

const authMiddleware = require("../middleware/authMiddleware");

router.post(
    "/register",
    authMiddleware,
    async (req, res) => {

        try {

            const { activityId } = req.body;

            const studentId = req.user.id;

            // Check activity exists

            const activity = await Activity.findById(activityId);

            if (!activity) {
                return res.status(404).json({
                    message: "Activity not found"
                });
            }

            // Check capacity
            const registeredCount = await Registration.countDocuments({ activity: activityId });
            if (registeredCount >= activity.capacity) {
                return res.status(400).json({
                    message: "Activity is fully booked"
                });
            }

            // Prevent duplicate registration

            const existingRegistration =
                await Registration.findOne({
                    student: studentId,
                    activity: activityId
                });

            if (existingRegistration) {
                return res.status(400).json({
                    message: "Already registered"
                });
            }

            // Save registration

            const registration =
                await Registration.create({
                    student: studentId,
                    activity: activityId
                });

            res.status(201).json({
                message: "Registration Successful",
                registration
            });

        } catch (error) {

            res.status(500).json({
                message: error.message
            });
        }
    }
);

router.get(
    "/my-registrations",
    authMiddleware,
    async (req, res) => {

        try {

            const registrations =
                await Registration.find({
                    student: req.user.id
                })
                .populate("activity");

            res.json(registrations);

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
            const { facility } = req.query;
            let query = {};
            
            if (facility && facility !== "Saloon") {
                const activity = await Activity.findOne({ activityName: facility });
                if (activity) {
                    query.activity = activity._id;
                }
            }

            const registrations = await Registration.find(query)
                .populate("student", "name usn email")
                .populate("activity", "activityName venue");

            res.json(registrations);

        } catch (error) {

            res.status(500).json({
                message: error.message
            });
        }
    }
);

module.exports = router;