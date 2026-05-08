const express = require("express");

const router = express.Router();

const Activity = require("../models/Activity");
const Registration = require("../models/Registration");

const authMiddleware = require("../middleware/authMiddleware");

const roleMiddleware = require("../middleware/roleMiddleware");

router.post(
    "/create",
    authMiddleware,
roleMiddleware("admin", "superadmin"),
    async (req, res) => {

        try {

            const {
                activityName,
                venue,
                timing,
                capacity
            } = req.body;

            const activity = await Activity.create({
                activityName,
                venue,
                timing,
                capacity
            });

            res.status(201).json({
                message: "Activity Created",
                activity
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

            const activities = await Activity.find().lean();
            const activitiesWithCount = await Promise.all(
                activities.map(async (activity) => {
                    const registeredCount = await Registration.countDocuments({ activity: activity._id });
                    return { ...activity, registeredCount };
                })
            );

            res.json(activitiesWithCount);

        } catch (error) {

            res.status(500).json({
                message: error.message
            });
        }
    }
);

module.exports = router;