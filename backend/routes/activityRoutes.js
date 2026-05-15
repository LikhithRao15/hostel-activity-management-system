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

// Update Activity
router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "superadmin"),
    async (req, res) => {
        try {
            const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json({ message: "Activity Updated", activity });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

// Delete Activity
router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin", "superadmin"),
    async (req, res) => {
        try {
            await Activity.findByIdAndDelete(req.params.id);
            res.json({ message: "Activity Deleted" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

module.exports = router;