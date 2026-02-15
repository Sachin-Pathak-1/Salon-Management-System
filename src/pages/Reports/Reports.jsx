import { useEffect, useState } from "react";

const APPOINTMENTS_API = "http://localhost:5000/api/appointments";
const SERVICES_API = "http://localhost:5000/api/services";

export function Reports({ activeSalon }) {
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`
  });

  useEffect(() => {
    if (activeSalon) {
      fetchData();
    }
  }, [activeSalon]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [apptRes, servRes] = await Promise.all([
        fetch(`${APPOINTMENTS_API}?salonId=${activeSalon}`, { headers: authHeader() }),
        fetch(`${SERVICES_API}?salonId=${activeSalon}`, { headers: authHeader() })
      ]);

      const apptData = await apptRes.json();
      const servData = await servRes.json();

      setAppointments(Array.isArray(apptData) ? apptData : []);
      setServices(Array.isArray(servData) ? servData : []);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate metrics
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === "completed").length;
  const pendingAppointments = appointments.filter(a => a.status === "pending").length;
  const cancelledAppointments = appointments.filter(a => a.status === "cancelled").length;

  const totalRevenue = appointments
    .filter(a => a.status === "completed")
    .reduce((sum, a) => sum + (a.totalPrice || 0), 0);

  const avgAppointmentValue = completedAppointments > 0 ? totalRevenue / completedAppointments : 0;

  // Service popularity
  const serviceStats = services.map(service => {
    const serviceAppointments = appointments.filter(a =>
      a.services?.some(s => (typeof s === 'object' ? s._id : s) === service._id)
    );
    return {
      name: service.name,
      count: serviceAppointments.length,
      revenue: serviceAppointments
        .filter(a => a.status === "completed")
        .reduce((sum, a) => sum + (a.totalPrice || 0), 0)
    };
  }).sort((a, b) => b.count - a.count);

  return (
    <div className="min-h-screen w-full px-4 md:px-10 py-10" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-7xl mx-auto" style={{ color: 'var(--text)' }}>

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--text)' }}>
            Reports & Analytics
          </h1>
          <p className="text-sm mt-2" style={{ opacity: 0.7 }}>
            Overview of your salon's performance
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20" style={{ opacity: 0.6 }}>
            Loading reports...
          </div>
        ) : (
          <>
            {/* METRICS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

              <div className="rounded-2xl p-6 shadow-sm border" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>
                <div className="text-sm font-semibold mb-2" style={{ opacity: 0.7 }}>Total Appointments</div>
                <div className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>{totalAppointments}</div>
              </div>

              <div className="rounded-2xl p-6 shadow-sm border" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>
                <div className="text-sm font-semibold mb-2" style={{ opacity: 0.7 }}>Completed</div>
                <div className="text-3xl font-bold" style={{ color: 'var(--success)' }}>{completedAppointments}</div>
              </div>

              <div className="rounded-2xl p-6 shadow-sm border" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>
                <div className="text-sm font-semibold mb-2" style={{ opacity: 0.7 }}>Total Revenue</div>
                <div className="text-3xl font-bold" style={{ color: 'var(--success)' }}>₹{totalRevenue.toFixed(0)}</div>
              </div>

              <div className="rounded-2xl p-6 shadow-sm border" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>
                <div className="text-sm font-semibold mb-2" style={{ opacity: 0.7 }}>Avg. Value</div>
                <div className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>₹{avgAppointmentValue.toFixed(0)}</div>
              </div>

            </div>

            {/* APPOINTMENT STATUS BREAKDOWN */}
            <div className="rounded-2xl p-6 md:p-8 shadow-sm border mb-8" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>Appointment Status</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)' }}>
                  <div className="text-sm font-semibold mb-1" style={{ opacity: 0.7 }}>Pending</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--warning)' }}>{pendingAppointments}</div>
                  <div className="text-xs mt-1" style={{ opacity: 0.6 }}>
                    {totalAppointments > 0 ? ((pendingAppointments / totalAppointments) * 100).toFixed(1) : 0}% of total
                  </div>
                </div>

                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)' }}>
                  <div className="text-sm font-semibold mb-1" style={{ opacity: 0.7 }}>Completed</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--success)' }}>{completedAppointments}</div>
                  <div className="text-xs mt-1" style={{ opacity: 0.6 }}>
                    {totalAppointments > 0 ? ((completedAppointments / totalAppointments) * 100).toFixed(1) : 0}% of total
                  </div>
                </div>

                <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)' }}>
                  <div className="text-sm font-semibold mb-1" style={{ opacity: 0.7 }}>Cancelled</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--danger)' }}>{cancelledAppointments}</div>
                  <div className="text-xs mt-1" style={{ opacity: 0.6 }}>
                    {totalAppointments > 0 ? ((cancelledAppointments / totalAppointments) * 100).toFixed(1) : 0}% of total
                  </div>
                </div>
              </div>
            </div>

            {/* SERVICE PERFORMANCE */}
            <div className="rounded-2xl p-6 md:p-8 shadow-sm border" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>
              <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>Service Performance</h2>

              {serviceStats.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--border-light)' }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)' }}>
                        <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Service</th>
                        <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Bookings</th>
                        <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Revenue</th>
                        <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Avg. per Booking</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceStats.map((stat, idx) => (
                        <tr key={idx} className="border-b" style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--background)' }}>
                          <td className="p-4 font-semibold">{stat.name}</td>
                          <td className="p-4">{stat.count}</td>
                          <td className="p-4" style={{ color: 'var(--success)' }}>₹{stat.revenue.toFixed(0)}</td>
                          <td className="p-4" style={{ opacity: 0.7 }}>
                            ₹{stat.count > 0 ? (stat.revenue / stat.count).toFixed(0) : 0}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8" style={{ opacity: 0.6 }}>
                  No service data available
                </div>
              )}
            </div>
          </>
        )}

      </div>
    </div>
  );
}
