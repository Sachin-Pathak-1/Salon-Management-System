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

  const statusStyles = {
    completed: 'bg-emerald-500 border-emerald-500 text-emerald-500',
    'in-progress': 'bg-amber-500 border-amber-500 text-amber-500',
    cancelled: 'bg-red-500 border-red-500 text-red-500',
    info: 'bg-blue-500 border-blue-500 text-blue-500',
  };

  const statusIcon = {
    completed: '✅',
    'in-progress': '⏳',
    cancelled: '❌',
    info: 'ℹ️',
  };

  const groupedHistory = {};
  history.forEach(item => {
    const month = new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    groupedHistory[month] = groupedHistory[month] || [];
    groupedHistory[month].push(item);
  });

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 px-5 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 mb-8 flex flex-col md:flex-row gap-6 justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              History
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              View your complete transaction and activity history
            </p>
          </div>

          <div className="flex gap-3">
            {['📥 Export', '🔍 Search'].map((btn, i) => (
              <button
                key={i}
                className="px-5 py-2 rounded-lg font-bold text-sm border
                  border-slate-200 dark:border-slate-700
                  bg-slate-100 dark:bg-slate-800
                  hover:border-blue-500 hover:text-blue-500 transition"
              >
                {btn}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-10">
          {Object.entries(groupedHistory).map(([month, items]) => (
            <div key={month} className="flex flex-col md:flex-row gap-8">
              <div className="min-w-[150px] font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                {month}
              </div>

              <div className="flex-1 border-l-2 border-slate-200 dark:border-slate-700 pl-6 space-y-5">
                {items.map(item => (
                  <div key={item.id} className="relative">

                    {/* Marker */}
                    <div
                      className={`absolute -left-[38px] w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ${statusStyles[item.status]}`}
                    >
                      {statusIcon[item.status]}
                    </div>

                    {/* Card */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow hover:-translate-y-1 transition grid md:grid-cols-[1fr_auto] gap-4">
                      <div>
                        <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
                          {new Date(item.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <h3 className="font-bold text-slate-900 dark:text-white mt-1">
                          {item.action}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {item.details}
                        </p>
                      </div>

                      <div className="flex items-center">
                        <span
                          className={`px-3 py-1 text-xs font-bold rounded-lg border capitalize
                            ${statusStyles[item.status]} bg-transparent`}
                        >
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

        {/* Summary */}
        <div className="mt-16">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
            Summary Statistics
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              ['✅', 'Completed', '7', 'services'],
              ['⏳', 'In Progress', '2', 'active services'],
              ['❌', 'Cancelled', '1', 'services'],
              ['💰', 'Total Earned', '$650', 'from completed'],
            ].map(([icon, title, value, label], i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800
                  rounded-2xl p-7 text-center shadow hover:-translate-y-1 transition"
              >
                <div className="text-4xl mb-2">{icon}</div>
                <h4 className="text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
                  {title}
                </h4>
                <p className="text-3xl font-extrabold text-blue-500">
                  {value}
                </p>
                <small className="text-slate-500 dark:text-slate-400">
                  {label}
                </small>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
