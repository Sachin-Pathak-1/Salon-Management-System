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

  const getBadgeClasses = (status) =>
    status === 'Active'
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 px-5 py-10 transition-colors">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between
          bg-white dark:bg-slate-800
          border border-slate-200 dark:border-slate-700
          rounded-2xl p-8 mb-8 shadow-sm gap-6"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white mb-1">
              Customers
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Manage and view all your customers
            </p>
          </div>

          <button
            className="px-6 py-3 rounded-xl font-bold text-white
              bg-blue-600 hover:bg-blue-700
              transition transform hover:-translate-y-1 shadow-lg"
          >
            + Add Customer
          </button>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800
          border border-slate-200 dark:border-slate-700
          rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 dark:bg-slate-700">
                <tr>
                  {['Name', 'Email', 'Phone', 'Status', 'Services', 'Action'].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-4 text-left uppercase tracking-wide text-xs font-bold
                        text-slate-600 dark:text-slate-300 border-b
                        border-slate-200 dark:border-slate-600"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition"
                  >
                    <td className="px-5 py-4 text-slate-800 dark:text-white">
                      {customer.name}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {customer.email}
                    </td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-300">
                      {customer.phone}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-lg text-xs font-semibold uppercase ${getBadgeClasses(customer.status)}`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                      {customer.services}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => navigate(`/customer/${customer.id}`)}
                        className="px-4 py-2 rounded-md text-xs font-semibold text-white
                          bg-blue-600 hover:bg-blue-700
                          transition transform hover:-translate-y-0.5 shadow"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
