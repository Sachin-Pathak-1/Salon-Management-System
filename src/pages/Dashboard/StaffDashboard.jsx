import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/dashboard";

export function StaffDashboard() {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    completed: 0,
    pending: 0,
    totalServices: 0,
  });

  const [popularServices, setPopularServices] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
  try {
    const token = localStorage.getItem("staffToken"); // ✅ FIXED

    if (!token) {
      throw new Error("No staff token found");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const [statsRes, popularRes, activityRes] = await Promise.all([
      fetch(`${API}/staff-stats`, { headers }),
      fetch(`${API}/popular-services`, { headers }),
      fetch(`${API}/recent-activity`, { headers }),
    ]);

    if (!statsRes.ok || !popularRes.ok || !activityRes.ok) {
      throw new Error("Unauthorized or API error");
    }

    const statsData = await statsRes.json();
    const popularData = await popularRes.json();
    const activityData = await activityRes.json();

    setStats({
      todayAppointments: statsData.todayAppointments ?? 0,
      completed: statsData.completed ?? 0,
      pending: statsData.pending ?? 0,
      totalServices: statsData.totalServices ?? 0,
    });

    setPopularServices(Array.isArray(popularData) ? popularData : []);
    setRecentActivity(Array.isArray(activityData) ? activityData : []);

  } catch (err) {
    console.error("Dashboard load failed:", err);
    setPopularServices([]);
    setRecentActivity([]);
  } finally {
    setLoading(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] px-4 py-10">
      <div className="max-w-4xl mx-auto flex flex-col gap-10">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          <p className="text-white/80">
            Overview of salon activities and services
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Today's Appointments" value={stats.todayAppointments} icon="📅" />
          <StatCard title="Completed Services" value={stats.completed} icon="✅" />
          <StatCard title="Pending Services" value={stats.pending} icon="⏳" />
          <StatCard title="Total Services" value={stats.totalServices} icon="💼" />
        </div>

        {/* TABLES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* POPULAR SERVICES */}
          <div className="bg-white p-8 rounded-lg border border-[var(--border-light)] shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-[var(--text)]">Popular Services</h2>

            {popularServices.length === 0 ? (
              <p className="text-sm text-center text-[var(--gray-700)]">
                No data available
              </p>
            ) : (
              <div className="space-y-3">
                {popularServices.map((s, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-[var(--gray-50)] p-3 rounded-md border border-[var(--border-light)]"
                  >
                    <span className="font-medium text-[var(--text)]">{s.name}</span>
                    <span className="bg-[var(--primary)] text-white px-2 py-1 rounded-full text-xs font-bold">{s.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECENT ACTIVITY */}
          <div className="bg-[var(--gray-100)] p-8 rounded-lg border border-[var(--border-light)]">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>

            {recentActivity.length === 0 ? (
              <p className="text-sm text-center text-[var(--gray-700)]">
                No recent activity
              </p>
            ) : (
              recentActivity.map((a, i) => (
                <div
                  key={i}
                  className="flex justify-between border-t border-[var(--border-light)] py-2 text-sm"
                >
                  <div>
                    <div className="font-semibold">{a.customer}</div>
                    <small className="text-gray-400">{a.action}</small>
                  </div>
                  <span>{a.time}</span>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

/* COMPONENTS */

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white border border-[var(--border-light)] rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-2">{icon}</div>
      <p className="text-sm text-[var(--gray-700)]">{title}</p>
      <h2 className="text-3xl font-bold text-[var(--primary)]">{value}</h2>
    </div>
  );
}
