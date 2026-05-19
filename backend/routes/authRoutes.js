const authMiddleware = require("../middleware/authMiddleware");
const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage })
const router = express.Router();

router.post("/register", async (req, res) => {

    try {

        const { name, email, password, role, usn, hostelName, gender, phoneNumber, facility, accessKey } = req.body;

        const targetRole = role || "student";

        // Validate allowed roles
        const allowedRoles = ["student", "attender", "admin", "superadmin"];
        if (!allowedRoles.includes(targetRole)) {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        // Restrict Super Admin registration
        if (targetRole === "superadmin") {
            return res.status(403).json({ message: "Registration for Super Admin is restricted" });
        }

        // Validate access key for Admin role
        if (targetRole === "admin") {
            const adminKey = process.env.ADMIN_REGISTRATION_KEY || "admin123";
            if (accessKey !== adminKey) {
                return res.status(403).json({ message: "Invalid registration access key for Admin" });
            }
        }

        // Validate access key for Attender role
        if (targetRole === "attender") {
            const attenderKey = process.env.ATTENDER_REGISTRATION_KEY || "attender123";
            if (accessKey !== attenderKey) {
                return res.status(403).json({ message: "Invalid registration access key for Attender" });
            }
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: targetRole,
            usn,
            hostelName,
            gender,
            phoneNumber,
            facility
        });

        res.json(user);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
});

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid password"
            });
        }

        const jwt = require("jsonwebtoken");

        const token = jwt.sign(
            {
                id: user._id,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            message: "Login Successful",
            token,
            user
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });
    }
});

router.get(
    "/profile",
    authMiddleware,
    async (req, res) => {
        try {
            const user = await User.findById(req.user.id).select("-password");
            res.json({
                message: "Protected Profile Route",
                user
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

router.put(
    "/update-profile",
    authMiddleware,
    upload.single("profilePicture"),
    async (req, res) => {
        try {
            const updateData = {};
            if (req.file) {
                updateData.profilePicture = `/uploads/${req.file.filename}`;
            }
            const user = await User.findByIdAndUpdate(req.user.id, updateData, { new: true }).select("-password");
            res.json({ message: "Profile updated successfully", user });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

router.put(
    "/change-password",
    authMiddleware,
    async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            const user = await User.findById(req.user.id);
            
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid current password" });
            }
            
            user.password = await bcrypt.hash(newPassword, 10);
            await user.save();
            
            res.json({ message: "Password updated successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
);

module.exports = router;