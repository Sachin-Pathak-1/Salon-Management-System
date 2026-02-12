import { useEffect, useState } from "react";

const API = "http://localhost:5000/api/manager";

export function ManagerDashboard() {

  const [stats, setStats] = useState({
    staffCount: 0,
    servicesCount: 0,
    appointmentCount: 0,
    totalSalary: 0
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {

      const token = localStorage.getItem("token");

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [statsRes, salaryRes] = await Promise.all([
        fetch(`${API}/stats`, { headers }),
        fetch(`${API}/salary`, { headers }),
      ]);

      const statsData = await statsRes.json();
      const salaryData = await salaryRes.json();

      setStats({
        ...statsData,
        totalSalary: salaryData.totalSalary || 0
      });

    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen p-10">
      <h1 className="text-3xl font-bold mb-6">Manager Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

        <Card title="Total Staff" value={stats.staffCount} />
        <Card title="Total Services" value={stats.servicesCount} />
        <Card title="Appointments" value={stats.appointmentCount} />
        <Card title="Monthly Salary" value={`₹ ${stats.totalSalary}`} />

      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white shadow rounded p-6 text-center">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold">{value}</h2>
    </div>
  );
}
