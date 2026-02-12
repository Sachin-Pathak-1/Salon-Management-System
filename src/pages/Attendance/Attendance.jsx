import { useEffect, useState } from "react";
import "./Attendance.css";

const STAFF_API = "http://localhost:5000/api/staff";
const SALON_API = "http://localhost:5000/api/salons/get";
const ATTENDANCE_API = "http://localhost:5000/api/attendance";
const SELECTED_SALON_KEY = "selectedSalonId";

export default function Attendance() {
  /* ================= STATES ================= */

  const [staff, setStaff] = useState([]);
  const [salons, setSalons] = useState([]);
  const [activeSalon, setActiveSalon] = useState("");
  const [viewType, setViewType] = useState("weekly"); // weekly or monthly
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendance, setAttendance] = useState({}); // {staffId: {date: 'present'/'absent'}}
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  /* ================= HELPERS ================= */

  const authHeader = () => ({
    Authorization: `Bearer ${
      localStorage.getItem("adminToken") ||
      localStorage.getItem("staffToken") ||
      localStorage.getItem("token")
    }`
  });

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  /* ================= DATE HELPERS ================= */

  const getWeekDates = (date) => {
    const curr = new Date(date);
    const first = curr.getDate() - curr.getDay();
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(curr.setDate(first + i));
      weekDates.push(new Date(d));
    }
    return weekDates;
  };

  const getMonthDates = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthDates = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
      monthDates.push(new Date(year, month, i));
    }
    return monthDates;
  };

  const getDates = () => {
    return viewType === "weekly" ? getWeekDates(currentDate) : getMonthDates(currentDate);
  };

  const formatDateKey = (date) => {
    return date.toISOString().split("T")[0];
  };

  const formatDateDisplay = (date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getDayName = (date) => {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  };

  /* ================= LOAD SALONS ================= */

  const fetchSalons = async () => {
    try {
      const res = await fetch(SALON_API, { headers: authHeader() });
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setSalons(list);

      const storedSalonId = localStorage.getItem(SELECTED_SALON_KEY);
      const hasStoredSalon = list.some((s) => s._id === storedSalonId);
      const nextSalonId = hasStoredSalon ? storedSalonId : list[0]?._id;
      if (nextSalonId) {
        setActiveSalon(nextSalonId);
        localStorage.setItem(SELECTED_SALON_KEY, nextSalonId);
      }
    } catch (error) {
      console.error("Error fetching salons:", error);
      showToast("Error loading salons");
    }
  };

  /* ================= LOAD STAFF ================= */

  const fetchStaff = async (salonId) => {
    if (!salonId) return;
    setLoading(true);
    try {
      const res = await fetch(`${STAFF_API}?salonId=${salonId}`, {
        headers: authHeader()
      });
      const data = await res.json();
      setStaff(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching staff:", error);
      showToast("Error loading staff");
    } finally {
      setLoading(false);
    }
  };

  /* ================= TOGGLE ATTENDANCE ================= */

  const toggleAttendance = async (staffId, date) => {
    const dateKey = formatDateKey(date);
    const currentStatus = attendance[staffId]?.[dateKey];
    const newStatus = currentStatus === "present" ? "absent" : "present";

    // Optimistic update
    setAttendance((prev) => ({
      ...prev,
      [staffId]: {
        ...(prev[staffId] || {}),
        [dateKey]: newStatus
      }
    }));

    try {
      const response = await fetch(ATTENDANCE_API, {
        method: "POST",
        headers: {
          ...authHeader(),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          staffId,
          date: dateKey,
          status: newStatus,
          salonId: activeSalon
        })
      });

      if (!response.ok) {
        throw new Error("Failed to update attendance");
      }

      showToast(`${newStatus === "present" ? "Marked present" : "Marked absent"}`);
    } catch (error) {
      console.error("Error updating attendance:", error);
      showToast("Error updating attendance");
      // Revert optimistic update
      setAttendance((prev) => {
        const updated = { ...prev };
        delete updated[staffId]?.[dateKey];
        return updated;
      });
    }
  };

  const getAttendanceStatus = (staffId, date) => {
    const dateKey = formatDateKey(date);
    return attendance[staffId]?.[dateKey] || "not-marked";
  };

  /* ================= NAVIGATION ================= */

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === "weekly") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === "weekly") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  /* ================= EFFECTS ================= */

  useEffect(() => {
    fetchSalons();
  }, []);

  useEffect(() => {
    if (activeSalon) {
      fetchStaff(activeSalon);
    }
  }, [activeSalon]);

  /* ================= RENDER ================= */

  const dates = getDates();

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)] px-4 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text)] mb-2">Staff Attendance</h1>
          <p className="text-[var(--gray-700)]">Track and manage staff attendance</p>
        </div>

        {/* Salon Selector */}
        {salons.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[var(--text)] mb-2">
              Select Salon
            </label>
            <select
              value={activeSalon}
              onChange={(e) => setActiveSalon(e.target.value)}
              className="w-full px-4 py-2 bg-[var(--gray-100)] border border-[var(--border-light)] rounded text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              {salons.map((salon) => (
                <option key={salon._id} value={salon._id}>
                  {salon.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Controls */}
        <div className="bg-[var(--gray-100)] border border-[var(--border-light)] rounded-lg p-6 mb-8 shadow-sm">
          {/* View Type Toggle */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-[var(--text)] mb-3">
                View Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewType("weekly")}
                  className={`px-6 py-2 rounded font-semibold transition-all duration-300 ${
                    viewType === "weekly"
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--gray-200)] text-[var(--text)] hover:bg-[var(--gray-300)]"
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setViewType("monthly")}
                  className={`px-6 py-2 rounded font-semibold transition-all duration-300 ${
                    viewType === "monthly"
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--gray-200)] text-[var(--text)] hover:bg-[var(--gray-300)]"
                  }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            {/* Date Navigation */}
            <div>
              <label className="block text-sm font-semibold text-[var(--text)] mb-3">
                Navigation
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevious}
                  className="px-4 py-2 bg-[var(--gray-200)] hover:bg-[var(--gray-300)] text-[var(--text)] rounded font-semibold transition-all duration-300"
                >
                  ← Previous
                </button>
                <button
                  onClick={handleToday}
                  className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--secondary)] text-white rounded font-semibold transition-all duration-300"
                >
                  Today
                </button>
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-[var(--gray-200)] hover:bg-[var(--gray-300)] text-[var(--text)] rounded font-semibold transition-all duration-300"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>

          {/* Current Period Display */}
          <div className="text-center">
            <p className="text-lg font-semibold text-[var(--text)]">
              {viewType === "weekly"
                ? `Week of ${formatDateDisplay(dates[0])} - ${formatDateDisplay(dates[6])}`
                : `${currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}`}
            </p>
          </div>
        </div>

        {/* Attendance Table */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <p className="text-[var(--gray-700)] text-lg">Loading staff...</p>
          </div>
        ) : staff.length === 0 ? (
          <div className="bg-[var(--gray-100)] border border-[var(--border-light)] rounded-lg p-8 text-center">
            <p className="text-[var(--gray-700)] text-lg">No staff members found</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-[var(--gray-100)] border border-[var(--border-light)] rounded-lg shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--primary)] text-white border-b border-[var(--border-light)]">
                  <th className="px-6 py-4 text-left font-semibold sticky left-0 bg-[var(--primary)] z-10">
                    Staff Name
                  </th>
                  {dates.map((date) => (
                    <th
                      key={formatDateKey(date)}
                      className="px-4 py-4 text-center font-semibold whitespace-nowrap"
                    >
                      <div className="text-sm">{getDayName(date)}</div>
                      <div className="text-xs mt-1">{formatDateDisplay(date)}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staff.map((staffMember, index) => (
                  <tr
                    key={staffMember._id}
                    className={`border-b border-[var(--border-light)] ${
                      index % 2 === 0 ? "bg-[var(--gray-100)]" : "bg-white"
                    } hover:bg-[var(--gray-200)] transition-colors duration-200`}
                  >
                    <td className="px-6 py-4 font-semibold text-[var(--text)] sticky left-0 bg-inherit z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold">
                          {staffMember.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold">{staffMember.name}</p>
                          <p className="text-xs text-[var(--gray-700)]">{staffMember.designation}</p>
                        </div>
                      </div>
                    </td>
                    {dates.map((date) => {
                      const status = getAttendanceStatus(staffMember._id, date);
                      return (
                        <td
                          key={formatDateKey(date)}
                          className="px-4 py-4 text-center"
                        >
                          <button
                            onClick={() => toggleAttendance(staffMember._id, date)}
                            className={`w-12 h-12 rounded-lg font-bold text-sm transition-all duration-300 ${
                              status === "present"
                                ? "bg-green-500 hover:bg-green-600 text-white"
                                : status === "absent"
                                ? "bg-red-500 hover:bg-red-600 text-white"
                                : "bg-[var(--gray-300)] hover:bg-[var(--gray-400)] text-[var(--text)]"
                            }`}
                          >
                            {status === "present" ? "P" : status === "absent" ? "A" : "-"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        <div className="mt-8 flex gap-6 justify-center flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-500"></div>
            <span className="text-sm font-semibold text-[var(--text)]">Present</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-500"></div>
            <span className="text-sm font-semibold text-[var(--text)]">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[var(--gray-300)]"></div>
            <span className="text-sm font-semibold text-[var(--text)]">Not Marked</span>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-[var(--primary)] text-white px-6 py-3 rounded-lg shadow-lg animate-slideUp">
          {toast}
        </div>
      )}
    </div>
  );
}
