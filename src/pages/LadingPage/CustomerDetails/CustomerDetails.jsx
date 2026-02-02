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
    ],
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-6 transition-colors">
      <div className="max-w-5xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => navigate('/customers')}
          className="mb-6 inline-flex items-center gap-2 px-5 py-2 rounded-xl
            bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
            text-blue-600 font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition"
        >
          ← Back to Customers
        </button>

        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

          {/* Profile Card */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
            rounded-2xl p-10 shadow-sm text-center">

            <div className="mx-auto mb-4 w-28 h-28 rounded-full bg-blue-600
              flex items-center justify-center text-6xl text-white">
              {customerData.avatar}
            </div>

            <h1 className="text-2xl font-extrabold">{customerData.name}</h1>
            <p className="text-sm opacity-70 mb-4">
              {customerData.role} at {customerData.company}
            </p>

            <span className="inline-block mb-6 px-4 py-2 text-xs font-bold rounded-lg
              bg-slate-200 dark:bg-slate-700 uppercase">
              {customerData.status}
            </span>

            <div className="space-y-4 text-left">
              {[
                ['Email', customerData.email],
                ['Phone', customerData.phone],
                ['Member Since', customerData.joinDate],
              ].map(([label, value]) => (
                <div key={label} className="border-b border-slate-200 dark:border-slate-700 pb-3">
                  <span className="block text-xs font-bold uppercase opacity-60 mb-1">
                    {label}
                  </span>
                  <p className="font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm">
            <h2 className="text-lg font-extrabold mb-6">Account Overview</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ['Total Spent', `${(parseInt(customerData.totalSpent.replace(/\$|,/g, '')) / 1000).toFixed(1)}K`],
                ['Active Services', customerData.services],
                ['Total Orders', customerData.orders.length],
                ['Rating', '4.8'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl p-5 text-center
                    bg-gradient-to-br from-slate-100 to-slate-200
                    dark:from-slate-700 dark:to-slate-600
                    hover:-translate-y-1 transition"
                >
                  <div className="text-2xl font-extrabold text-blue-600 mb-1">
                    {value}
                  </div>
                  <div className="text-xs uppercase font-semibold opacity-70">
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm mb-8">
          <h2 className="text-lg font-extrabold mb-4">Address</h2>
          <p className="opacity-80 leading-relaxed">{customerData.address}</p>
        </div>

        {/* Orders */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm">
          <h2 className="text-lg font-extrabold mb-6">Recent Orders</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-slate-100 dark:bg-slate-700">
                <tr>
                  {['Order ID', 'Service Name', 'Date', 'Amount', 'Status'].map(h => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left uppercase font-bold text-xs"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customerData.orders.map(order => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-200 dark:border-slate-700
                      hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    <td className="px-4 py-3 font-semibold">#{order.id}</td>
                    <td className="px-4 py-3">{order.name}</td>
                    <td className="px-4 py-3">{order.date}</td>
                    <td className="px-4 py-3">{order.amount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-3 py-1 rounded-md text-xs font-bold
                          ${
                            order.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
                          }`}
                      >
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
