import { useNavigate } from 'react-router-dom';

export function ProfilePage({ currentUser, isLoggedIn }) {
  const navigate = useNavigate();

  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] pb-15">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-[var(--gray-100)] rounded-xl overflow-hidden shadow-2xl mb-10 mx-5 mt-5">
          <div className="h-50 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark,var(--primary))] relative"></div>
          <div className="flex items-start gap-8 px-10 pb-10 relative">
            <div className="w-35 h-35 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark,var(--primary))] flex items-center justify-center text-6xl text-white shadow-2xl -mt-17.5">
              {currentUser?.avatar || '👤'}
            </div>
            <div className="flex-1 pt-7.5">
              <h1 className="text-4xl font-extrabold text-[var(--text)] mb-2">{currentUser?.name}</h1>
              <p className="text-[var(--gray-700)] text-base mb-1 font-medium">{currentUser?.email}</p>
              <p className="text-[var(--primary)] font-bold text-sm uppercase tracking-wider mb-1">{currentUser?.role || 'Standard User'}</p>
              <p className="text-[var(--gray-700)] text-xs font-medium">Joined {currentUser?.joinDate}</p>
            </div>
            <button className="px-7 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark,var(--primary))] text-white border-none rounded-xl font-bold text-sm cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl self-center">Edit Profile</button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="grid grid-cols-[250px_1fr] gap-8 px-5 max-w-6xl mx-auto">
          {/* Left Sidebar */}
          <aside className="bg-[var(--gray-100)] rounded-xl p-6 shadow-md h-fit sticky top-25">
            <nav className="flex flex-col gap-2">
              <a href="#overview" className="px-4 py-3 text-[var(--gray-700)] no-underline rounded-lg transition-all duration-300 hover:bg-[var(--hover-bg)] hover:text-[var(--primary)] font-semibold text-sm active:bg-gradient-to-r active:from-[var(--primary)] active:to-[var(--primary-dark,var(--primary))] active:text-white">Overview</a>
              <a href="#settings" className="px-4 py-3 text-[var(--gray-700)] no-underline rounded-lg transition-all duration-300 hover:bg-[var(--hover-bg)] hover:text-[var(--primary)] font-semibold text-sm">Settings</a>
              <a href="#privacy" className="px-4 py-3 text-[var(--gray-700)] no-underline rounded-lg transition-all duration-300 hover:bg-[var(--hover-bg)] hover:text-[var(--primary)] font-semibold text-sm">Privacy</a>
              <a href="#notifications" className="px-4 py-3 text-[var(--gray-700)] no-underline rounded-lg transition-all duration-300 hover:bg-[var(--hover-bg)] hover:text-[var(--primary)] font-semibold text-sm">Notifications</a>
              <a href="#security" className="px-4 py-3 text-[var(--gray-700)] no-underline rounded-lg transition-all duration-300 hover:bg-[var(--hover-bg)] hover:text-[var(--primary)] font-semibold text-sm">Security</a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex flex-col gap-8">
            {/* Overview Section */}
            <section className="bg-[var(--gray-100)] rounded-xl p-8 shadow-md">
              <h2 className="text-2xl font-extrabold text-[var(--text)] mb-6">Account Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-[var(--gray-100)] p-6 rounded-lg text-center transition-all duration-300 hover:-translate-y-1.25 hover:shadow-lg border border-[var(--border-light)]">
                  <div className="text-4xl mb-3">📊</div>
                  <h3 className="text-sm font-bold text-[var(--gray-700)] uppercase tracking-wider mb-2">Total Activities</h3>
                  <p className="text-4xl font-extrabold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark,var(--primary))] bg-clip-text text-transparent mb-1">1,234</p>
                </div>
                <div className="bg-[var(--gray-100)] p-6 rounded-lg text-center transition-all duration-300 hover:-translate-y-1.25 hover:shadow-lg border border-[var(--border-light)]">
                  <div className="text-4xl mb-3">⚡</div>
                  <h3 className="text-sm font-bold text-[var(--gray-700)] uppercase tracking-wider mb-2">Active Services</h3>
                  <p className="text-4xl font-extrabold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark,var(--primary))] bg-clip-text text-transparent mb-1">12</p>
                </div>
                <div className="bg-[var(--gray-100)] p-6 rounded-lg text-center transition-all duration-300 hover:-translate-y-1.25 hover:shadow-lg border border-[var(--border-light)]">
                  <div className="text-4xl mb-3">✅</div>
                  <h3 className="text-sm font-bold text-[var(--gray-700)] uppercase tracking-wider mb-2">Completed Tasks</h3>
                  <p className="text-4xl font-extrabold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark,var(--primary))] bg-clip-text text-transparent mb-1">890</p>
                </div>
                <div className="bg-[var(--gray-100)] p-6 rounded-lg text-center transition-all duration-300 hover:-translate-y-1.25 hover:shadow-lg border border-[var(--border-light)]">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="text-sm font-bold text-[var(--gray-700)] uppercase tracking-wider mb-2">Success Rate</h3>
                  <p className="text-4xl font-extrabold bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark,var(--primary))] bg-clip-text text-transparent mb-1">98%</p>
                </div>
              </div>
            </section>

            {/* Personal Information */}
            <section className="bg-[var(--gray-100)] rounded-xl p-8 shadow-md">
              <h2 className="text-2xl font-extrabold text-[var(--text)] mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex flex-col gap-2 pb-4 border-b-2 border-[var(--border-light)]">
                  <label className="text-xs font-bold text-[var(--gray-700)] uppercase tracking-wider">Full Name</label>
                  <p className="text-base font-semibold text-[var(--text)]">{currentUser?.name}</p>
                </div>
                <div className="flex flex-col gap-2 pb-4 border-b-2 border-[var(--border-light)]">
                  <label className="text-xs font-bold text-[var(--gray-700)] uppercase tracking-wider">Email Address</label>
                  <p className="text-base font-semibold text-[var(--text)]">{currentUser?.email}</p>
                </div>
                <div className="flex flex-col gap-2 pb-4 border-b-2 border-[var(--border-light)]">
                  <label className="text-xs font-bold text-[var(--gray-700)] uppercase tracking-wider">Account Type</label>
                  <p className="text-base font-semibold text-[var(--text)]">{currentUser?.role}</p>
                </div>
                <div className="flex flex-col gap-2 pb-4 border-b-2 border-[var(--border-light)]">
                  <label className="text-xs font-bold text-[var(--gray-700)] uppercase tracking-wider">Member Since</label>
                  <p className="text-base font-semibold text-[var(--text)]">{currentUser?.joinDate}</p>
                </div>
                <div className="flex flex-col gap-2 pb-4 border-b-2 border-[var(--border-light)]">
                  <label className="text-xs font-bold text-[var(--gray-700)] uppercase tracking-wider">Phone Number</label>
                  <p className="text-base font-semibold text-[var(--text)]">+1 (555) 123-4567</p>
                </div>
                <div className="flex flex-col gap-2 pb-4 border-b-2 border-[var(--border-light)]">
                  <label className="text-xs font-bold text-[var(--gray-700)] uppercase tracking-wider">Location</label>
                  <p className="text-base font-semibold text-[var(--text)]">San Francisco, CA</p>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="bg-[var(--gray-100)] rounded-xl p-8 shadow-md">
              <h2 className="text-2xl font-extrabold text-[var(--text)] mb-6">Recent Activity</h2>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 p-4 bg-[var(--gray-100)] rounded-lg transition-all duration-300 hover:bg-[var(--hover-bg)] hover:translate-x-1">
                  <div className="text-2xl min-w-8">✅</div>
                  <div className="flex-1">
                    <p className="font-bold text-[var(--text)] text-sm mb-1">Service Completed</p>
                    <p className="text-[var(--gray-700)] text-xs">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-[var(--gray-100)] rounded-lg transition-all duration-300 hover:bg-[var(--hover-bg)] hover:translate-x-1">
                  <div className="text-2xl min-w-8">📝</div>
                  <div className="flex-1">
                    <p className="font-bold text-[var(--text)] text-sm mb-1">Created New Service</p>
                    <p className="text-[var(--gray-700)] text-xs">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 bg-[var(--gray-100)] rounded-lg transition-all duration-300 hover:bg-[var(--hover-bg)] hover:translate-x-1">
                  <div className="text-2xl min-w-8">🔄</div>
                  <div className="flex-1">
                    <p className="font-bold text-[var(--text)] text-sm mb-1">Updated Profile</p>
                    <p className="text-[var(--gray-700)] text-xs">3 days ago</p>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
