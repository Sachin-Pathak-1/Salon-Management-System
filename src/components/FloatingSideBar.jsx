import { useState } from "react";
import { Link } from "react-router-dom";

export function FloatingSideBar({ currentUser }) {
  const isAdmin = currentUser?.role === "admin";
  const dashboardLink = isAdmin ? "/dashboard" : "/staff-dashboard";
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`
        fixed top-20 left-4 h-[calc(100vh-6rem)]
        ${open ? "w-56" : "w-17"}
        bg-[#f7eef6]
        rounded-2xl shadow-xl
        transition-all duration-300
        flex flex-col
        z-50
      `}
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

        <Item to={dashboardLink} icon="🏠" label="Dashboard" open={open} />
        <Item to="/services" icon="🛠️" label="Services" open={open} />
        <Item to="/appointments" icon="📅" label="Appointments" open={open} />

        {isAdmin && <Item to="/customers" icon="👥" label="Clients" open={open} />}
        {isAdmin && <Item to="/staff" icon="👥" label="Staff" open={open} />}
        {isAdmin && <Item to="/plans" icon="📋" label="Plans" open={open} />}
        {isAdmin && <Item to="/reports" icon="📊" label="Reports" open={open} />}
        {isAdmin && <Item to="/paymenthistory" icon="💸" label="Billing" open={open} />}

        <Item to="/profilepage" icon="👤" label="Profile" open={open} />

        {isAdmin && <Item to="/settings" icon="⚙️" label="Settings" open={open} />}

        <Item to="/support" icon="👨🏿‍💻" label="Support" open={open} />
      </ul>
    </div>
  );
}

function Item({ to, icon, label, open }) {
  return (
    <li>
      <Link
        to={to}
        className={`
          flex items-center gap-4
          rounded-xl px-3 py-2
          text-gray-700
          hover:bg-white hover:shadow
          transition-all duration-300
          
        `}
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
