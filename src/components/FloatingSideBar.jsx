import { useState } from "react";
import { Link } from "react-router-dom";
import "./FloatingSideBar.css";

export function FloatingSideBar({ currentUser }) {

  const isAdmin = currentUser?.role === "admin";

  const [collapsed, setCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem("floatingSidebarCollapsed");
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  const dashboardLink = isAdmin ? "/dashboard" : "/staff-dashboard";

  return (
    <div className={collapsed ? "sidebar collapsed" : "sidebar"}>

      {/* TOGGLE */}
      <button
        className="toggle-btn"
        onClick={() => {
          const next = !collapsed;
          localStorage.setItem("floatingSidebarCollapsed", JSON.stringify(next));
          setCollapsed(next);
        }}
      >
        ☰
      </button>

      <ul>

        {/* DASHBOARD */}
        <li>
          <Link to={dashboardLink}>
            <span className="icon">🏠</span>
            {!collapsed && "Dashboard"}
          </Link>
        </li>

        {/* SERVICES (BOTH) */}
        <li>
          <Link to="/services">
            <span className="icon">🛠</span>
            {!collapsed && "Services"}
          </Link>
        </li>

        {/* APPOINTMENTS (BOTH) */}
        <li>
          <Link to="/appointments">
            <span className="icon">📅</span>
            {!collapsed && "Appointments"}
          </Link>
        </li>

        {/* CLIENTS (ADMIN ONLY) */}
        {isAdmin && (
          <li>
            <Link to="/customers">
              <span className="icon">👥</span>
              {!collapsed && "Clients"}
            </Link>
          </li>
        )}

        {/* STAFF (ADMIN ONLY) */}
        {isAdmin && (
          <li>
            <Link to="/staff">
              <span className="icon">👥</span>
              {!collapsed && "Staff"}
            </Link>
          </li>
        )}

        {/* REPORTS (ADMIN ONLY) */}
        {isAdmin && (
          <li>
            <Link to="/reports">
              <span className="icon">📊</span>
              {!collapsed && "Reports"}
            </Link>
          </li>
        )}

        {/* BILLING (ADMIN ONLY) */}
        {isAdmin && (
          <li>
            <Link to="/paymenthistory">
              <span className="icon">💸</span>
              {!collapsed && "Billing"}
            </Link>
          </li>
        )}

        {/* PROFILE (BOTH) */}
        <li>
          <Link to="/profilepage">
            <span className="icon">👤</span>
            {!collapsed && "Profile"}
          </Link>
        </li>

        {/* SETTINGS (ADMIN ONLY) */}
        {isAdmin && (
          <li>
            <Link to="/settings">
              <span className="icon">⚙️</span>
              {!collapsed && "Settings"}
            </Link>
          </li>
        )}

        {/* SUPPORT */}
        <li>
          <Link to="/support">
            <span className="icon">👨🏿‍💻</span>
            {!collapsed && "Support"}
          </Link>
        </li>

      </ul>
    </div>
  );
}
