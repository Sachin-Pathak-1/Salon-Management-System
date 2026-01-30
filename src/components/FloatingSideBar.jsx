import { useState } from "react";
import { Link } from "react-router-dom";
import "./FloatingSideBar.css";

export function FloatingSideBar() {

  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={collapsed ? "sidebar collapsed" : "sidebar"}>

      {/* TOGGLE BUTTON */}
      <button
        className="toggle-btn"
        onClick={() => setCollapsed(!collapsed)}
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

      </ul>

    </div>
  );
}
