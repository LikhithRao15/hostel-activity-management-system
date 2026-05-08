const roleMiddleware = (...allowedRoles) => {

    return (req, res, next) => {

        try {

            const userRole = req.user.role;

            if (!allowedRoles.includes(userRole)) {

                return res.status(403).json({
                    message:
                    "Access Denied"
                });
            }

            next();

        } catch (error) {

            res.status(500).json({
                message: error.message
            });
        }
    };
};

module.exports = roleMiddleware;