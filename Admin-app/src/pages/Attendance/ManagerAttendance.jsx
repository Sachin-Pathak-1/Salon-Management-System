import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

export default function ManagerAttendance() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState({});

    // Fetch Staff and Attendance for the selected date
    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { Authorization: `Bearer ${token}` };

            // 1. Fetch Staff
            const staffRes = await axios.get(`${API_BASE}/staff?salonId=mine`, { headers });
            const staffData = staffRes.data || [];

            // 2. Fetch Attendance for Date
            const attendanceRes = await axios.get(`${API_BASE}/attendance?date=${selectedDate}`, { headers });
            const existingRecords = attendanceRes.data?.records || [];

            // 3. Merge Data
            // Map existing records by staffId for easy lookup
            const recordsMap = {};
            existingRecords.forEach(r => {
                recordsMap[r.staffId] = r;
            });

            const mergedData = staffData.map(s => ({
                staffId: s._id,
                name: s.name,
                staffName: s.name,
                // Default to 'Absent' if new record, or 'Present' if typically they are present?
                // Let's default to 'Absent' until marked, or keep null to show 'Not Marked'
                // For simplicity, let's behave like the UI request: toggle Present/Absent
                status: recordsMap[s._id]?.status || "Absent",
                checkIn: recordsMap[s._id]?.checkIn || "",
                checkOut: recordsMap[s._id]?.checkOut || "",
                remarks: recordsMap[s._id]?.remarks || ""
            }));

            setStaffList(mergedData);

        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    };

    const updateRecord = (index, field, value) => {
        const updated = [...staffList];
        updated[index][field] = value;
        setStaffList(updated);
    };

    const saveAttendance = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("token");
            await axios.post(`${API_BASE}/attendance`, {
                date: selectedDate,
                records: staffList
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Attendance Saved Successfully!");
        } catch (err) {
            console.error(err);
            alert("Failed to save attendance.");
        } finally {
            setSaving(false);
        }
    };

    const setAllStatus = (status) => {
        const updated = staffList.map(s => ({ ...s, status }));
        setStaffList(updated);
    };

    return (
        <div className="min-h-screen p-6 md:p-10" style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
            <div className="max-w-4xl mx-auto rounded-2xl shadow-xl overflow-hidden border" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>

                {/* HEADER */}
                <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4 text-white" style={{ backgroundColor: 'var(--primary)' }}>
                    <div>
                        <h1 className="text-2xl font-bold">Daily Attendance</h1>
                        <p className="text-white/70 text-sm">Mark attendance for all staff members</p>
                    </div>
                </div>

                {/* CONTROLS */}
                <div className="p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4" style={{ backgroundColor: 'var(--gray-200)', borderColor: 'var(--border-light)' }}>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="p-2 border rounded-lg outline-none"
                        style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)', color: 'var(--text)' }}
                    />
                    <div className="text-sm font-medium opacity-70">
                        {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                </div>

                {/* STAFF LIST */}
                <div className="p-6 space-y-6">
                    {loading ? (
                        <div className="text-center py-10 opacity-50">Loading staff details...</div>
                    ) : (
                        <>
                            {staffList.map((staff, index) => (
                                <div key={staff.staffId} className="p-4 rounded-xl border hover:shadow-md transition-shadow" style={{ backgroundColor: 'var(--gray-200)', borderColor: 'var(--border-light)' }}>

                                    {/* STAFF HEADER */}
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--primary)' }}>
                                                {staff.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg" style={{ color: 'var(--text)' }}>{staff.name}</h3>
                                                <p className="text-xs opacity-60 uppercase tracking-wide" style={{ color: 'var(--text)' }}>Staff Member</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* STATUS GRID */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                                        {["Present", "Absent", "Half Day", "Leave"].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => updateRecord(index, "status", status)}
                                                className={`
                                                    py-2 px-3 rounded-lg text-sm font-medium border transition-colors
                                                    ${staff.status === status
                                                        ? 'bg-green-100 text-green-800 border-green-300'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-100'
                                                    }
                                                    ${status === 'Absent' && staff.status === status ? '!bg-red-100 !text-red-800 !border-red-300' : ''}
                                                `}
                                                style={staff.status !== status && status !== 'Absent' ? { backgroundColor: 'var(--background)', color: 'var(--text)', borderColor: 'var(--border-light)' } : {}}
                                            >
                                                {status === 'Present' && '✅ '}
                                                {status === 'Absent' && '⛔ '}
                                                {status}
                                            </button>
                                        ))}
                                    </div>

                                    {/* TIME & REMARKS */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                        <div>
                                            <label className="text-xs font-bold uppercase opacity-60 mb-1 block" style={{ color: 'var(--text)' }}>Check-In</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="time"
                                                    value={staff.checkIn}
                                                    onChange={(e) => updateRecord(index, "checkIn", e.target.value)}
                                                    className="w-full p-2 border rounded text-sm"
                                                    style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)', color: 'var(--text)' }}
                                                />
                                                <button
                                                    onClick={() => updateRecord(index, "checkIn", new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))}
                                                    className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                                                    style={{ backgroundColor: 'var(--gray-200)', color: 'var(--text)' }}
                                                >Now</button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold uppercase opacity-60 mb-1 block" style={{ color: 'var(--text)' }}>Check-Out</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="time"
                                                    value={staff.checkOut}
                                                    onChange={(e) => updateRecord(index, "checkOut", e.target.value)}
                                                    className="w-full p-2 border rounded text-sm"
                                                    style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)', color: 'var(--text)' }}
                                                />
                                                <button
                                                    onClick={() => updateRecord(index, "checkOut", new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }))}
                                                    className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
                                                    style={{ backgroundColor: 'var(--gray-200)', color: 'var(--text)' }}
                                                >Now</button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-bold uppercase opacity-60 mb-1 block" style={{ color: 'var(--text)' }}>Remarks</label>
                                            <input
                                                type="text"
                                                placeholder="Optional notes..."
                                                value={staff.remarks}
                                                onChange={(e) => updateRecord(index, "remarks", e.target.value)}
                                                className="w-full p-2 border rounded text-sm focus:border-blue-500 outline-none"
                                                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border-light)', color: 'var(--text)' }}
                                            />
                                        </div>

                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>

                {/* FOOTER ACTIONS */}
                <div className="p-6 border-t bg-gray-50 dark:bg-gray-800 flex justify-between items-center" style={{ backgroundColor: 'var(--gray-100)' }}>
                    <button
                        className="text-sm text-gray-500 hover:text-gray-800 underline"
                        onClick={() => setAllStatus('Present')}
                    >
                        Mark All Present
                    </button>

                    <button
                        onClick={saveAttendance}
                        disabled={saving}
                        className={`
               px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-transform
               ${saving ? 'bg-gray-400 cursor-not-allowed' : 'hover:scale-105'}
             `}
                        style={{ backgroundColor: saving ? 'var(--gray-200)' : 'var(--primary)' }}
                    >
                        {saving ? "Saving..." : "Save All Attendance"}
                    </button>
                </div>

            </div>
        </div>
    );
}
