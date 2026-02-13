import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export default function AttendanceReport({ activeSalon }) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [attendanceData, setAttendanceData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (activeSalon) {
            fetchAttendance();
        }
    }, [selectedDate, activeSalon]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${API_BASE}/attendance`, {
                params: { date: selectedDate, salonId: activeSalon },
                headers: { Authorization: `Bearer ${token}` }
            });
            setAttendanceData(res.data);
        } catch (err) {
            console.error("Error fetching report:", err);
        } finally {
            setLoading(false);
        }
    };

    const records = attendanceData?.records || [];

    const getStatusColor = (status) => {
        switch (status) {
            case "Present": return "bg-green-100 text-green-800 border-green-200";
            case "Absent": return "bg-red-100 text-red-800 border-red-200";
            case "Half Day": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "Leave": return "bg-blue-100 text-blue-800 border-blue-200";
            default: return "bg-gray-100 text-gray-600 border-gray-200";
        }
    };

    return (
        <div className="min-h-screen p-6 md:p-10" style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
            <div className="max-w-5xl mx-auto">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Attendance Report</h1>
                        <p className="opacity-70">Daily staff attendance overview</p>
                    </div>
                    <div>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)', color: 'var(--text)' }}
                        />
                    </div>
                </div>

                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard label="Total Staff" value={records.length} color="bg-blue-50 text-blue-700" />
                    <StatCard label="Present" value={records.filter(r => r.status === 'Present').length} color="bg-green-50 text-green-700" />
                    <StatCard label="Absent" value={records.filter(r => r.status === 'Absent').length} color="bg-red-50 text-red-700" />
                    <StatCard label="On Leave/Half" value={records.filter(r => ['Leave', 'Half Day'].includes(r.status)).length} color="bg-orange-50 text-orange-700" />
                </div>

                {/* TABLE */}
                <div className="rounded-2xl shadow border overflow-hidden" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b" style={{ backgroundColor: 'var(--gray-200)', borderColor: 'var(--border-light)' }}>
                                    <th className="p-4 text-xs uppercase tracking-wider font-bold opacity-70">Staff Member</th>
                                    <th className="p-4 text-xs uppercase tracking-wider font-bold opacity-70">Status</th>
                                    <th className="p-4 text-xs uppercase tracking-wider font-bold opacity-70">Check In</th>
                                    <th className="p-4 text-xs uppercase tracking-wider font-bold opacity-70">Check Out</th>
                                    <th className="p-4 text-xs uppercase tracking-wider font-bold opacity-70">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--border-light)' }}>
                                {loading ? (
                                    <tr><td colSpan="5" className="p-8 text-center opacity-50">Loading...</td></tr>
                                ) : records.length === 0 ? (
                                    <tr><td colSpan="5" className="p-8 text-center opacity-50">No records found for this date.</td></tr>
                                ) : (
                                    records.map((record, i) => (
                                        <tr key={i} className="transition-colors" style={{ backgroundColor: 'transparent' }}>
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
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

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
