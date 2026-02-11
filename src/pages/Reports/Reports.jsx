import { useState, useEffect } from 'react';
import { Footer } from "../../components/Footer";

export function Reports() {
  const [reportsData, setReportsData] = useState({
    monthlyRevenue: 0,
    totalAppointments: 0,
    popularServices: [],
    appointmentsStats: { completed: 0, pending: 0, cancelled: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch reports data from backend
    const fetchReports = async () => {
      try {
        const response = await fetch('/api/reports/summary');
        if (response.ok) {
          const data = await response.json();
          setReportsData(data);
        } else {
          console.error('Failed to fetch reports');
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading reports...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 min-h-screen bg-[var(--background)] text-[var(--text)] px-4 py-10 items-center transition-colors duration-300 ease">
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-[var(--text)] mb-8">Salon Reports</h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[var(--gray-100)] p-6 rounded-lg border border-[var(--border-light)] shadow-sm">
            <h3 className="text-xl font-semibold text-[var(--text)]">Monthly Revenue</h3>
            <p className="text-2xl font-bold text-[var(--primary)]">${reportsData.monthlyRevenue.toFixed(2)}</p>
          </div>
          <div className="bg-[var(--gray-100)] p-6 rounded-lg border border-[var(--border-light)] shadow-sm">
            <h3 className="text-xl font-semibold text-[var(--text)]">Total Appointments</h3>
            <p className="text-2xl font-bold text-[var(--primary)]">{reportsData.totalAppointments}</p>
          </div>
          <div className="bg-[var(--gray-100)] p-6 rounded-lg border border-[var(--border-light)] shadow-sm">
            <h3 className="text-xl font-semibold text-[var(--text)]">Completed Appointments</h3>
            <p className="text-2xl font-bold text-[var(--primary)]">{reportsData.appointmentsStats.completed}</p>
          </div>
        </div>

        {/* Popular Services */}
        <div className="bg-[var(--gray-100)] p-6 rounded-lg border border-[var(--border-light)] shadow-sm mb-8">
          <h3 className="text-xl font-semibold text-[var(--text)] mb-4">Popular Services</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border-light)]">
                  <th className="py-2 px-4 font-semibold text-[var(--gray-700)]">Service</th>
                  <th className="py-2 px-4 font-semibold text-[var(--gray-700)]">Bookings</th>
                </tr>
              </thead>
              <tbody>
                {reportsData.popularServices.map((service, index) => (
                  <tr key={index} className="border-b border-[var(--border-light)]">
                    <td className="py-2 px-4">{service.name}</td>
                    <td className="py-2 px-4">{service.bookings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Appointments Stats */}
        <div className="bg-[var(--gray-100)] p-6 rounded-lg border border-[var(--border-light)] shadow-sm">
          <h3 className="text-xl font-semibold text-[var(--text)] mb-4">Appointments Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{reportsData.appointmentsStats.completed}</p>
              <p className="text-sm text-[var(--gray-700)]">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{reportsData.appointmentsStats.pending}</p>
              <p className="text-sm text-[var(--gray-700)]">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{reportsData.appointmentsStats.cancelled}</p>
              <p className="text-sm text-[var(--gray-700)]">Cancelled</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
