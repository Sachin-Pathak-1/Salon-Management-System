import { useNavigate } from 'react-router-dom';

export function CustomerDetails() {
  const navigate = useNavigate();

  const customerData = {
    id: 1,
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1-234-567-8900',
    status: 'Active',
    joinDate: 'January 15, 2023',
    avatar: '👤',
    address: '123 Business Street, Suite 100, New York, NY 10001',
    company: 'Tech Solutions Inc',
    role: 'Manager',
    totalSpent: '$12,500',
    services: 5,
    orders: [
      { id: 101, name: 'Web Design Service', date: '2025-01-25', amount: '$2,500', status: 'Completed' },
      { id: 102, name: 'Digital Marketing', date: '2025-01-20', amount: '$3,000', status: 'In Progress' },
      { id: 103, name: 'SEO Optimization', date: '2025-01-10', amount: '$1,500', status: 'Completed' },
      { id: 104, name: 'Content Writing', date: '2024-12-28', amount: '$2,000', status: 'Completed' },
    ]
  };

  return (
    <div className="min-h-screen bg-[var(--background)] px-5 py-10 text-[var(--text)] transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Back Button */}
        <button
          onClick={() => navigate('/customers')}
          className="inline-block mb-6 px-5 py-2 bg-gray-100 border-2 border-[var(--border-light)] rounded-lg text-[var(--primary)] font-bold hover:bg-gray-200 hover:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition"
        >
          ← Back to Customers
        </button>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* Profile Section */}
          <div className="bg-gray-100 border border-[var(--border-light)] rounded-2xl p-10 shadow text-center space-y-6">
            <div className="text-6xl w-28 h-28 flex items-center justify-center bg-[var(--primary)] text-white rounded-full mx-auto">
              {customerData.avatar}
            </div>
            <h1 className="text-2xl font-extrabold text-[var(--text)]">{customerData.name}</h1>
            <p className="text-sm text-[var(--text)]">{customerData.role} at {customerData.company}</p>
            <div className="inline-block px-4 py-2 bg-gray-200 text-[var(--text)] rounded-md font-bold text-xs uppercase">
              {customerData.status}
            </div>
            <div className="flex flex-col gap-4 mt-4 text-left">
              <div className="border-b border-gray-200 pb-2">
                <span className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Email</span>
                <p className="text-gray-900 font-semibold">{customerData.email}</p>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <span className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Phone</span>
                <p className="text-gray-900 font-semibold">{customerData.phone}</p>
              </div>
              <div className="border-b border-gray-200 pb-2">
                <span className="block text-xs font-bold text-gray-600 uppercase tracking-wide">Member Since</span>
                <p className="text-gray-900 font-semibold">{customerData.joinDate}</p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-2xl p-8 shadow">
            <h2 className="text-lg font-extrabold text-gray-900 mb-6">Account Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-5 rounded-xl text-center hover:from-blue-100 hover:to-blue-200 transition">
                <div className="text-2xl font-extrabold text-[var(--primary)] mb-1">
                  ${(parseInt(customerData.totalSpent.replace(/\$|,/g, '')) / 1000).toFixed(1)}K
                </div>
                <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Total Spent</div>
              </div>
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-5 rounded-xl text-center hover:from-blue-100 hover:to-blue-200 transition">
                <div className="text-2xl font-extrabold text-[var(--primary)] mb-1">{customerData.services}</div>
                <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Active Services</div>
              </div>
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-5 rounded-xl text-center hover:from-blue-100 hover:to-blue-200 transition">
                <div className="text-2xl font-extrabold text-[var(--primary)] mb-1">{customerData.orders.length}</div>
                <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Total Orders</div>
              </div>
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-5 rounded-xl text-center hover:from-blue-100 hover:to-blue-200 transition">
                <div className="text-2xl font-extrabold text-[var(--primary)] mb-1">4.8</div>
                <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="bg-white rounded-2xl p-8 shadow mb-8">
          <h2 className="text-lg font-extrabold text-gray-900 mb-4">Address</h2>
          <p className="text-gray-700 leading-relaxed">{customerData.address}</p>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-2xl p-8 shadow">
          <h2 className="text-lg font-extrabold text-gray-900 mb-6">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gradient-to-br from-gray-100 to-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wide border-b-2 border-gray-200">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wide border-b-2 border-gray-200">Service Name</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wide border-b-2 border-gray-200">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wide border-b-2 border-gray-200">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wide border-b-2 border-gray-200">Status</th>
                </tr>
              </thead>
              <tbody>
                {customerData.orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 border-b border-gray-200 text-gray-700">#{order.id}</td>
                    <td className="px-4 py-3 border-b border-gray-200 text-gray-700">{order.name}</td>
                    <td className="px-4 py-3 border-b border-gray-200 text-gray-700">{order.date}</td>
                    <td className="px-4 py-3 border-b border-gray-200 text-gray-700">{order.amount}</td>
                    <td className="px-4 py-3 border-b border-gray-200">
                      <span className={`px-3 py-1 rounded-md text-xs font-semibold ${
                        order.status === 'Completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
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