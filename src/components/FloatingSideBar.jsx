import { useState } from "react";
import { Link } from "react-router-dom";
import "./FloatingSideBar.css";

export function FloatingSideBar() {

  // persist collapsed state across route changes until user toggles
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem("floatingSidebarCollapsed");
      return stored ? JSON.parse(stored) : false;
    } catch (e) {
      return false;
    }
  });

  return (
    <div className={collapsed ? "sidebar collapsed" : "sidebar"}>

      {/* TOGGLE BUTTON */}
      <button
        className="toggle-btn"
        onClick={() => {
          const next = !collapsed;
          try { localStorage.setItem("floatingSidebarCollapsed", JSON.stringify(next)); } catch (e) {}
          setCollapsed(next);
        }}
      >
        ☰
      </button>

      <ul>

        <li>
          <Link to="/dashboard">
            <span className="icon">🏠</span>
            {!collapsed && "Dashboard"}
          </Link>
        </li>

        <li>
          <Link to="/services">
            <span className="icon">🛠</span>
            {!collapsed && "Services"}
          </Link>
        </li>

        <li>
          <Link to="/reports">
            <span className="icon">📊</span>
            {!collapsed && "Reports"}
          </Link>
        </li>

        <li>
          <Link to="/customers">
            <span className="icon">👥</span>
            {!collapsed && "Clients"}
          </Link>
        </li>

        <li>
          <Link to="/appointments">
            <span className="icon">📅</span>
            {!collapsed && "Appointments"}
          </Link>
        </li>

        <li>
          <Link to="/profile">
            <span className="icon">👤</span>
            {!collapsed && "Profile"}
          </Link>
        </li>

        <li>
          <Link to="/paymenthistory">
            <span className="icon">💸</span>
            {!collapsed && "Billing"}
          </Link>
        </li>

        <li>
          <Link to="/support">
            <span className="icon">👨🏿‍💻</span>
            {!collapsed && "Support"}
          </Link>
        </li>

        <li>
          <Link to="/staff">
            <span className="icon">👥</span>
            {!collapsed && "Staff"}
          </Link>
        </li>

        <li>
          <Link to="/settings">
            <span className="icon">⚙️</span>
            {!collapsed && "Settings"}
          </Link>
        </li>

      </ul>

    </div>
  );
}
