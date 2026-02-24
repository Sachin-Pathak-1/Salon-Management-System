import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const toISODate = (date) => {
    if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
    }
    const value = new Date(date || "");
    if (Number.isNaN(value.getTime())) return "";
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const getISOWeekParts = (dateString) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString || "");
    if (!match) return { year: "", week: "" };
    const utcDate = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - (utcDate.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((utcDate - yearStart) / 86400000) + 1) / 7);
    return { year: utcDate.getUTCFullYear(), week: String(weekNo).padStart(2, "0") };
};

const getPickerType = (view) => {
    if (view === "weekly") return "week";
    if (view === "monthly") return "month";
    if (view === "yearly") return "number";
    return "date";
};

const getPickerValue = (dateString, view) => {
    const safeDate = toISODate(dateString);
    if (!safeDate) return "";

    if (view === "weekly") {
        const { year, week } = getISOWeekParts(safeDate);
        return `${year}-W${week}`;
    }
    if (view === "monthly") {
        return safeDate.slice(0, 7);
    }
    if (view === "yearly") {
        return safeDate.slice(0, 4);
    }
    return safeDate;
};

const fromWeekValueToISODate = (value) => {
    const match = /^(\d{4})-W(\d{2})$/.exec(value || "");
    if (!match) return "";
    const year = Number(match[1]);
    const week = Number(match[2]);
    const jan4 = new Date(Date.UTC(year, 0, 4));
    const jan4Day = jan4.getUTCDay() || 7;
    const firstMonday = new Date(jan4);
    firstMonday.setUTCDate(jan4.getUTCDate() - jan4Day + 1);
    const monday = new Date(firstMonday);
    monday.setUTCDate(firstMonday.getUTCDate() + (week - 1) * 7);
    return monday.toISOString().slice(0, 10);
};

const toApiDateFromPicker = (value, view) => {
    if (view === "weekly") {
        return fromWeekValueToISODate(value);
    }
    if (view === "monthly") {
        return /^\d{4}-\d{2}$/.test(value || "") ? `${value}-01` : "";
    }
    if (view === "yearly") {
        return /^\d{4}$/.test(value || "") ? `${value}-01-01` : "";
    }
    return toISODate(value);
};

