import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their appropriate dashboard if unauthorized for this route
    const roleRoutes = {
      student: "/student",
      attender: "/attender",
      admin: "/admin",
      superadmin: "/superadmin",
    };
    return <Navigate to={roleRoutes[role] || "/"} replace />;
  }

  return children;
};

export default ProtectedRoute;
