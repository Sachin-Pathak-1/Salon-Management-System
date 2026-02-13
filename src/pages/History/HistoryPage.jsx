import { useNavigate } from 'react-router-dom';

export function HistoryPage({ isLoggedIn }) {
  const navigate = useNavigate();

  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  const history = [
    { id: 1, date: '2025-01-29', action: 'Service Completed', details: 'Email Marketing Setup - $150', status: 'completed' },
    { id: 2, date: '2025-01-28', action: 'Service Started', details: 'Website Design Project', status: 'in-progress' },
    { id: 3, date: '2025-01-26', action: 'Payment Received', details: 'Payment of $500 from Client XYZ', status: 'completed' },
    { id: 4, date: '2025-01-25', action: 'Service Cancelled', details: 'Social Media Campaign - Client Request', status: 'cancelled' },
    { id: 5, date: '2025-01-24', action: 'Service Completed', details: 'Content Writing - 50 Articles', status: 'completed' },
    { id: 6, date: '2025-01-22', action: 'Review Received', details: '5-star review from John Smith', status: 'completed' },
    { id: 7, date: '2025-01-20', action: 'Service Updated', details: 'Updated pricing for "Logo Design"', status: 'info' },
    { id: 8, date: '2025-01-18', action: 'New Booking', details: 'Booking for "Brand Strategy" service', status: 'in-progress' },
    { id: 9, date: '2025-01-15', action: 'Profile Updated', details: 'Updated profile information', status: 'info' },
    { id: 10, date: '2025-01-12', action: 'Service Completed', details: 'SEO Optimization - Website', status: 'completed' },
    { id: 11, date: '2025-01-10', action: 'Service Completed', details: 'Video Marketing - 5 Videos', status: 'completed' },
    { id: 12, date: '2025-01-08', action: 'New Service Added', details: 'Added "Mobile App Development"', status: 'info' },
  ];

  const getStatusIcon = (status) => {
    const icons = {
      completed: '✅',
      'in-progress': '⏳',
      cancelled: '❌',
      info: 'ℹ️'
    };
    return icons[status] || '•';
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-500',
      'in-progress': 'bg-yellow-500',
      cancelled: 'bg-red-500',
      info: 'bg-blue-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusTextColor = (status) => {
    const colors = {
      completed: 'text-green-600 border-green-600',
      'in-progress': 'text-yellow-600 border-yellow-600',
      cancelled: 'text-red-600 border-red-600',
      info: 'text-blue-600 border-blue-600'
    };
    return colors[status] || 'text-gray-600 border-gray-600';
  };

  // Group history by month
  const groupedHistory = {};
  history.forEach(item => {
    const month = new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    if (!groupedHistory[month]) {
      groupedHistory[month] = [];
    }
    groupedHistory[month].push(item);
  });

  return (
    <div className="min-h-screen bg-[var(--background)] px-5 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center bg-[var(--gray-100)] p-8 rounded-xl mb-8 shadow-md border border-[var(--border-light)] flex-wrap gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-[var(--text)] mb-2">History</h1>
            <p className="text-[var(--gray-700)] text-sm font-medium">View your complete transaction and activity history</p>
          </div>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 border-2 border-[var(--border-light)] bg-[var(--gray-100)] rounded-xl font-bold text-sm cursor-pointer transition-all duration-300 hover:border-[var(--primary)] hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 hover:text-[var(--primary)]">📥 Export</button>
            <button className="px-5 py-2.5 border-2 border-[var(--border-light)] bg-[var(--gray-100)] rounded-xl font-bold text-sm cursor-pointer transition-all duration-300 hover:border-[var(--primary)] hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100 hover:text-[var(--primary)]">🔍 Search</button>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex flex-col gap-10">
          {Object.entries(groupedHistory).map(([month, items]) => (
            <div key={month} className="flex gap-8 md:flex-col md:gap-4">
              <div className="text-base font-extrabold text-[var(--text)] uppercase tracking-wider min-w-[150px] pt-3">{month}</div>
              <div className="flex-1 flex flex-col gap-4 border-l-4 border-[var(--border-light)] pl-6">
                {items.map((item) => (
                  <div key={item.id} className="relative flex gap-5 items-start">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl text-white absolute -left-9 shadow-lg ${getStatusColor(item.status)}`}>
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="bg-[var(--gray-100)] rounded-lg p-5 flex-1 shadow-md border border-[var(--border-light)] transition-all duration-300 hover:shadow-lg hover:-translate-y-1 grid grid-cols-[1fr_auto] gap-5 items-start">
                      <div className="text-xs font-bold text-[var(--gray-700)] uppercase tracking-wider">{new Date(item.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                      <div className="grid-column-1">
                        <h3 className="text-base font-bold text-[var(--text)] mb-1.5">{item.action}</h3>
                        <p className="text-[var(--gray-700)] text-sm leading-relaxed">{item.details}</p>
                      </div>
                      <div className="grid-column-2 grid-row-1-3 flex items-center">
                        <span className={`px-3 py-1.5 border-2 rounded-lg text-xs font-bold capitalize bg-transparent whitespace-nowrap ${getStatusTextColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-15">
          <h2 className="text-2xl font-extrabold text-[var(--text)] mb-6">Summary Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[var(--gray-100)] rounded-xl p-7 text-center shadow-md transition-all duration-300 hover:-translate-y-1.25 hover:shadow-lg border border-[var(--border-light)] text-[var(--text)]">
              <div className="text-4xl mb-3">✅</div>
              <h4 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider mb-2">Completed</h4>
              <p className="text-4xl font-extrabold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark,var(--primary))] bg-clip-text text-transparent mb-1">7</p>
              <small className="text-[var(--gray-600)] text-xs font-medium">services</small>
            </div>
            <div className="bg-[var(--gray-100)] rounded-xl p-7 text-center shadow-md transition-all duration-300 hover:-translate-y-1.25 hover:shadow-lg border border-[var(--border-light)] text-[var(--text)]">
              <div className="text-4xl mb-3">⏳</div>
              <h4 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider mb-2">In Progress</h4>
              <p className="text-4xl font-extrabold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark,var(--primary))] bg-clip-text text-transparent mb-1">2</p>
              <small className="text-[var(--gray-600)] text-xs font-medium">active services</small>
            </div>
            <div className="bg-[var(--gray-100)] rounded-xl p-7 text-center shadow-md transition-all duration-300 hover:-translate-y-1.25 hover:shadow-lg border border-[var(--border-light)] text-[var(--text)]">
              <div className="text-4xl mb-3">❌</div>
              <h4 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider mb-2">Cancelled</h4>
              <p className="text-4xl font-extrabold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark,var(--primary))] bg-clip-text text-transparent mb-1">1</p>
              <small className="text-[var(--gray-600)] text-xs font-medium">services</small>
            </div>
            <div className="bg-[var(--gray-100)] rounded-xl p-7 text-center shadow-md transition-all duration-300 hover:-translate-y-1.25 hover:shadow-lg border border-[var(--border-light)] text-[var(--text)]">
              <div className="text-4xl mb-3">💰</div>
              <h4 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider mb-2">Total Earned</h4>
              <p className="text-4xl font-extrabold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark,var(--primary))] bg-clip-text text-transparent mb-1">$650</p>
              <small className="text-[var(--gray-600)] text-xs font-medium">from completed</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
