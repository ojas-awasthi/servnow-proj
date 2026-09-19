import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function RoleRoute({ allowedRoles }) {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;