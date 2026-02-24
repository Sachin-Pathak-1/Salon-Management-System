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

const parseApiError = (err, fallback) => {
  const status = err?.response?.status;
  const message = err?.response?.data?.message || err?.message || fallback;
  return status ? `${message} (HTTP ${status})` : message;
};

export function CustomerCreateAppointmentPage() {
  const navigate = useNavigate();
  const [salons, setSalons] = useState([]);
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    salonId: "",
    staffId: "",
    serviceId: "",
    date: "",
    time: "",
    notes: "",
    customerContact: ""
  });

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      setError("");
      try {
        let salonRes;
        try {
          salonRes = await api.get("/salons/public");
        } catch {
          salonRes = await api.get("/salons/get");
        }
        let profileRes = null;
        try {
          profileRes = await api.get("/auth/customer/me");
        } catch {
          profileRes = null;
        }

        const allSalons = Array.isArray(salonRes.data) ? salonRes.data : [];
        setSalons(allSalons);

        const defaultSalonId = allSalons[0]?._id || "";
        setForm((prev) => ({
          ...prev,
          salonId: defaultSalonId,
          customerContact: profileRes?.data?.contact || ""
        }));
      } catch (err) {
        setError(parseApiError(err, "Failed to load booking data"));
      } finally {
        setLoading(false);
      }
    };

    loadInitial();
  }, []);

  useEffect(() => {
    const loadSalonDetails = async () => {
      if (!form.salonId) {
        setStaff([]);
        setServices([]);
        return;
      }

      setError("");
      try {
        let res;
        try {
          res = await api.get(`/appointments/public/salon/${form.salonId}/details`);
        } catch {
          res = await api.get(`/appointments/salon/${form.salonId}/details`);
        }
        setStaff(Array.isArray(res.data?.staff) ? res.data.staff : []);
        setServices(Array.isArray(res.data?.services) ? res.data.services : []);
      } catch (err) {
        setError(parseApiError(err, "Failed to load salon details"));
        setStaff([]);
        setServices([]);
      }
    };

    loadSalonDetails();
  }, [form.salonId]);

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
    if (!form.staffId || !form.serviceId) return;
    const serviceStillValid = filteredServices.some(
      (service) => toId(service) === toId(form.serviceId)
    );
    if (!serviceStillValid) {
      setForm((prev) => ({ ...prev, serviceId: "" }));
    }
  }, [form.staffId, form.serviceId, filteredServices]);

  useEffect(() => {
    if (!form.staffId || !form.serviceId) return;
    const staffStillValid = filteredStaff.some(
      (member) => toId(member) === toId(form.staffId)
    );
    if (!staffStillValid) {
      setForm((prev) => ({ ...prev, staffId: "" }));
    }
  }, [form.staffId, form.serviceId, filteredStaff]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setSuccess("");

    if (name === "salonId") {
      setForm((prev) => ({ ...prev, salonId: value, staffId: "", serviceId: "" }));
      return;
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.salonId || !form.staffId || !form.serviceId || !form.date || !form.time) {
      setError("Salon, staff, service, date and time are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post("/appointments/customer/create", {
        salonId: form.salonId,
        staffId: form.staffId,
        serviceId: form.serviceId,
        date: form.date,
        time: form.time,
        notes: form.notes,
        customerContact: form.customerContact
      });
      setSuccess(res?.data?.message || "Appointment created successfully");
      setTimeout(() => navigate("/customer/profile"), 900);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create appointment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-70px)] bg-[var(--background)] px-4 py-8 text-[var(--text)]">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--border-light)] bg-[var(--gray-100)] p-8 shadow-xl">
          Loading booking form...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-70px)] bg-[var(--background)] px-4 py-8 text-[var(--text)]">
      <div className="mx-auto max-w-3xl rounded-2xl border border-[var(--border-light)] bg-[var(--gray-100)] p-8 shadow-xl">
        <h1 className="text-3xl font-bold">Create Appointment</h1>
        <p className="mt-2 text-sm opacity-80">
          Pick your salon, choose staff or service, and confirm a time slot.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-300 bg-red-100 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 rounded-lg border border-green-300 bg-green-100 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium">Salon</label>
            <select
              name="salonId"
              value={form.salonId}
              onChange={handleChange}
              className="input-themed"
            >
              <option value="">Select salon</option>
              {salons.map((salon) => (
                <option key={salon._id} value={salon._id}>
                  {salon.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Staff</label>
            <select
              name="staffId"
              value={form.staffId}
              onChange={handleChange}
              className="input-themed"
            >
              <option value="">Select staff</option>
              {filteredStaff.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Service</label>
            <select
              name="serviceId"
              value={form.serviceId}
              onChange={handleChange}
              className="input-themed"
            >
              <option value="">Select service</option>
              {filteredServices.map((service) => (
                <option key={service._id} value={service._id}>
                  {service.name} {Number.isFinite(service.price) ? `- Rs ${service.price}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="input-themed"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Time</label>
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              className="input-themed"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Contact</label>
            <input
              name="customerContact"
              value={form.customerContact}
              onChange={handleChange}
              className="input-themed"
              placeholder="Phone number"
            />
          </div>

          <div className="md:col-span-1">
            <label className="mb-1 block text-sm font-medium">Notes (optional)</label>
            <input
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="input-themed"
              placeholder="Any special request"
            />
          </div>

          <div className="md:col-span-2 mt-2 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-[var(--primary)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--secondary)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Creating..." : "Create Appointment"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/customer/profile")}
              className="rounded-lg border border-[var(--border-light)] px-6 py-3 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
