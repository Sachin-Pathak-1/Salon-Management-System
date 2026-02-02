import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

export function ActivityPage({ isLoggedIn }) {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) navigate('/login');
  }, [isLoggedIn, navigate]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const activities = [
    { id: 1, icon: '✅', title: 'Service Completed', description: 'Completed "Email Marketing Setup"', time: '2 hours ago', category: 'completed' },
    { id: 2, icon: '📝', title: 'Created New Service', description: 'Added "Social Media Management"', time: '4 hours ago', category: 'created' },
    { id: 3, icon: '💬', title: 'New Message', description: 'Received message from John Doe', time: '1 day ago', category: 'message' },
    { id: 4, icon: '🎯', title: 'Goal Achieved', description: 'Reached 100 completed services', time: '2 days ago', category: 'milestone' },
  ];

  const categoryColors = {
    completed: 'bg-emerald-500 text-emerald-500 border-emerald-500',
    created: 'bg-blue-500 text-blue-500 border-blue-500',
    message: 'bg-amber-500 text-amber-500 border-amber-500',
    milestone: 'bg-pink-500 text-pink-500 border-pink-500',
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-10 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
              My Activity
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              View all your recent activities and events
            </p>
          </div>

          <div className="flex gap-3 flex-wrap">
            {['All', 'Completed', 'Messages', 'Bookings'].map((item, i) => (
              <button
                key={i}
                className={`px-5 py-2 rounded-lg font-bold text-sm border transition
                  ${i === 0
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-600 hover:text-indigo-600'
                  }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        {/* Activity List */}
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex flex-wrap md:flex-nowrap items-center gap-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow border border-gray-200 dark:border-gray-700 hover:-translate-y-1 transition"
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl text-white shadow ${categoryColors[activity.category].split(' ')[0]}`}
              >
                {activity.icon}
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {activity.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {activity.description}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-lg border capitalize
                    ${categoryColors[activity.category].replace('bg-', 'border-').replace('text-', 'text-')}`}
                >
                  {activity.category}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: '📊', title: 'This Month', value: '34', label: 'activities' },
            { icon: '⭐', title: 'Rating', value: '4.9/5', label: 'average rating' },
            { icon: '✅', title: 'Completed', value: '98%', label: 'success rate' },
            { icon: '👥', title: 'Clients', value: '156', label: 'total clients' },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 p-7 rounded-2xl shadow border border-gray-200 dark:border-gray-700 text-center hover:-translate-y-1 transition"
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <h3 className="text-sm font-bold uppercase text-gray-700 dark:text-gray-300">
                {stat.title}
              </h3>
              <p className="text-3xl font-extrabold text-indigo-600 my-1">
                {stat.value}
              </p>
              <small className="text-gray-500 dark:text-gray-400">
                {stat.label}
              </small>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
