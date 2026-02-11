import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

export default function CreateAppointment() {
  const { salonId } = useParams();
  const navigate = useNavigate();

  const [salon, setSalon] = useState(null);
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerContact: '',
    date: '',
    time: '',
    notes: '',
    staffId: '',
    serviceId: ''
  });

  useEffect(() => {
    const fetchSalonDetails = async () => {
      try {
        const detailsResponse = await api.get(`/appointments/salon/${salonId}/details`);
        setStaff(detailsResponse.data.staff || []);
        setServices(detailsResponse.data.services || []);

        const salonResponse = await api.get('/salons/get');
        const currentSalon = salonResponse.data.find(s => s._id === salonId);
        setSalon(currentSalon);

      } catch (err) {
        setError('Failed to load salon details');
      } finally {
        setLoading(false);
      }
    };

    fetchSalonDetails();
  }, [salonId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const missingFields = [];
    if (!formData.customerName?.trim()) missingFields.push('Customer Name');
    if (!formData.customerEmail?.trim()) missingFields.push('Customer Email');
    if (!formData.customerContact?.trim()) missingFields.push('Customer Contact');
    if (!formData.date) missingFields.push('Date');
    if (!formData.time) missingFields.push('Time');
    if (!formData.staffId) missingFields.push('Staff selection');
    if (!formData.serviceId) missingFields.push('Service selection');

    if (missingFields.length > 0) {
      setError(`Please fill all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/appointments/create', {
        ...formData,
        salonId
      });

      // Redirect only if success
      navigate('/appointments');

    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <div className="admin-main-content">
          <div className="opacity-70">Loading salon details...</div>
        </div>
      </div>
    );
  }

  if (error && !salon) {
    return (
      <div className="admin-layout">
        <div className="admin-main-content">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (staff.length === 0 || services.length === 0) {
    return (
      <div className="admin-layout">
        <main className="admin-main-content">
          <div className="admin-header">
            <h1>Cannot Create Appointment</h1>
            <p>Salon setup incomplete</p>
          </div>
          <div className="admin-content">
            <div className="max-w-2xl mx-auto p-6 rounded-2xl border">
              <div className="text-center">
                <h2 className="text-xl font-semibold mb-4">
                  This salon is not ready for appointments
                </h2>
                <div className="space-y-2 text-left">
                  {staff.length === 0 && (
                    <p className="text-red-500">No staff members assigned</p>
                  )}
                  {services.length === 0 && (
                    <p className="text-red-500">No services available</p>
                  )}
                </div>
                <div className="flex justify-center space-x-4 mt-6">
                  <button
                    onClick={() => navigate('/add-appointment')}
                    className="px-6 py-2 bg-gray-600 text-white rounded-md"
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <main className="admin-main-content">
        <div className="admin-header">
          <h1>Create Appointment</h1>
          <p>Book an appointment at {salon?.name}</p>
        </div>

        <div className="admin-content">
          <div className="max-w-4xl mx-auto">

            {/* ✅ ERROR MESSAGE DISPLAY */}
            {error && (
              <div className="mb-4 p-3 rounded-md bg-red-100 text-red-600 border border-red-300">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 rounded-2xl border">

              {/* Customer Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="customerName"
                    placeholder="Full Name *"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="email"
                    name="customerEmail"
                    placeholder="Email *"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="tel"
                    name="customerContact"
                    placeholder="Contact *"
                    value={formData.customerContact}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Staff */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Select Staff *</h3>
                <select
                  name="staffId"
                  value={formData.staffId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Choose Staff</option>
                  {staff.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Select Service *</h3>
                <select
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Choose Service</option>
                  {services.map(service => (
                    <option key={service._id} value={service._id}>
                      {service.name} - Rs {service.price}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Notes (optional)"
                  rows={3}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/add-appointment')}
                  className="px-6 py-2 bg-gray-500 text-white rounded-md"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Appointment"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