export default function AttendanceReport({ activeSalon }) {
    const todayDate = new Date().toISOString().split("T")[0];
    const [selectedDate, setSelectedDate] = useState(todayDate);
    const [view, setView] = useState("day");
    const [reportData, setReportData] = useState(null);
    const [dayAttendanceData, setDayAttendanceData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [pickerInput, setPickerInput] = useState(getPickerValue(todayDate, "day"));

    useEffect(() => {
        if (activeSalon) {
            fetchAttendance();
        }
    }, [selectedDate, activeSalon, view]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            if (view === "day") {
                const res = await axios.get(`${API_BASE}/attendance`, {
                    params: { date: selectedDate, salonId: activeSalon },
                    headers
                });
                setDayAttendanceData(res.data || { records: [] });
                setReportData(null);
            } else {
                const res = await axios.get(`${API_BASE}/attendance/report`, {
                    params: { date: selectedDate, salonId: activeSalon, view },
                    headers
                });
                setReportData(res.data);
                setDayAttendanceData(null);
            }
        } catch (err) {
            console.error("Error fetching report:", err);
            setReportData(null);
            setDayAttendanceData(null);
        } finally {
            setLoading(false);
        }
    };

    const dayRecords = dayAttendanceData?.records || [];
    const dailyRows = reportData?.dailyBreakdown || [];
    const periodSummary = reportData?.summary || {
        present: 0, absent: 0, leave: 0, halfDay: 0, totalRecords: 0, markedDays: 0
    };
    const daySummary = {
        present: dayRecords.filter((r) => r.status === "Present").length,
        absent: dayRecords.filter((r) => r.status === "Absent").length,
        leave: dayRecords.filter((r) => r.status === "Leave").length,
        halfDay: dayRecords.filter((r) => r.status === "Half Day").length,
        markedDays: dayRecords.length > 0 ? 1 : 0
    };
    const summary = view === "day" ? daySummary : periodSummary;
    const calendar = reportData?.monthlyCalendar || { monthLabel: "", totals: {}, days: [] };
    const calendarTotals = calendar.totals || {
        presentDays: 0, absentDays: 0, leaveDays: 0, mixedDays: 0, unmarkedDays: 0, totalDays: 0
    };
    const pickerType = getPickerType(view);
    const pickerValue = pickerInput;

    useEffect(() => {
        setPickerInput(getPickerValue(selectedDate, view));
    }, [selectedDate, view]);

    const handleDateChange = (value) => {
        setPickerInput(value);
        const apiDate = toApiDateFromPicker(value, view);
        if (apiDate) {
            setSelectedDate(apiDate);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Present": return "bg-green-100 text-green-800 border-green-200";
            case "Absent": return "bg-red-100 text-red-800 border-red-200";
            case "Half Day": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "Leave": return "bg-blue-100 text-blue-800 border-blue-200";
            case "Mixed": return "bg-amber-100 text-amber-800 border-amber-200";
            case "Unmarked": return "bg-gray-100 text-gray-600 border-gray-200";
            default: return "bg-gray-100 text-gray-600 border-gray-200";
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-10" style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
            <div className="max-w-5xl mx-auto">

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Attendance Report</h1>
                        <p className="opacity-70">Day, weekly, monthly and yearly attendance insights</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="inline-flex rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border-light)' }}>
                            {["day", "weekly", "monthly", "yearly"].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setView(option)}
                                    className={`px-3 py-2 text-sm font-medium capitalize ${view === option ? "text-white" : ""}`}
                                    style={view === option
                                        ? { backgroundColor: 'var(--primary)' }
                                        : { backgroundColor: 'var(--gray-100)', color: 'var(--text)' }}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                        <input
                            type={pickerType}
                            value={pickerValue}
                            min={view === "yearly" ? "2000" : undefined}
                            max={view === "yearly" ? "2100" : undefined}
                            step={view === "yearly" ? "1" : undefined}
                            onChange={(e) => handleDateChange(e.target.value)}
                            className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)', color: 'var(--text)' }}
                        />
                        <button
                            type="button"
                            onClick={() => setSelectedDate(todayDate)}
                            className="px-3 py-2 text-sm font-semibold rounded-lg border"
                            style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)', color: 'var(--text)' }}
                        >
                            Today
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <StatCard label="Present" value={summary.present} color="bg-green-50 text-green-700" />
                    <StatCard label="Absent" value={summary.absent} color="bg-red-50 text-red-700" />
                    <StatCard label="Leave" value={summary.leave} color="bg-blue-50 text-blue-700" />
                    <StatCard label="Half Day" value={summary.halfDay} color="bg-orange-50 text-orange-700" />
                    <StatCard label={view === "day" ? "Selected Day" : "Marked Days"} value={summary.markedDays} color="bg-indigo-50 text-indigo-700" />
                </div>

                {view !== "day" && (
                    <div className="mb-8 p-5 rounded-2xl shadow border" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>
                        <h2 className="text-xl font-bold">{calendar.monthLabel || "Monthly Calendar Summary"}</h2>
                        <p className="opacity-70 text-sm mt-1">
                            Present: {calendarTotals.presentDays} days | Absent: {calendarTotals.absentDays} days | Leave: {calendarTotals.leaveDays} days
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsCalendarOpen(true)}
                            className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold border"
                            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)', color: 'var(--text)' }}
                        >
                            View Monthly Calendar
                        </button>
                    </div>
                )}

                <div className="rounded-2xl shadow border overflow-hidden" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b" style={{ backgroundColor: 'var(--gray-200)', borderColor: 'var(--border-light)' }}>
                                    {view === "day" ? (
                                        <>
                                            <th className="p-4 text-xs uppercase tracking-wider font-bold opacity-70">Staff Member</th>
                                            <th className="p-4 text-xs uppercase tracking-wider font-bold opacity-70">Status</th>
                                            <th className="p-4 text-xs uppercase tracking-wider font-bold opacity-70">Check In</th>
                                            <th className="p-4 text-xs uppercase tracking-wider font-bold opacity-70">Check Out</th>
                                            <th className="p-4 text-xs uppercase tracking-wider font-bold opacity-70">Remarks</th>
                                        </>
                                    ) : (
                                        <>
                                            <th className="p-4 text-xs uppercase tracking-wider font-bold opacity-70">Date</th>
                                            <th className="p-4 text-xs uppercase tracking-wider font-bold opacity-70">Present</th>
                                            <th className="p-4 text-xs uppercase tracking-wider font-bold opacity-70">Absent</th>
                                            <th className="p-4 text-xs uppercase tracking-wider font-bold opacity-70">Leave</th>
                                            <th className="p-4 text-xs uppercase tracking-wider font-bold opacity-70">Status</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
                                {loading ? (
                                    <tr><td colSpan="5" className="p-8 text-center opacity-50">Loading...</td></tr>
                                ) : view === "day" && dayRecords.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center opacity-50">No records found for this selected day.</td></tr>
                                ) : view !== "day" && dailyRows.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center opacity-50">No records found for this period.</td></tr>
                                ) : (
                                    view === "day"
                                        ? dayRecords.map((record, index) => (
                                            <tr key={`${record.staffId || "staff"}-${index}`} className="transition-colors" style={{ backgroundColor: 'transparent' }}>
                                                <td className="p-4 font-medium" style={{ color: 'var(--text)' }}>
                                                    {record.staffName || record.staffId?.name || "Unknown Staff"}
                                                </td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(record.status)}`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm font-mono opacity-80" style={{ color: 'var(--text)' }}>{record.checkIn || "-"}</td>
                                                <td className="p-4 text-sm font-mono opacity-80" style={{ color: 'var(--text)' }}>{record.checkOut || "-"}</td>
                                                <td className="p-4 text-sm opacity-70 italic" style={{ color: 'var(--text)' }}>{record.remarks || "-"}</td>
                                            </tr>
                                        ))
                                        : dailyRows.map((row) => (
                                            <tr key={row.date} className="transition-colors" style={{ backgroundColor: 'transparent' }}>
                                                <td className="p-4 font-medium" style={{ color: 'var(--text)' }}>{row.date}</td>
                                                <td className="p-4 text-sm font-mono opacity-80" style={{ color: 'var(--text)' }}>{row.present}</td>
                                                <td className="p-4 text-sm font-mono opacity-80" style={{ color: 'var(--text)' }}>{row.absent}</td>
                                                <td className="p-4 text-sm font-mono opacity-80" style={{ color: 'var(--text)' }}>{row.leave + row.halfDay}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(row.predominantStatus)}`}>
                                                        {row.predominantStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {view !== "day" && isCalendarOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.45)" }}>
                        <div className="w-full max-w-5xl max-h-[88vh] overflow-y-auto rounded-2xl shadow-2xl border"
                            style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>
                            <div className="p-4 border-b flex items-center justify-between"
                                style={{ borderColor: 'var(--border-light)', backgroundColor: 'var(--gray-200)' }}>
                                <h3 className="font-semibold">Monthly Calendar View</h3>
                                <button
                                    type="button"
                                    onClick={() => setIsCalendarOpen(false)}
                                    className="px-3 py-1 text-sm rounded border"
                                    style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)', color: 'var(--text)' }}
                                >
                                    Close
                                </button>
                            </div>
                            <div className="p-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                                {(calendar.days || []).map((day) => {
                                    const dayNum = new Date(day.date).getDate();
                                    return (
                                        <div key={day.date} className={`rounded-lg border p-3 ${getStatusColor(day.predominantStatus)}`}>
                                            <div className="font-bold text-sm mb-2">{dayNum}</div>
                                            <div className="text-[11px]">P: {day.present}</div>
                                            <div className="text-[11px]">A: {day.absent}</div>
                                            <div className="text-[11px]">L: {day.leave + day.halfDay}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

function StatCard({ label, value, color }) {
    return (
        <div className={`p-4 rounded-xl border ${color} bg-opacity-50`}>
            <h3 className="text-2xl font-bold">{value}</h3>
            <p className="text-xs uppercase font-bold opacity-70">{label}</p>
        </div>
    );
}
