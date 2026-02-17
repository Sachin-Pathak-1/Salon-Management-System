import { useState } from "react";
import { Link } from "react-router-dom";

export function FloatingSideBar({ currentUser }) {
  const isAdmin = currentUser?.role === "admin";
  const dashboardLink = isAdmin ? "/dashboard" : "/staff-dashboard";
  const [open, setOpen] = useState(false);

  const hasAccess = (tab) => {
    if (isAdmin) return true;
    return currentUser?.access?.includes(tab) || false;
  };

  return (
    <div
      className={`
        fixed top-35 left-4 max-h-[65%]
        ${open ? "w-56" : "w-17"}
        border rounded-2xl shadow-xl
        transition-all duration-300
        flex flex-col
        z-50
      `}
      style={{ backgroundColor: 'var(--gray-100)', color: 'var(--text)', borderColor: 'var(--border-light)' }}
    >
      {/* TOGGLE */}
      <button
        onClick={() => setOpen(!open)}
        className="text-xl p-4 self-center hover:scale-110 transition"
      >
        ☰
      </button>

      {/* MENU */}
      <ul className="flex flex-col gap-2 mt-4 px-2 overflow-y-auto scrollbar-hide">

        {hasAccess("Dashboard") && <Item to={dashboardLink} icon="🏠" label="Dashboard" open={open} />}
        {hasAccess("Services") && <Item to="/services" icon="🛠️" label="Services" open={open} />}
        {hasAccess("Appointments") && <Item to="/appointments" icon="📅" label="Appointments" open={open} />}
        {hasAccess("Attendance") && <Item to={isAdmin ? "/attendance-report" : "/attendance"} icon="📝" label="Attendance" open={open} />}

        {hasAccess("Clients") && <Item to="/customers" icon="👥" label="Clients" open={open} />}
        {hasAccess("Staff") && <Item to="/staff" icon="👥" label="Staff" open={open} />}
        {hasAccess("Plans") && <Item to="/plans" icon="📋" label="Plans" open={open} />}
        {hasAccess("Reports") && <Item to="/reports" icon="📊" label="Reports" open={open} />}
        {hasAccess("Expenses") && <Item to="/expenses" icon="💳" label="Expenses" open={open} />}
        {hasAccess("Billing") && <Item to="/paymenthistory" icon="💸" label="Billing" open={open} />}

        {hasAccess("Profile") && <Item to="/profile" icon="👤" label="Profile" open={open} />}

        {hasAccess("Settings") && <Item to="/settings" icon="⚙️" label="Settings" open={open} />}

        {hasAccess("Support") && <Item to="/support" icon="👨🏿‍💻" label="Support" open={open} />}
        {hasAccess("Inventory") && <Item to="/inventory" icon="📦" label="Inventory" open={open} />}
      </ul>
    </div >
  );
}

function Item({ to, icon, label, open }) {
  return (
    <li>
      <Link
        to={to}
        className="flex items-center gap-4 rounded-xl px-3 py-2 transition-all duration-300"
        style={{ color: 'var(--text)' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--background)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* ICON */}
        <span className="text-xl w-8 text-center">{icon}</span>

        {/* LABEL */}
        <span
          className={`
            whitespace-nowrap text-sm font-medium
            transition-all duration-300
            ${open ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 w-0 overflow-hidden"}
          `}
        >
          {label}
        </span>
      </Link>
    </li>
  );
}
