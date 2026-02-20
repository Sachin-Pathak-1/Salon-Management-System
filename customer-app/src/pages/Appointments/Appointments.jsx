import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

import "./Appointments.css";

export default function AdminAppointments() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("scheduled");
  const [appointments, setAppointments] = useState([]);
  const [salons, setSalons] = useState([]);
  const [staffOptions, setStaffOptions] = useState([]);
  const [serviceOptions, setServiceOptions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [savingWalkIn, setSavingWalkIn] = useState(false);
  const [error, setError] = useState(null);
  const [walkInError, setWalkInError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [walkInForm, setWalkInForm] = useState({
    customerName: "",
    customerContact: "",
    customerEmail: "",
    notes: "",
    salonId: "",
    staffId: "",
    serviceId: ""
  });

  const toId = (value) => {
    if (!value) return "";
    if (typeof value === "object") return String(value._id || value.id || "");
    return String(value);
  };

  const isStaffAssignedToService = (member, service) => {
    if (!member || !service) return false;

    const serviceId = toId(service._id);
    const staffId = toId(member._id);
    const memberServices = Array.isArray(member.services) ? member.services : [];
    const serviceStaff = Array.isArray(service.assignedStaff) ? service.assignedStaff : [];

    const mappedFromStaff = memberServices.some((id) => toId(id) === serviceId);
    const mappedFromService = serviceStaff.some((id) => toId(id) === staffId);

    return mappedFromStaff || mappedFromService;
  };

  useEffect(() => {
    const fetchInitial = async () => {
      try {
        const [appointmentsRes, salonsRes] = await Promise.all([
          api.get("/appointments"),
          api.get("/salons/get")
        ]);

        const fetchedAppointments = appointmentsRes.data || [];
        const fetchedSalons = salonsRes.data || [];

        setAppointments(fetchedAppointments);
        setSalons(fetchedSalons);

        const activeSalon = localStorage.getItem("activeSalon");
        const defaultSalonId =
          fetchedSalons.find((s) => s._id === activeSalon)?._id || fetchedSalons[0]?._id || "";

        setWalkInForm((prev) => ({
          ...prev,
          salonId: defaultSalonId
        }));
      } catch (err) {
        setError("Failed to load appointments");
        console.error("Error loading appointments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitial();
  }, []);

  useEffect(() => {
    const salonId = walkInForm.salonId;
    if (!salonId) {
      setStaffOptions([]);
      setServiceOptions([]);
      return;
    }

    const fetchSalonDetails = async () => {
      try {
        const res = await api.get(`/appointments/salon/${salonId}/details`);
        setStaffOptions(res.data.staff || []);
        setServiceOptions(res.data.services || []);
      } catch (err) {
        setStaffOptions([]);
        setServiceOptions([]);
        setWalkInError("Failed to load staff/services for selected salon");
      }
    };

    fetchSalonDetails();
  }, [walkInForm.salonId]);

  const selectedWalkInStaff = staffOptions.find((member) => toId(member._id) === toId(walkInForm.staffId));
  const selectedWalkInService = serviceOptions.find((service) => toId(service._id) === toId(walkInForm.serviceId));

  const filteredWalkInStaff = walkInForm.serviceId
    ? staffOptions.filter((member) => isStaffAssignedToService(member, selectedWalkInService))
    : staffOptions;

  const filteredWalkInServices = walkInForm.staffId
    ? serviceOptions.filter((service) => isStaffAssignedToService(selectedWalkInStaff, service))
    : serviceOptions;

  const isWalkInServiceUnavailable = Boolean(walkInForm.serviceId) && filteredWalkInStaff.length === 0;

  const getStatusColor = (status = "") => {
    switch (String(status).toLowerCase()) {
      case "pending":
        return "pending";
      case "confirmed":
        return "confirmed";
      case "completed":
        return "completed";
      case "cancelled":
        return "cancelled";
      default:
        return "";
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/appointments/${id}/status`, { status: newStatus });
      setAppointments((prev) =>
        prev.map((apt) => (apt._id === id ? { ...apt, status: newStatus } : apt))
      );
    } catch (err) {
      console.error("Error updating appointment status:", err);
      alert("Failed to update appointment status");
    }
  };

  const handleWalkInInput = (e) => {
    const { name, value } = e.target;
    setWalkInError("");
    setWalkInForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "salonId") {
        next.staffId = "";
        next.serviceId = "";
      }

      if (name === "staffId" && value && prev.serviceId) {
        const nextStaff = staffOptions.find((member) => toId(member._id) === toId(value));
        const currentService = serviceOptions.find((service) => toId(service._id) === toId(prev.serviceId));
        if (nextStaff && currentService && !isStaffAssignedToService(nextStaff, currentService)) {
          next.serviceId = "";
        }
      }

      if (name === "serviceId" && value && prev.staffId) {
        const currentStaff = staffOptions.find((member) => toId(member._id) === toId(prev.staffId));
        const nextService = serviceOptions.find((service) => toId(service._id) === toId(value));
        if (currentStaff && nextService && !isStaffAssignedToService(currentStaff, nextService)) {
          next.staffId = "";
        }
      }

      return next;
    });
  };

  const handleCreateWalkIn = async (e) => {
    e.preventDefault();
    setWalkInError("");

    const missing = [];
    if (!walkInForm.customerName.trim()) missing.push("Customer Name");
    if (!walkInForm.customerContact.trim()) missing.push("Customer Contact");
    if (!walkInForm.salonId) missing.push("Salon");
    if (!walkInForm.staffId) missing.push("Staff");
    if (!walkInForm.serviceId) missing.push("Service");

    if (missing.length > 0) {
      setWalkInError(`Please fill required fields: ${missing.join(", ")}`);
      return;
    }

    setSavingWalkIn(true);

    try {
      const payload = {
        ...walkInForm,
        customerName: walkInForm.customerName.trim(),
        customerContact: walkInForm.customerContact.trim(),
        customerEmail: walkInForm.customerEmail.trim(),
        notes: walkInForm.notes.trim()
      };

      const res = await api.post("/appointments/create-walkin", payload);
      const created = res.data?.appointment;

      if (created) {
        setAppointments((prev) => [created, ...prev]);
      }

      setWalkInForm((prev) => ({
        ...prev,
        customerName: "",
        customerContact: "",
        customerEmail: "",
        notes: "",
        staffId: "",
        serviceId: ""
      }));
    } catch (err) {
      const status = err?.response?.status;
      const responseMessage =
        typeof err?.response?.data === "string"
          ? err.response.data
          : err?.response?.data?.message;

      const message =
        responseMessage ||
        (status === 404
          ? "Walk-in endpoint not found. Restart backend server."
          : "Failed to create walk-in slot");
      setWalkInError(message);
    } finally {
      setSavingWalkIn(false);
    }
  };

  const visibleAppointments = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return appointments
      .filter((apt) => (activeTab === "walkins" ? !!apt.isWalkIn : !apt.isWalkIn))
      .filter((apt) => !filterStatus || apt.status === filterStatus)
      .filter((apt) => {
        if (!normalizedSearch) return true;

        const stack = [
          apt.customerName,
          apt.customerEmail,
          apt.customerContact,
          apt.staffId?.name,
          apt.serviceId?.name,
          apt.salonId?.name,
          apt.notes
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return stack.includes(normalizedSearch);
      })
      .sort((a, b) => {
        const aDt = new Date(`${new Date(a.date).toISOString().slice(0, 10)}T${a.time}`);
        const bDt = new Date(`${new Date(b.date).toISOString().slice(0, 10)}T${b.time}`);
        return bDt - aDt;
      });
  }, [appointments, activeTab, filterStatus, searchTerm]);

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="admin-main-content">
          <div>Loading appointments...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-layout">
        <div className="admin-main-content">
          <div>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <main className="admin-main-content">
        <div className="admin-header">
          <h1>Appointments</h1>
          <p>Manage scheduled appointments and walk-in slots</p>
        </div>

        <div className="admin-content">
          <div className="tabs-bar">
            <button
              type="button"
              className={`tab-btn ${activeTab === "scheduled" ? "active" : ""}`}
              onClick={() => setActiveTab("scheduled")}
            >
              Scheduled Appointments
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "walkins" ? "active" : ""}`}
              onClick={() => setActiveTab("walkins")}
            >
              Walk-ins
            </button>
          </div>

          <div className="appointments-controls">
            {activeTab === "scheduled" ? (
              <button
                className="bg-[var(--primary)] text-white border-none px-4 py-2 rounded font-bold cursor-pointer transition-all duration-300 ease hover:bg-[var(--secondary)]"
                onClick={() => navigate("/add-appointment")}
              >
                Add Appointment
              </button>
            ) : null}

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeTab === "walkins" ? "Search walk-ins..." : "Search appointments..."}
              className="search-input"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {activeTab === "walkins" && (
            <form className="walkin-form" onSubmit={handleCreateWalkIn}>
              <h3>Create Walk-in Slot</h3>

              {walkInError ? <p className="walkin-error">{walkInError}</p> : null}

              <div className="walkin-grid">
                <input
                  type="text"
                  name="customerName"
                  placeholder="Customer Name *"
                  value={walkInForm.customerName}
                  onChange={handleWalkInInput}
                />
                <input
                  type="tel"
                  name="customerContact"
                  placeholder="Customer Contact *"
                  value={walkInForm.customerContact}
                  onChange={handleWalkInInput}
                />
                <input
                  type="email"
                  name="customerEmail"
                  placeholder="Customer Email (Optional)"
                  value={walkInForm.customerEmail}
                  onChange={handleWalkInInput}
                />

                <select name="salonId" value={walkInForm.salonId} onChange={handleWalkInInput}>
                  <option value="">Select Salon *</option>
                  {salons.map((salon) => (
                    <option key={salon._id} value={salon._id}>
                      {salon.name}
                    </option>
                  ))}
                </select>

                <select name="staffId" value={walkInForm.staffId} onChange={handleWalkInInput}>
                  <option value="">Select Staff *</option>
                  {filteredWalkInStaff.map((staff) => (
                    <option key={staff._id} value={staff._id}>
                      {staff.name}
                    </option>
                  ))}
                </select>
                {isWalkInServiceUnavailable ? (
                  <p className="walkin-error">Staff for this service is currently unavailable.</p>
                ) : null}

                <select name="serviceId" value={walkInForm.serviceId} onChange={handleWalkInInput}>
                  <option value="">Select Service *</option>
                  {filteredWalkInServices.map((service) => (
                    <option key={service._id} value={service._id}>
                      {service.name} - Rs.{service.price || 0}
                    </option>
                  ))}
                </select>
                {walkInForm.staffId && filteredWalkInServices.length === 0 ? (
                  <p className="walkin-error">No services available for selected staff.</p>
                ) : null}
              </div>

              <textarea
                name="notes"
                placeholder="Notes (Optional)"
                value={walkInForm.notes}
                onChange={handleWalkInInput}
                rows={2}
              />

              <button type="submit" disabled={savingWalkIn} className="walkin-submit">
                {savingWalkIn ? "Creating..." : "Create Walk-in Slot"}
              </button>
            </form>
          )}

          <div className="appointments-table">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Customer Name</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Service</th>
                  <th>Staff</th>
                  {activeTab === "walkins" ? <th>Token</th> : null}
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === "walkins" ? "11" : "10"} className="text-center py-8 text-gray-500">
                      {activeTab === "walkins"
                        ? "No walk-ins found. Create your first walk-in slot!"
                        : "No appointments found. Create your first appointment!"}
                    </td>
                  </tr>
                ) : (
                  visibleAppointments.map((appointment) => (
                    <tr key={appointment._id}>
                      <td>#{appointment._id.slice(-6)}</td>
                      <td>{appointment.customerName}</td>
                      <td>{appointment.customerContact || "-"}</td>
                      <td>{appointment.customerEmail || "-"}</td>
                      <td>{new Date(appointment.date).toLocaleDateString()}</td>
                      <td>{appointment.time}</td>
                      <td>{appointment.serviceId?.name || "N/A"}</td>
                      <td>{appointment.staffId?.name || "N/A"}</td>
                      {activeTab === "walkins" ? <td>{appointment.walkInToken || "-"}</td> : null}
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
