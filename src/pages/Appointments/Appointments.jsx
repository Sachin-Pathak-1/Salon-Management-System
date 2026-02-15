import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from '../../api';

import './Appointments.css'

const SELECTED_SALON_KEY = "selectedSalonId";

export default function AdminAppointments() {
  const navigate = useNavigate();

  const normalizeAppointments = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.appointments)) return payload.appointments;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
  };

  const [appointments, setAppointments] = useState([]);
  const [salons, setSalons] = useState([]);
  const [selectedSalonId, setSelectedSalonId] = useState(
    localStorage.getItem(SELECTED_SALON_KEY) || ""
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await api.get('/appointments');
        setAppointments(normalizeAppointments(response.data));
      } catch (err) {
        setError('Failed to load appointments');
        console.error('Error loading appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const response = await api.get('/salons/get');
        const list = Array.isArray(response.data) ? response.data : [];
        setSalons(list);

        if (!list.length) {
          setSelectedSalonId("");
          localStorage.removeItem(SELECTED_SALON_KEY);
          return;
        }

        const storedSalonId = localStorage.getItem(SELECTED_SALON_KEY);
        const hasStoredSalon = list.some((s) => s._id === storedSalonId);
        const nextSalonId = hasStoredSalon ? storedSalonId : list[0]._id;
        setSelectedSalonId(nextSalonId);
        localStorage.setItem(SELECTED_SALON_KEY, nextSalonId);
      } catch (err) {
        console.error('Error loading salons:', err);
      }
    };

    fetchSalons();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "pending";
      case "Confirmed":
        return "confirmed";
      case "Completed":
        return "completed";
      case "Cancelled":
        return "cancelled";
      default:
        return "";
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/appointments/${id}/status`, { status: newStatus });
      // Update local state
      setAppointments((prev) =>
        Array.isArray(prev)
          ? prev.map((apt) =>
              apt._id === id ? { ...apt, status: newStatus } : apt
            )
          : []
      );
    } catch (err) {
      console.error('Error updating appointment status:', err);
      alert('Failed to update appointment status');
    }
  };

  const getSalonId = (appointment) => {
    if (!appointment?.salonId) return "";
    return typeof appointment.salonId === "string"
      ? appointment.salonId
      : appointment.salonId._id || "";
  };

  const safeAppointments = Array.isArray(appointments) ? appointments : [];

  const filteredAppointments = selectedSalonId
    ? safeAppointments.filter((appointment) => getSalonId(appointment) === selectedSalonId)
    : safeAppointments;

  const selectedSalonName =
    salons.find((s) => s._id === selectedSalonId)?.name || "Selected salon";

  if (loading) return <div className="admin-layout"><div className="admin-main-content"><div>Loading appointments...</div></div></div>;
  if (error) return <div className="admin-layout"><div className="admin-main-content"><div>{error}</div></div></div>;

  return (
    <div className="admin-layout">

      <main className="admin-main-content">
        <div className="admin-header">
          <h1>Appointments</h1>
          <p>Showing appointments for: {selectedSalonName}</p>
        </div>
        <div className="admin-content">
          <div className="appointments-controls">
            <button
              className="bg-[var(--primary)] text-white border-none px-4 py-2 rounded font-bold cursor-pointer transition-all duration-300 ease hover:bg-[var(--secondary)]"
              onClick={() => navigate('/add-appointment')}
            >
              Add Appointment
            </button>
            <input type="text" placeholder="Search appointments..." className="search-input" />
            <select className="filter-select">
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="appointments-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Service</th>
                  <th>Staff</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-8 text-gray-500">
                      No appointments found for this salon.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td>#{appointment._id.slice(-6)}</td>
                      <td>{appointment.customerName}</td>
                      <td>{appointment.customerEmail}</td>
                      <td>{new Date(appointment.date).toLocaleDateString()}</td>
                      <td>{appointment.time}</td>
                      <td>{appointment.serviceId?.name || 'N/A'}</td>
                      <td>{appointment.staffId?.name || 'N/A'}</td>
                      <td>
                        <span className={`status ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td>
                        <select
                          value={appointment.status}
                          onChange={(e) => handleStatusChange(appointment._id, e.target.value)}
                          className="status-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
