import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function CustomerList() {
  const navigate = useNavigate();
  const [customers] = useState([
    { id: 1, name: 'John Smith', email: 'john@example.com', phone: '+1-234-567-8900', status: 'Active', services: 5 },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', phone: '+1-234-567-8901', status: 'Active', services: 3 },
    { id: 3, name: 'Michael Brown', email: 'michael@example.com', phone: '+1-234-567-8902', status: 'Inactive', services: 2 },
    { id: 4, name: 'Emily Davis', email: 'emily@example.com', phone: '+1-234-567-8903', status: 'Active', services: 7 },
    { id: 5, name: 'Robert Wilson', email: 'robert@example.com', phone: '+1-234-567-8904', status: 'Active', services: 4 },
  ]);

  return (
    <div className="min-h-screen bg-[var(--background)] px-5 py-10 text-[var(--text)] transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center bg-[var(--gray-100)] p-8 rounded-xl mb-8 shadow-md border border-[var(--border-light)] md:flex-col md:gap-5 md:items-start">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--text)] mb-2">Customers</h1>
            <p className="text-[var(--text)] opacity-70 text-sm">Manage and view all your customers</p>
          </div>
          <button className="px-6 py-3 bg-[var(--primary)] text-white border-none rounded-xl font-bold cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:opacity-90">+ Add Customer</button>
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
              {customers.map(customer => (
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
