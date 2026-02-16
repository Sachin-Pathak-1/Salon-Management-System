import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const APPOINTMENTS_API = "http://localhost:5000/api/appointments";
const SERVICES_API = "http://localhost:5000/api/services";

const formatCurrency = (value) =>
  `INR ${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const formatCompact = (value) => {
  const number = Number(value || 0);
  if (number >= 1000) return `${(number / 1000).toFixed(2)}K`;
  return number.toFixed(0);
};

const pctChange = (current, previous) => {
  if (!previous && !current) return 0;
  if (!previous) return 100;
  return ((current - previous) / previous) * 100;
};

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

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

  const now = startOfDay(new Date());
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const currentWeekStart = new Date(now);
  currentWeekStart.setDate(now.getDate() - 6);

  const thisMonthRevenue = appointments
    .filter((a) => {
      const d = new Date(a.date);
      return a.status === "completed" && d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((sum, a) => sum + (a.totalPrice || 0), 0);

  const previousMonthRevenue = appointments
    .filter((a) => {
      const d = new Date(a.date);
      const prev = new Date(thisYear, thisMonth - 1, 1);
      return a.status === "completed" && d.getMonth() === prev.getMonth() && d.getFullYear() === prev.getFullYear();
    })
    .reduce((sum, a) => sum + (a.totalPrice || 0), 0);

  const thisWeekRevenue = appointments
    .filter((a) => {
      const d = startOfDay(a.date);
      return a.status === "completed" && d >= currentWeekStart && d <= now;
    })
    .reduce((sum, a) => sum + (a.totalPrice || 0), 0);

  const previousWeekStart = new Date(currentWeekStart);
  previousWeekStart.setDate(previousWeekStart.getDate() - 7);
  const previousWeekEnd = new Date(currentWeekStart);
  previousWeekEnd.setDate(previousWeekEnd.getDate() - 1);

  const previousWeekRevenue = appointments
    .filter((a) => {
      const d = startOfDay(a.date);
      return a.status === "completed" && d >= previousWeekStart && d <= previousWeekEnd;
    })
    .reduce((sum, a) => sum + (a.totalPrice || 0), 0);

  const last30Start = new Date(now);
  last30Start.setDate(last30Start.getDate() - 29);
  const previous30Start = new Date(last30Start);
  previous30Start.setDate(previous30Start.getDate() - 30);
  const previous30End = new Date(last30Start);
  previous30End.setDate(previous30End.getDate() - 1);

  const appointments30 = appointments.filter((a) => {
    const d = startOfDay(a.date);
    return d >= last30Start && d <= now;
  });

  const appointmentsPrev30 = appointments.filter((a) => {
    const d = startOfDay(a.date);
    return d >= previous30Start && d <= previous30End;
  });

  const activeSubscriptions = new Set(appointments30.map((a) => a.customerEmail).filter(Boolean)).size;
  const previousActiveSubscriptions = new Set(appointmentsPrev30.map((a) => a.customerEmail).filter(Boolean)).size;
  const avgSubscriptions = appointments30.length / 4.285;
  const avgPrevSubscriptions = appointmentsPrev30.length / 4.285;

  const totalRevenue = appointments
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + (a.totalPrice || 0), 0);

  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter((a) => a.status === "completed").length;
  const pendingAppointments = appointments.filter((a) => a.status === "pending").length;
  const cancelledAppointments = appointments.filter((a) => a.status === "cancelled").length;

  const last30RevenueData = useMemo(() => {
    const points = [];
    for (let i = 29; i >= 0; i--) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      const label = String(day.getDate()).padStart(2, "0");
      const revenue = appointments
        .filter((a) => {
          const d = startOfDay(a.date);
          return a.status === "completed" && d.getTime() === startOfDay(day).getTime();
        })
        .reduce((sum, a) => sum + (a.totalPrice || 0), 0);
      points.push({ day: label, revenue });
    }
    return points;
  }, [appointments]);

  const sparkBars = useMemo(() => {
    const sliced = last30RevenueData.slice(-12);
    const max = Math.max(...sliced.map((d) => d.revenue), 1);
    return sliced.map((d) => ({
      ...d,
      height: Math.max((d.revenue / max) * 100, 16)
    }));
  }, [last30RevenueData]);

  const miniBars = useMemo(() => {
    const sliced = last30RevenueData.slice(-6);
    const max = Math.max(...sliced.map((d) => d.revenue), 1);
    return sliced.map((d) => Math.max((d.revenue / max) * 100, 24));
  }, [last30RevenueData]);

  const clientServiceDetails = useMemo(() => {
    const map = new Map();

    appointments.forEach((a) => {
      const customerName = a.customerName || "Unknown Client";
      const customerEmail = a.customerEmail || "";
      const key = `${customerName}::${customerEmail}`;
      const serviceName =
        typeof a.serviceId === "object"
          ? a.serviceId?.name || "N/A"
          : services.find((s) => String(s._id) === String(a.serviceId))?.name || "N/A";

      if (!map.has(key)) {
        map.set(key, {
          clientName: customerName,
          clientEmail: customerEmail,
          bookings: 0,
          revenue: 0,
          serviceNames: new Set()
        });
      }

      const item = map.get(key);
      item.bookings += 1;
      item.serviceNames.add(serviceName);

      if (a.status === "completed") {
        item.revenue += a.totalPrice || 0;
      }
    });

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        avgPerBooking: item.bookings > 0 ? item.revenue / item.bookings : 0,
        chosenServices: Array.from(item.serviceNames).join(", ")
      }))
      .sort((a, b) => b.bookings - a.bookings);
  }, [appointments, services]);

  const downloadReport = () => {
    const header = ["Date", "Customer", "Email", "Service", "Status", "Amount"];
    const rows = appointments.map((a) => [
      new Date(a.date).toLocaleDateString("en-IN"),
      a.customerName || "",
      a.customerEmail || "",
      a.serviceId?.name || "N/A",
      a.status || "",
      a.totalPrice || 0
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sales-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (!activeSalon) {
    return (
      <div className="min-h-screen w-full px-4 md:px-10 py-10" style={{ backgroundColor: "var(--background)" }}>
        <div className="max-w-7xl mx-auto" style={{ color: "var(--text)" }}>
          Select a salon to view reports.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full px-4 md:px-10 py-10" style={{ backgroundColor: "var(--background)" }}>
      <div className="max-w-7xl mx-auto" style={{ color: "var(--text)" }}>
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold">Reports & Analytics</h1>
          <p className="text-sm mt-2" style={{ opacity: 0.7 }}>
            30 day performance summary
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20" style={{ opacity: 0.6 }}>
            Loading reports...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
              <div
                className="lg:col-span-7 rounded-xl p-6 border shadow-sm"
                style={{ backgroundColor: "var(--gray-100)", borderColor: "var(--border-light)" }}
              >
                <h2 className="text-2xl font-semibold">Sales Revenue</h2>
                <p className="text-sm mt-1" style={{ opacity: 0.7 }}>
                  In last 30 days revenue from appointments.
                </p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <div className="text-4xl font-semibold leading-tight">{formatCurrency(thisMonthRevenue)}</div>
                    <div className="text-sm mt-1" style={{ color: pctChange(thisMonthRevenue, previousMonthRevenue) >= 0 ? "var(--success)" : "var(--danger)" }}>
                      {pctChange(thisMonthRevenue, previousMonthRevenue) >= 0 ? "up" : "down"} {Math.abs(pctChange(thisMonthRevenue, previousMonthRevenue)).toFixed(2)}%
                    </div>
                    <div className="text-sm mt-1" style={{ opacity: 0.65 }}>This month</div>
                  </div>
                  <div>
                    <div className="text-4xl font-semibold leading-tight">{formatCurrency(thisWeekRevenue)}</div>
                    <div className="text-sm mt-1" style={{ color: pctChange(thisWeekRevenue, previousWeekRevenue) >= 0 ? "var(--success)" : "var(--danger)" }}>
                      {pctChange(thisWeekRevenue, previousWeekRevenue) >= 0 ? "up" : "down"} {Math.abs(pctChange(thisWeekRevenue, previousWeekRevenue)).toFixed(2)}%
                    </div>
                    <div className="text-sm mt-1" style={{ opacity: 0.65 }}>This week</div>
                  </div>
                </div>

                <div className="mt-7 flex items-end gap-3 h-36">
                  {sparkBars.map((bar, idx) => (
                    <div
                      key={`${bar.day}-${idx}`}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${bar.height}%`,
                        backgroundColor: "var(--primary)"
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 grid grid-cols-1 gap-6">
                <div
                  className="rounded-xl p-6 border shadow-sm"
                  style={{ backgroundColor: "var(--gray-100)", borderColor: "var(--border-light)" }}
                >
                  <h3 className="text-2xl font-semibold">Active Subscriptions</h3>
                  <div className="mt-4 text-5xl font-semibold">{formatCompact(activeSubscriptions)}</div>
                  <div className="text-sm mt-2" style={{ color: pctChange(activeSubscriptions, previousActiveSubscriptions) >= 0 ? "var(--success)" : "var(--danger)" }}>
                    {pctChange(activeSubscriptions, previousActiveSubscriptions) >= 0 ? "up" : "down"} {Math.abs(pctChange(activeSubscriptions, previousActiveSubscriptions)).toFixed(2)}% since last month
                  </div>
                  <div className="mt-4 flex items-end gap-3 h-14">
                    {miniBars.map((h, idx) => (
                      <div
                        key={`active-bar-${idx}`}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${h}%`,
                          backgroundColor: "var(--primary)"
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div
                  className="rounded-xl p-6 border shadow-sm"
                  style={{ backgroundColor: "var(--gray-100)", borderColor: "var(--border-light)" }}
                >
                  <h3 className="text-2xl font-semibold">Avg Subscriptions</h3>
                  <div className="mt-4 text-5xl font-semibold">{avgSubscriptions.toFixed(1)}</div>
                  <div className="text-sm mt-2" style={{ color: pctChange(avgSubscriptions, avgPrevSubscriptions) >= 0 ? "var(--success)" : "var(--danger)" }}>
                    {pctChange(avgSubscriptions, avgPrevSubscriptions) >= 0 ? "up" : "down"} {Math.abs(pctChange(avgSubscriptions, avgPrevSubscriptions)).toFixed(2)}% since last month
                  </div>
                  <div className="mt-4 flex items-end gap-3 h-14">
                    {miniBars.map((h, idx) => (
                      <div
                        key={`avg-bar-${idx}`}
                        className="flex-1 rounded-sm"
                        style={{
                          height: `${Math.max(h - 10, 20)}%`,
                          backgroundColor: "var(--primary)"
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              className="rounded-xl p-6 md:p-8 border shadow-sm mb-8"
              style={{ backgroundColor: "var(--gray-100)", borderColor: "var(--border-light)" }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-2xl font-semibold">Sales Overview</h2>
                  <p className="text-sm mt-1" style={{ opacity: 0.7 }}>
                    In 30 days sales of appointment services.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadReport}
                  className="px-4 py-2 rounded-md text-sm font-semibold border"
                  style={{ borderColor: "var(--border-light)", backgroundColor: "var(--background)" }}
                >
                  Download Report
                </button>
              </div>

              <div className="flex items-center justify-between mb-5">
                <div className="text-5xl font-semibold">{formatCurrency(totalRevenue)}</div>
                <div className="text-right">
                  <div className="text-3xl font-semibold">{formatCompact(activeSubscriptions * 1.0)}</div>
                  <div className="text-sm" style={{ opacity: 0.65 }}>Subscribers</div>
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={last30RevenueData}>
                    <defs>
                      <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="var(--border-light)" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: "var(--text)", opacity: 0.65 }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fill: "var(--text)", opacity: 0.65 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `INR ${Math.round(v / 1000)}k`}
                    />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value), "Revenue"]}
                      contentStyle={{
                        backgroundColor: "var(--gray-100)",
                        border: "1px solid var(--border-light)",
                        borderRadius: "8px"
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      fill="url(#salesFill)"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--gray-100)", borderColor: "var(--border-light)" }}>
                <div className="text-sm font-semibold" style={{ opacity: 0.7 }}>Total Appointments</div>
                <div className="text-3xl font-bold mt-2">{totalAppointments}</div>
              </div>
              <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--gray-100)", borderColor: "var(--border-light)" }}>
                <div className="text-sm font-semibold" style={{ opacity: 0.7 }}>Completed</div>
                <div className="text-3xl font-bold mt-2" style={{ color: "var(--success)" }}>{completedAppointments}</div>
              </div>
              <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--gray-100)", borderColor: "var(--border-light)" }}>
                <div className="text-sm font-semibold" style={{ opacity: 0.7 }}>Pending</div>
                <div className="text-3xl font-bold mt-2" style={{ color: "var(--warning)" }}>{pendingAppointments}</div>
              </div>
              <div className="p-4 rounded-xl border" style={{ backgroundColor: "var(--gray-100)", borderColor: "var(--border-light)" }}>
                <div className="text-sm font-semibold" style={{ opacity: 0.7 }}>Cancelled</div>
                <div className="text-3xl font-bold mt-2" style={{ color: "var(--danger)" }}>{cancelledAppointments}</div>
              </div>
            </div>

            <div
              className="rounded-2xl p-6 md:p-8 shadow-sm border"
              style={{ backgroundColor: "var(--gray-100)", borderColor: "var(--border-light)" }}
            >
              <h2 className="text-xl font-bold mb-6">Service Detail</h2>
              {clientServiceDetails.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border" style={{ borderColor: "var(--border-light)" }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b" style={{ backgroundColor: "var(--background)", borderColor: "var(--border-light)" }}>
                        <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Client Name</th>
                        <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Client Booking</th>
                        <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Revenue</th>
                        <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Avg per Booking</th>
                        <th className="p-4 text-left font-semibold" style={{ opacity: 0.7 }}>Chosen Service</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientServiceDetails.map((stat, idx) => (
                        <tr key={idx} className="border-b" style={{ borderColor: "var(--border-light)", backgroundColor: "var(--background)" }}>
                          <td className="p-4 font-semibold">{stat.clientName}</td>
                          <td className="p-4">{stat.bookings}</td>
                          <td className="p-4" style={{ color: "var(--success)" }}>{formatCurrency(stat.revenue)}</td>
                          <td className="p-4" style={{ opacity: 0.7 }}>
                            {formatCurrency(stat.avgPerBooking)}
                          </td>
                          <td className="p-4" style={{ opacity: 0.85 }}>{stat.chosenServices || "N/A"}</td>
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
