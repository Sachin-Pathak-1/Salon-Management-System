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

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No token found");
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Today's Appointments" value={stats.todayAppointments} icon="📅" />
          <StatCard title="Completed Services" value={stats.completed} icon="✅" />
          <StatCard title="Pending Services" value={stats.pending} icon="⏳" />
          <StatCard title="Total Services" value={stats.totalServices} icon="💼" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <DashboardTable
            title="Popular Services"
            data={popularServices}
            emptyText="No data available"
            render={(item) => (
              <>
                <span>{item.name}</span>
                <span>{item.count}</span>
              </>
            )}
          />

          <DashboardTable
            title="Recent Activity"
            data={recentActivity}
            emptyText="No recent activity"
            render={(item) => (
              <>
                <div>
                  <div className="font-semibold">{item.customer}</div>
                  <small className="text-gray-400">{item.action}</small>
                </div>
                <span>{item.time}</span>
              </>
            )}
          />

        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white border border-[var(--border-light)] rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-2">{icon}</div>
      <p className="text-sm text-[var(--gray-700)]">{title}</p>
      <h2 className="text-3xl font-bold text-[var(--primary)]">{value}</h2>
    </div>
  );
}

function DashboardTable({ title, data, emptyText, render }) {
  return (
    <div className="bg-[var(--gray-100)] p-8 rounded-lg border border-[var(--border-light)]">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      {data.length === 0 ? (
        <p className="text-sm text-center text-[var(--gray-700)]">
          {emptyText}
        </p>
      ) : (
        data.map((item, i) => (
          <div
            key={i}
            className="flex justify-between border-t border-[var(--border-light)] py-2 text-sm"
          >
            {render(item)}
          </div>
        ))
      )}
    </div>
  );
}
