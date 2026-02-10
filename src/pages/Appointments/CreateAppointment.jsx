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

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchSalonDetails = async () => {
      try {
        const detailsResponse = await api.get(`/appointments/salon/${salonId}/details`);
        console.log('Salon details response:', detailsResponse.data);
        setStaff(detailsResponse.data.staff || []);
        setServices(detailsResponse.data.services || []);

        // Also fetch salon info
        const salonResponse = await api.get('/salons/get');
        const currentSalon = salonResponse.data.find(s => s._id === salonId);
        setSalon(currentSalon);

      } catch (err) {
        setError('Failed to load salon details');
        console.error('Error loading salon details:', err);
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

    // Debug logging
    console.log('Form data:', formData);

    const missingFields = [];
    if (!formData.customerName?.trim()) missingFields.push('Customer Name');
    if (!formData.customerEmail?.trim()) missingFields.push('Customer Email');
    if (!formData.customerContact?.trim()) missingFields.push('Customer Contact');
    if (!formData.date) missingFields.push('Date');
    if (!formData.time) missingFields.push('Time');
    if (!formData.staffId) missingFields.push('Staff selection');
    if (!formData.serviceId) missingFields.push('Service selection');

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields. Missing: ${missingFields.join(', ')}`);
      return;
    }

    setSubmitting(true);

    try {
      const createResponse = await api.post('/appointments/create', {
        ...formData,
        salonId
      });

      console.log('Appointment created:', createResponse.data);
      alert('Appointment created successfully!');
      navigate('/appointments');

    } catch (err) {
      console.error('Error creating appointment:', err);
      alert('Failed to create appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="admin-layout"><div className="admin-main-content"><div>Loading salon details...</div></div></div>;
  if (error) return <div className="admin-layout"><div className="admin-main-content"><div>{error}</div></div></div>;

  // Check if salon has staff and services
  if (staff.length === 0 || services.length === 0) {
    return (
      <div className="admin-layout">
        <main className="admin-main-content">
          <div className="admin-header">
            <h1>Cannot Create Appointment</h1>
            <p>Salon setup incomplete</p>
          </div>
          <div className="admin-content">
            <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  This salon is not ready for appointments
                </h2>
                <div className="space-y-2 text-left bg-gray-50 p-4 rounded-md">
                  {staff.length === 0 && (
                    <p className="text-red-600">❌ No staff members assigned to this salon</p>
                  )}
                  {services.length === 0 && (
                    <p className="text-red-600">❌ No services available for this salon</p>
                  )}
                </div>
                <p className="text-gray-600 mt-4 mb-6">
                  Please add staff and services to this salon before creating appointments.
                </p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => navigate('/staff')}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Manage Staff
                  </button>
                  <button
                    onClick={() => navigate('/services')}
                    className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    Manage Services
                  </button>
                  <button
                    onClick={() => navigate('/add-appointment')}
                    className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Back to Salons
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
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
              {/* Customer Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="customerEmail"
                      value={formData.customerEmail}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Number *
                    </label>
                    <input
                      type="tel"
                      name="customerContact"
                      value={formData.customerContact}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Appointment Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Appointment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time *
                    </label>
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Staff Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Select Staff *</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {staff.map((member) => (
                    <div
                      key={member._id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all relative ${
                        formData.staffId === member._id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'
                      }`}
                      onClick={() => {
                        console.log('Selected staff:', member._id);
                        setFormData(prev => ({ ...prev, staffId: member._id }));
                      }}
                    >
                      {formData.staffId === member._id && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                      <h4 className="font-semibold">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.designation}</p>
                      <p className="text-sm text-gray-500">{member.specialization}</p>
                    </div>
                  ))}
                </div>
                {formData.staffId && (
                  <p className="text-sm text-green-600 mt-2">✓ Staff selected</p>
                )}
              </div>

              {/* Service Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Select Service *</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {services.map((service) => (
                    <div
                      key={service._id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all relative ${
                        formData.serviceId === service._id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-300 hover:border-gray-400 hover:shadow-sm'
                      }`}
                      onClick={() => {
                        console.log('Selected service:', service._id);
                        setFormData(prev => ({ ...prev, serviceId: service._id }));
                      }}
                    >
                      {formData.serviceId === service._id && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                      <h4 className="font-semibold">{service.name}</h4>
                      <p className="text-sm text-gray-600">{service.description}</p>
                      <p className="text-lg font-bold text-green-600">${service.price}</p>
                      <p className="text-sm text-gray-500">Duration: {service.duration}</p>
                    </div>
                  ))}
                </div>
                {formData.serviceId && (
                  <p className="text-sm text-green-600 mt-2">✓ Service selected</p>
                )}
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Any special requests or notes..."
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/add-appointment')}
                  className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
