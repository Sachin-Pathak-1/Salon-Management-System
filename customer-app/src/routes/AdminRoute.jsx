import { Navigate } from "react-router-dom";

export function AdminRoute({ children }) {

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (!token || !user) {
    return <Navigate to="/" />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/staff-dashboard" />;
  }

  return children;
}
