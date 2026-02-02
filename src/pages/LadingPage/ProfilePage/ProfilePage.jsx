import { useNavigate } from 'react-router-dom';

export function ProfilePage({ currentUser, isLoggedIn }) {
  const navigate = useNavigate();

  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 pb-16">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg mx-5 mt-5 mb-10 overflow-hidden">
          <div className="h-52 bg-gradient-to-br from-blue-500 to-blue-600"></div>

          <div className="flex flex-col md:flex-row gap-8 px-10 pb-10 -mt-20">
            <div className="w-36 h-36 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-6xl text-white shadow-xl">
              {currentUser?.avatar || '👤'}
            </div>

            <div className="flex-1 pt-8">
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {currentUser?.name}
              </h1>
              <p className="text-slate-500 dark:text-slate-400">{currentUser?.email}</p>
              <p className="uppercase text-sm font-bold text-blue-500 mt-1">
                {currentUser?.role || 'Standard User'}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Joined {currentUser?.joinDate}
              </p>
            </div>

            <button className="self-center px-7 py-3 rounded-lg font-bold text-white bg-gradient-to-br from-blue-500 to-blue-600 shadow-md hover:-translate-y-1 transition">
              Edit Profile
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8 px-5">

          {/* Sidebar
          <aside className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow sticky top-24">
            <nav className="flex lg:flex-col gap-2 flex-wrap">
              {['Overview','Settings','Privacy','Notifications','Security'].map((item, i) => (
                <a
                  key={i}
                  href="#"
                  className={`px-4 py-3 rounded-lg font-semibold text-sm transition
                    ${i === 0
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                >
                  {item}
                </a>
              ))}
            </nav>
          </aside> */}

          {/* Main */}
          <main className="space-y-8">

            {/* Overview */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6">
                Account Overview
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                {[
                  ['📊', 'Total Activities', '1,234'],
                  ['⚡', 'Active Services', '12'],
                  ['✅', 'Completed Tasks', '890'],
                  ['🎯', 'Success Rate', '98%'],
                ].map(([icon, title, value], i) => (
                  <div
                    key={i}
                    className="text-center border rounded-xl p-6 hover:-translate-y-1 transition
                      border-slate-200 dark:border-slate-800"
                  >
                    <div className="text-3xl mb-2">{icon}</div>
                    <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {title}
                    </h3>
                    <p className="text-2xl font-extrabold text-blue-500">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Personal Info */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6">
                Personal Information
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                {[
                  ['Full Name', currentUser?.name],
                  ['Email Address', currentUser?.email],
                  ['Account Type', currentUser?.role],
                  ['Member Since', currentUser?.joinDate],
                  ['Phone Number', '+1 (555) 123-4567'],
                  ['Location', 'San Francisco, CA'],
                ].map(([label, value], i) => (
                  <div key={i} className="border-b pb-4 border-slate-200 dark:border-slate-800">
                    <p className="text-xs uppercase font-bold text-slate-500 dark:text-slate-400">
                      {label}
                    </p>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Activity */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-6">
                Recent Activity
              </h2>

              <div className="space-y-4">
                {[
                  ['✅', 'Service Completed', '2 hours ago'],
                  ['📝', 'Created New Service', '1 day ago'],
                  ['🔄', 'Updated Profile', '3 days ago'],
                ].map(([icon, title, time], i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-xl
                      bg-slate-100 dark:bg-slate-800 hover:translate-x-1 transition"
                  >
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}
