import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export function CustomerList() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomersFromAppointments = async () => {
      try {
        setLoading(true);
        setError('');

        const activeSalon = localStorage.getItem('activeSalon');
        const response = await api.get('/appointments', {
          params: activeSalon ? { salonId: activeSalon } : {}
        });

        setAppointments(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Error loading customers:', err);
        setError('Failed to load customers from appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomersFromAppointments();
  }, []);

  const customers = useMemo(() => {
    const grouped = new Map();

    appointments.forEach((appointment) => {
      const key = appointment.customerEmail || `${appointment.customerName}-${appointment.customerContact}`;
      const existing = grouped.get(key);
      const serviceName = appointment.serviceId?.name;
      const isCancelled = appointment.status === 'cancelled';

      if (!existing) {
        grouped.set(key, {
          id: key,
          name: appointment.customerName || 'N/A',
          email: appointment.customerEmail || 'N/A',
          phone: appointment.customerContact || 'N/A',
          status: isCancelled ? 'Inactive' : 'Active',
          servicesSet: serviceName ? new Set([serviceName]) : new Set()
        });
        return;
      }

      if (serviceName) existing.servicesSet.add(serviceName);
      if (!isCancelled) existing.status = 'Active';
    });

    return Array.from(grouped.values()).map((customer) => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      services: customer.servicesSet.size
    }));
  }, [appointments]);

  return (
    <div className="min-h-screen bg-[var(--background)] px-5 py-10 text-[var(--text)] transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center bg-[var(--gray-100)] p-8 rounded-xl mb-8 shadow-md border border-[var(--border-light)] md:flex-col md:gap-5 md:items-start">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--text)] mb-2">Customers</h1>
            <p className="text-[var(--text)] opacity-70 text-sm">Manage and view all your customers</p>
          </div>
          <button
            disabled
            className="px-6 py-3 bg-[var(--gray-300)] text-[var(--text)] border-none rounded-xl font-bold cursor-not-allowed opacity-70"
          >
            Synced from Appointments
          </button>
        </div>

        <div className="bg-[var(--gray-100)] rounded-xl overflow-hidden shadow-md">
          <table className="w-full border-collapse">
            <thead className="bg-[var(--gray-200)]">
              <tr>
                <th className="px-5 py-4 text-left font-bold text-[var(--text)] opacity-80 text-xs uppercase tracking-wider border-b-2 border-[var(--border-light)] md:px-2 md:py-3">Name</th>
                <th className="px-5 py-4 text-left font-bold text-[var(--text)] opacity-80 text-xs uppercase tracking-wider border-b-2 border-[var(--border-light)] md:px-2 md:py-3">Email</th>
                <th className="px-5 py-4 text-left font-bold text-[var(--text)] opacity-80 text-xs uppercase tracking-wider border-b-2 border-[var(--border-light)] md:px-2 md:py-3">Phone</th>
                <th className="px-5 py-4 text-left font-bold text-[var(--text)] opacity-80 text-xs uppercase tracking-wider border-b-2 border-[var(--border-light)] md:px-2 md:py-3">Status</th>
                <th className="px-5 py-4 text-left font-bold text-[var(--text)] opacity-80 text-xs uppercase tracking-wider border-b-2 border-[var(--border-light)] md:px-2 md:py-3">Services</th>
                <th className="px-5 py-4 text-left font-bold text-[var(--text)] opacity-80 text-xs uppercase tracking-wider border-b-2 border-[var(--border-light)] md:px-2 md:py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan="6" className="px-5 py-6 text-sm text-center opacity-80">Loading customers...</td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan="6" className="px-5 py-6 text-sm text-center text-red-500">{error}</td>
                </tr>
              )}

              {!loading && !error && customers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-5 py-6 text-sm text-center opacity-80">
                    No customer data found in appointments.
                  </td>
                </tr>
              )}

              {!loading && !error && customers.map(customer => (
                <tr key={customer.id} className="transition-all duration-300 hover:bg-[var(--hover-bg)]">
                  <td className="px-5 py-4 border-b border-[var(--border-light)] text-[var(--text)] opacity-85 text-sm md:px-2 md:py-3">{customer.name}</td>
                  <td className="px-5 py-4 border-b border-[var(--border-light)] text-[var(--text)] opacity-85 text-sm md:px-2 md:py-3">{customer.email}</td>
                  <td className="px-5 py-4 border-b border-[var(--border-light)] text-[var(--text)] opacity-85 text-sm md:px-2 md:py-3">{customer.phone}</td>
                  <td className="px-5 py-4 border-b border-[var(--border-light)] text-[var(--text)] opacity-85 text-sm md:px-2 md:py-3">
                    <span className={`px-3 py-1.5 rounded-lg font-semibold text-xs uppercase tracking-wider ${customer.status.toLowerCase() === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 border-b border-[var(--border-light)] text-[var(--text)] opacity-85 text-sm md:px-2 md:py-3">{customer.services}</td>
                  <td className="px-5 py-4 border-b border-[var(--border-light)] text-[var(--text)] opacity-85 text-sm md:px-2 md:py-3">
                    <button className="px-3 py-1.5 bg-[var(--primary)] text-white border-none rounded-md font-semibold text-xs cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md" onClick={() => navigate(`/customer/${customer.id}`)}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
