import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

export function ManagerDashboard() {
  const [stats, setStats] = useState({
    todayRevenue: 0,
    appointmentsToday: 0,
    activeStaff: 0,
    servicesCount: 0
  });

  const [loading, setLoading] = useState(true);

  // Theme support
  const [theme] = useState(localStorage.getItem("theme") || "light");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Parallel Fetching for Performance
      const [staffRes, servicesRes] = await Promise.all([
        fetch(`${API_BASE}/staff?salonId=mine`, { headers }),
        fetch(`${API_BASE}/services?salonId=mine`, { headers })
      ]);

      const staffTotal = (await staffRes.json()).length || 0;
      const servicesTotal = (await servicesRes.json()).length || 0;

      // Mocking some "Today" data for UI demonstration
      setStats({
        todayRevenue: 15000,
        appointmentsToday: 12,
        activeStaff: Math.floor(staffTotal * 0.8),
        servicesCount: servicesTotal
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full px-4 md:px-10 py-10" style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Manager Dashboard</h1>
            <p className="text-sm opacity-70">Welcome back, here's what's happening today.</p>
          </div>
          <div className="text-sm px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-medium">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* METRICS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <MetricCard
            title="Today's Revenue"
            value={`₹ ${stats.todayRevenue.toLocaleString()}`}
            icon="💰"
            trend="+12% from yesterday"
            color="bg-green-50 text-green-700"
          />
          <MetricCard
            title="Appointments"
            value={stats.appointmentsToday}
            icon="📅"
            trend="4 pending confirmation"
            color="bg-blue-50 text-blue-700"
          />
          <MetricCard
            title="Active Staff"
            value={stats.activeStaff}
            icon="👥"
            trend={`${stats.activeStaff} / 8 clocked in`}
            color="bg-purple-50 text-purple-700"
          />
          <MetricCard
            title="Total Services"
            value={stats.servicesCount}
            icon="✨"
            trend="Menu active"
            color="bg-orange-50 text-orange-700"
          />
        </div>

        {/* MAIN CONTENT SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: ACTIVITY CHART (Placeholder) */}
          <div className="lg:col-span-2 rounded-2xl p-6 border shadow-sm" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-light)' }}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Weekly Activity</h3>
              <select className="text-sm border rounded px-2 py-1 bg-transparent">
                <option>Last 7 Days</option>
              </select>
            </div>

            <div className="h-64 flex items-end justify-between gap-2 px-4">
              {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                <div key={i} className="w-full bg-blue-500/20 rounded-t hover:bg-blue-500/40 transition-all relative group">
                  <div
                    className="absolute bottom-0 w-full bg-blue-500 rounded-t"
                    style={{ height: `${h}%` }}
                  ></div>
                  <div className="absolute -bottom-6 w-full text-center text-xs opacity-50">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: QUICK ACTIONS */}
          <div className="rounded-2xl p-6 border shadow-sm" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-light)' }}>
            <h3 className="font-bold text-lg mb-6">Quick Actions</h3>

            <div className="space-y-4">
              <ActionButton to="/staff" icon="👥" label="Manage Staff" desc="Add, edit or schedule staff" />
              <ActionButton to="/appointments" icon="📅" label="New Appointment" desc="Book a service for a client" />
              <ActionButton to="/reports" icon="📊" label="View Reports" desc="Check earnings and performance" />
              <ActionButton to="/services" icon="✂️" label="Update Menu" desc="Manage services and pricing" />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, trend, color }) {
  return (
    <div
      className="rounded-2xl p-6 border shadow-sm transition-hover hover:shadow-md"
      style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-light)' }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${color}`}>
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold mb-1">{value}</h3>
      <p className="text-sm opacity-60 font-medium">{title}</p>
    </div>
  );
}

function ActionButton({ to, icon, label, desc }) {
  return (
    <Link to={to} className="flex items-center gap-4 p-4 rounded-xl border hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all group" style={{ borderColor: 'var(--border-light)' }}>
      <div className="text-2xl group-hover:scale-110 transition-transform">{icon}</div>
      <div>
        <h4 className="font-bold text-sm group-hover:text-blue-600">{label}</h4>
        <p className="text-xs opacity-60">{desc}</p>
      </div>
      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">→</div>
    </Link>
  );
}
