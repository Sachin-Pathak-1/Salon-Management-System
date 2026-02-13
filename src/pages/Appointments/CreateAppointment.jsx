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
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--primary)' }}></div>
              <p className="opacity-70" style={{ color: 'var(--text)' }}>Loading salon details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && !salon) {
    return (
      <div className="admin-layout">
        <div className="admin-main-content">
          <div className="max-w-md mx-auto mt-20">
            <div className="border rounded-2xl p-8 text-center shadow-[var(--card-shadow)]" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--danger-light)' }}>
                <svg className="w-8 h-8" style={{ color: 'var(--danger)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text)' }}>Failed to Load Salon Details</h2>
              <p className="mb-6 opacity-70" style={{ color: 'var(--text)' }}>{error}</p>
              <button
                onClick={() => navigate('/add-appointment')}
                className="px-6 py-2 rounded-md transition-colors duration-300"
                style={{ backgroundColor: 'var(--primary)', color: 'white' }}
              >
                Back to Salons
              </button>
            </div>
          </div>
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
            <div className="max-w-2xl mx-auto p-6 rounded-2xl border shadow-[var(--card-shadow)]" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-light)' }}>
                  <svg className="w-8 h-8" style={{ color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text)' }}>
                  This salon is not ready for appointments
                </h2>
                <div className="space-y-2 text-left max-w-sm mx-auto mb-6">
                  {staff.length === 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--danger-light)' }}>
                      <svg className="w-5 h-5" style={{ color: 'var(--danger)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <p style={{ color: 'var(--danger)' }}>No staff members assigned</p>
                    </div>
                  )}
                  {services.length === 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: 'var(--danger-light)' }}>
                      <svg className="w-5 h-5" style={{ color: 'var(--danger)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <p style={{ color: 'var(--danger)' }}>No services available</p>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => navigate('/add-appointment')}
                  className="px-6 py-2 rounded-md transition-colors duration-300"
                  style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                >
                  Back to Salons
                </button>
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/add-appointment')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="w-5 h-5" style={{ color: 'var(--text)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1>Create Appointment</h1>
              <p>Book an appointment at {salon?.name}</p>
            </div>
          </div>
        </div>

        <div className="admin-content">
          <div className="max-w-4xl mx-auto">
            {/* Salon Info Card */}
            {salon && (
              <div className="mb-6 border rounded-2xl p-5 shadow-[var(--card-shadow)] transition-shadow duration-300" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>
                <div className="flex items-center gap-4">
                  {salon.logo && (
                    <img
                      src={salon.logo}
                      alt={`${salon.name} logo`}
                      className="w-16 h-16 object-cover rounded-xl"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                        {salon.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${salon.status === "open"
                            ? "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30"
                            : salon.status === "closed"
                              ? "bg-[var(--danger)]/15 text-[var(--danger)] border-[var(--danger)]/30"
                              : "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/30"
                          }`}
                      >
                        {salon.status}
                      </span>
                    </div>
                    <div className="text-sm opacity-80 space-y-1" style={{ color: 'var(--text)' }}>
                      <p><span className="font-semibold">Address:</span> {salon.address}</p>
                      <p><span className="font-semibold">Hours:</span> {salon.openingTime || "N/A"} - {salon.closingTime || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message Display */}
            {error && (
              <div className="mb-4 p-4 rounded-xl border flex items-center gap-3" style={{ backgroundColor: 'var(--danger-light)', borderColor: 'var(--danger)/30' }}>
                <svg className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--danger)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p style={{ color: 'var(--danger)' }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="border rounded-2xl p-6 shadow-[var(--card-shadow)]" style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}>

              {/* Customer Info */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Customer Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="customerName"
                      placeholder="Full Name *"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: 'var(--gray-100)', 
                        borderColor: 'var(--border-light)',
                        color: 'var(--text)'
                      }}
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="email"
                      name="customerEmail"
                      placeholder="Email *"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: 'var(--gray-100)', 
                        borderColor: 'var(--border-light)',
                        color: 'var(--text)'
                      }}
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      name="customerContact"
                      placeholder="Contact *"
                      value={formData.customerContact}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: 'var(--gray-100)', 
                        borderColor: 'var(--border-light)',
                        color: 'var(--text)'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Appointment Time</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: 'var(--gray-100)', 
                        borderColor: 'var(--border-light)',
                        color: 'var(--text)'
                      }}
                    />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text)' }}>Time *</label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                      style={{ 
                        backgroundColor: 'var(--gray-100)', 
                        borderColor: 'var(--border-light)',
                        color: 'var(--text)'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Staff */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--success)' }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Select Staff *</h3>
                </div>
                <select
                  name="staffId"
                  value={formData.staffId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: 'var(--gray-100)', 
                    borderColor: 'var(--border-light)',
                    color: 'var(--text)'
                  }}
                >
                  <option value="">Choose Staff</option>
                  {staff.map(member => (
                    <option key={member._id} value={member._id}>
                      {member.name} {member.designation ? `(${member.designation})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Service */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Select Service *</h3>
                </div>
                <select
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{ 
                    backgroundColor: 'var(--gray-100)', 
                    borderColor: 'var(--border-light)',
                    color: 'var(--text)'
                  }}
                >
                  <option value="">Choose Service</option>
                  {services.map(service => (
                    <option key={service._id} value={service._id}>
                      {service.name} - Rs {service.price} {service.duration ? `(${service.duration})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--text-light)' }}>
                    <svg className="w-4 h-4" style={{ color: 'var(--text)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Notes (Optional)</h3>
                </div>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Add any special requests or notes..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border transition-all duration-300 focus:outline-none focus:ring-2 resize-none"
                  style={{ 
                    backgroundColor: 'var(--gray-100)', 
                    borderColor: 'var(--border-light)',
                    color: 'var(--text)'
                  }}
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-light)' }}>
                <button
                  type="button"
                  onClick={() => navigate('/add-appointment')}
                  className="px-6 py-3 rounded-xl border transition-colors duration-300 hover:bg-gray-50"
                  style={{ borderColor: 'var(--border-light)', color: 'var(--text)' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 rounded-xl transition-colors duration-300 disabled:opacity-50 flex items-center gap-2"
                  style={{ backgroundColor: 'var(--primary)', color: 'white' }}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Create Appointment
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
