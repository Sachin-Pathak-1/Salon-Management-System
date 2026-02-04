import React, { useState } from "react";

import './Appointments.css'

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      userName: "John Doe",
      date: "2026-01-30",
      time: "10:00 AM",
      service: "Consultation",
      status: "Pending",
      email: "john@example.com",
    },
    {
      id: 2,
      userName: "Jane Smith",
      date: "2026-01-28",
      time: "2:00 PM",
      service: "Service A",
      status: "Confirmed",
      email: "jane@example.com",
    },
    {
      id: 3,
      userName: "Mike Johnson",
      date: "2026-01-27",
      time: "11:30 AM",
      service: "Service B",
      status: "Completed",
      email: "mike@example.com",
    },
    {
      id: 4,
      userName: "Sarah Wilson",
      date: "2026-02-01",
      time: "3:30 PM",
      service: "Consultation",
      status: "Pending",
      email: "sarah@example.com",
    },
  ]);

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

  const handleStatusChange = (id, newStatus) => {
    setAppointments(
      appointments.map((apt) =>
        apt.id === id ? { ...apt, status: newStatus } : apt
      )
    );
  };

  return (
    <div className="admin-layout">
    
      <main className="admin-main-content">
        <div className="admin-header">
          <h1>Appointments</h1>
          <p>Manage all appointments</p>
        </div>
        <div className="admin-content">
          <div className="appointments-controls">
            <input type="text" placeholder="Search appointments..." className="search-input" />
            <select className="filter-select">
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="appointments-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Service</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>#{appointment.id}</td>
                    <td>{appointment.userName}</td>
                    <td>{appointment.email}</td>
                    <td>{appointment.date}</td>
                    <td>{appointment.time}</td>
                    <td>{appointment.service}</td>
                    <td>
                      <span className={`status ${getStatusColor(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td>
                      <select
                        value={appointment.status}
                        onChange={(e) => handleStatusChange(appointment.id, e.target.value)}
                        className="status-select"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}