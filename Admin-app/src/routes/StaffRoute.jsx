import { Navigate } from "react-router-dom";

export function StaffRoute({ children }) {

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (!token || !user) {
    return <Navigate to="/" />;
  }

  if (user.role !== "staff") {
    return <Navigate to="/dashboard" />;
  }

  return children;
}
