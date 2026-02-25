import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

const toId = (value) => String(value?._id || value || "");

const staffCanDoService = (staff, serviceId) => {
  const staffServices = Array.isArray(staff?.services) ? staff.services : [];
  return staffServices.some((service) => toId(service) === toId(serviceId));
};

const serviceHasStaff = (service, staffId) => {
  const assignedStaff = Array.isArray(service?.assignedStaff) ? service.assignedStaff : [];
  return assignedStaff.some((staff) => toId(staff) === toId(staffId));
};

const getTodayDate = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export function InlineBookingWidget({ experience, open, preselectedServiceName = "" }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [salonMeta, setSalonMeta] = useState({
    openingTime: "09:00",
    closingTime: "20:00",
    status: "open",
    holidays: []
  });
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [slots, setSlots] = useState([]);
  const [slotsMessage, setSlotsMessage] = useState("");
  const [form, setForm] = useState({
    serviceId: "",
    staffId: "",
    date: getTodayDate(),
    time: "",
    notes: "",
    customerContact: ""
  });

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch {
      return null;
    }
  }, []);
  const isCustomer = currentUser?.role === "customer";
  const isLoggedIn = Boolean(localStorage.getItem("token"));
  const canBook = isLoggedIn && isCustomer;

  useEffect(() => {
    if (!open || !experience?.id) return;

    let cancelled = false;
    const loadDetails = async () => {
      setLoading(true);
      setError("");
      try {
        const detailsRes = await api.get(`/appointments/public/salon/${experience.id}/details`);
        if (cancelled) return;

        const salon = detailsRes?.data?.salon || {};
        const nextStaff = Array.isArray(detailsRes?.data?.staff) ? detailsRes.data.staff : [];
        const nextServices = Array.isArray(detailsRes?.data?.services) ? detailsRes.data.services : [];

        setSalonMeta({
          openingTime: salon.openingTime || "09:00",
          closingTime: salon.closingTime || "20:00",
          status: salon.status || "open",
          holidays: Array.isArray(salon.holidays) ? salon.holidays : []
        });
        setStaff(nextStaff);
        setServices(nextServices);

        setForm((prev) => {
          let nextServiceId = prev.serviceId;
          if (!nextServices.some((service) => toId(service) === toId(nextServiceId))) {
            nextServiceId = "";
          }

          if (preselectedServiceName) {
            const matched = nextServices.find(
              (service) =>
                String(service.name || "").trim().toLowerCase() ===
                String(preselectedServiceName).trim().toLowerCase()
            );
            if (matched) nextServiceId = String(matched._id);
          }

          return {
            ...prev,
            serviceId: nextServiceId,
            staffId: "",
            time: ""
          };
        });
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || "Failed to load booking details");
          setStaff([]);
          setServices([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadDetails();
    return () => {
      cancelled = true;
    };
  }, [open, experience?.id, preselectedServiceName]);

  const filteredServices = useMemo(() => {
    if (!form.staffId) return services;
    return services.filter(
      (service) =>
        staffCanDoService(
          staff.find((member) => toId(member) === toId(form.staffId)),
          service._id
        ) || serviceHasStaff(service, form.staffId)
    );
  }, [services, staff, form.staffId]);

  const filteredStaff = useMemo(() => {
    if (!form.serviceId) return staff;
    return staff.filter(
      (member) =>
        staffCanDoService(member, form.serviceId) ||
        serviceHasStaff(
          services.find((service) => toId(service) === toId(form.serviceId)),
          member._id
        )
    );
  }, [services, staff, form.serviceId]);

  useEffect(() => {
    if (!form.serviceId || !form.staffId) return;
    const stillValid = filteredServices.some((service) => toId(service) === toId(form.serviceId));
    if (!stillValid) {
      setForm((prev) => ({ ...prev, serviceId: "", time: "" }));
    }
  }, [form.serviceId, form.staffId, filteredServices]);

  useEffect(() => {
    if (!form.serviceId || !form.staffId) return;
    const stillValid = filteredStaff.some((member) => toId(member) === toId(form.staffId));
    if (!stillValid) {
      setForm((prev) => ({ ...prev, staffId: "", time: "" }));
    }
  }, [form.serviceId, form.staffId, filteredStaff]);

  useEffect(() => {
    if (!open || !experience?.id || !form.staffId || !form.date) {
      setSlots([]);
      setSlotsMessage("");
      return;
    }

    let cancelled = false;
    const loadAvailability = async () => {
      setError("");
      try {
        const res = await api.get("/appointments/public/availability", {
          params: {
            salonId: experience.id,
            staffId: form.staffId,
            date: form.date
          }
        });

        if (cancelled) return;
        const nextSlots = Array.isArray(res?.data?.slots) ? res.data.slots : [];
        setSlots(nextSlots);
        setSlotsMessage(res?.data?.message || "");

        if (!nextSlots.some((slot) => slot.time === form.time && slot.available)) {
          setForm((prev) => ({ ...prev, time: "" }));
        }
      } catch (err) {
        if (!cancelled) {
          setSlots([]);
          setSlotsMessage("");
          setError(err?.response?.data?.message || "Failed to load time slots");
        }
      }
    };

    loadAvailability();
    return () => {
      cancelled = true;
    };
  }, [open, experience?.id, form.staffId, form.date]);

  const selectedService = useMemo(
    () => services.find((service) => toId(service) === toId(form.serviceId)),
    [services, form.serviceId]
  );
  const noBookingSetup = !loading && (staff.length === 0 || services.length === 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!canBook) {
      setError("Please login as customer to book.");
      return;
    }

    if (!form.serviceId || !form.staffId || !form.date || !form.time) {
      setError("Please select service, staff, date and time.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/appointments/customer/create", {
        salonId: experience.id,
        serviceId: form.serviceId,
        staffId: form.staffId,
        date: form.date,
        time: form.time,
        notes: form.notes,
        customerContact: form.customerContact
      });

      setSuccess(res?.data?.message || "Appointment booked successfully");
      setForm((prev) => ({ ...prev, time: "", notes: "" }));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to book appointment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <article className="beauty-panel beauty-fade" style={{ marginTop: 16 }}>
      <div className="beauty-panel-body">
        <div className="beauty-row" style={{ alignItems: "flex-start" }}>
          <div>
            <h2 style={{ marginTop: 0 }}>Book Appointment</h2>
            <p className="beauty-muted" style={{ marginTop: 4, marginBottom: 0 }}>
              Select service, staff and an available slot between {salonMeta.openingTime} and {salonMeta.closingTime}.
            </p>
          </div>
          {selectedService && (
            <div className="beauty-tag">
              {selectedService.name} - Rs {selectedService.price || 0}
            </div>
          )}
        </div>

        {!canBook && (
          <div className="beauty-book-alert beauty-book-alert-warn">
            Please login as customer to complete booking.
            <button
              type="button"
              className="beauty-btn beauty-btn-primary"
              style={{ marginLeft: 10 }}
              onClick={() => navigate("/customer-login")}
            >
              Customer Login
            </button>
          </div>
        )}

        {error && <div className="beauty-book-alert beauty-book-alert-error">{error}</div>}
        {success && <div className="beauty-book-alert beauty-book-alert-success">{success}</div>}
        {noBookingSetup && (
          <div className="beauty-book-alert beauty-book-alert-warn">
            This salon currently has no active staff/services configured for booking.
          </div>
        )}

        {loading ? (
          <div className="beauty-empty" style={{ marginTop: 12 }}>Loading booking options...</div>
        ) : (
          <form onSubmit={handleSubmit} className="beauty-book-grid">
            <label className="beauty-book-field">
              <span>Service</span>
              <select
                className="beauty-select"
                value={form.serviceId}
                onChange={(e) => setForm((prev) => ({ ...prev, serviceId: e.target.value, time: "" }))}
              >
                <option value="">Select service</option>
                {filteredServices.map((service) => (
                  <option key={service._id} value={service._id}>
                    {service.name} - Rs {service.price || 0}
                  </option>
                ))}
              </select>
            </label>

            <label className="beauty-book-field">
              <span>Staff</span>
              <select
                className="beauty-select"
                value={form.staffId}
                onChange={(e) => setForm((prev) => ({ ...prev, staffId: e.target.value, time: "" }))}
              >
                <option value="">Select staff</option>
                {filteredStaff.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="beauty-book-field">
              <span>Date</span>
              <input
                type="date"
                className="beauty-input"
                min={getTodayDate()}
                value={form.date}
                onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value, time: "" }))}
              />
            </label>

            <label className="beauty-book-field">
              <span>Contact</span>
              <input
                className="beauty-input"
                value={form.customerContact}
                placeholder="Phone number"
                onChange={(e) => setForm((prev) => ({ ...prev, customerContact: e.target.value }))}
              />
            </label>

            <label className="beauty-book-field beauty-book-field-full">
              <span>Notes (optional)</span>
              <input
                className="beauty-input"
                value={form.notes}
                placeholder="Any special request"
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </label>

            <div className="beauty-book-field beauty-book-field-full">
              <span>Available Time Slots</span>
              {!form.staffId ? (
                <div className="beauty-muted">Select staff and date to view slots.</div>
              ) : slots.length === 0 ? (
                <div className="beauty-muted">{slotsMessage || "No slots available for selected day."}</div>
              ) : (
                <div className="beauty-slots">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setForm((prev) => ({ ...prev, time: slot.time }))}
                      className={`beauty-slot ${form.time === slot.time ? "active" : ""}`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="beauty-book-field beauty-book-field-full" style={{ marginTop: 6 }}>
              <button
                type="submit"
                disabled={submitting || !canBook}
                className="beauty-btn beauty-btn-primary"
              >
                {submitting ? "Booking..." : "Confirm Appointment"}
              </button>
            </div>
          </form>
        )}
      </div>
    </article>
  );
}
