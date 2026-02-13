import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import InfoRow from "../../components/InfoRow";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const isAdmin = storedUser.role === "admin";
      const endpoint = isAdmin ? "/adminProfile/profile" : "/staffProfile/me";
      const res = await api.get(endpoint);
      setUser(res.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen font-['Inter']">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen font-['Inter']">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
          <button onClick={() => navigate("/")} className="btn-primary px-6 py-2 rounded-xl">Go Home</button>
        </div>
      </div>
    );
  }

  const initials = (user.name || "").split(" ").map(n => n[0] || "").slice(0, 2).join("").toUpperCase();
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A";

  return (
    <div className="flex min-h-screen w-full bg-[var(--background)] text-[var(--text)] font-['Inter'] transition-colors duration-300 ease">

      <main className="flex-1 py-10 px-4 md:px-10 lg:px-20">
        <div className="max-w-6xl mx-auto">
          {/* HEADER CARD */}
          <header className="bg-[var(--gray-100)] rounded-3xl overflow-hidden shadow-xl border border-[var(--border-light)] mb-10 transition-all hover:shadow-2xl">
            <div className="h-48 bg-gradient-to-r from-[var(--primary)] via-[var(--primary-dark,var(--primary))] to-[var(--secondary,var(--primary))] relative">
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center md:items-end px-8 pb-10 relative">
              <div className="w-32 h-32 rounded-3xl bg-white p-1 shadow-2xl -mt-16 z-10 transition-transform hover:scale-105">
                <div className="w-full h-full rounded-[20px] bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark,var(--primary))] text-white font-black text-4xl flex items-center justify-center">
                  {initials}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-black text-[var(--text)] mb-2 tracking-tight">{user.name}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 items-center mb-3">
                  <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--background)] border border-[var(--border-light)] text-sm font-medium">
                    <span>📧</span> {user.email}
                  </span>
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--primary)] text-white font-bold uppercase tracking-wider text-xs shadow-sm">
                    {user.role}
                  </span>
                </div>
                <div className="text-[var(--text)] text-sm font-medium opacity-80">
                  Account Active since {joinDate}
                </div>
              </div>

              <div className="mt-4 md:mt-0">
                <button
                  onClick={() => navigate("/settings")}
                  className="flex items-center gap-2 bg-[var(--text)] text-[var(--background)] px-7 py-3.5 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg group"
                >
                  <span className="transition-transform group-hover:rotate-12">✏️</span> Edit Profile
                </button>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-10">
            {/* SIDE NAVIGATION */}
            <aside className="hidden lg:block">
              <nav className="flex flex-col gap-2 sticky top-24">
                <NavItem icon="📊" label="Overview" href="#overview" active />
                <NavItem icon="👤" label="Personal Info" href="#personal" />
                <NavItem icon="⚡" label="Recent Activity" href="#activity" />
                <div className="mt-6 pt-6 border-t border-[var(--border-light)]">
                  <button
                    onClick={() => navigate("/settings")}
                    className="w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl text-[var(--text)] opacity-70 no-underline font-bold transition-all hover:bg-[var(--gray-100)] hover:opacity-100"
                  >
                    <span>⚙️</span> Settings
                  </button>
                </div>
              </nav>
            </aside>

            {/* MAIN CONTENT */}
            <section className="flex flex-col gap-8">
              <div id="overview" className="bg-[var(--gray-100)] rounded-3xl p-8 shadow-sm border border-[var(--border-light)]">
                <h2 className="text-xl font-black text-[var(--text)] mb-8 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">📊</span>
                  Account Overview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <StatCard icon="📅" label="Last Seen" value="Today" themeColor="var(--accent)" />
                  <StatCard icon="✔️" label="Permissions" value={user.role === 'admin' ? "Full Access" : "Management"} themeColor="var(--success)" />
                  <StatCard icon="🏢" label="Associated" value={user.role === 'admin' ? "All Salons" : "Assigned Salon"} themeColor="var(--primary)" />
                </div>
              </div>

              <div id="personal" className="bg-[var(--gray-100)] rounded-3xl p-8 shadow-sm border border-[var(--border-light)]">
                <h2 className="text-xl font-black text-[var(--text)] mb-8 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">👤</span>
                  Personal Information
                </h2>
                <div className="space-y-4">
                  <ProfileInfoRow label="Full Name" value={user.name} />
                  <ProfileInfoRow label="Email Address" value={user.email} />
                  <ProfileInfoRow label="Contact Number" value={user.contact || "Not provided"} />
                  <ProfileInfoRow label="Role" value={user.role} badge />
                  <ProfileInfoRow label="Location" value={user.address || "Mumbai, India"} />
                  <ProfileInfoRow label="Member Since" value={joinDate} />
                </div>
              </div>

              <div id="activity" className="bg-[var(--gray-100)] rounded-3xl p-8 shadow-sm border border-[var(--border-light)]">
                <h2 className="text-xl font-black text-[var(--text)] mb-8 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">⚡</span>
                  System Activity
                </h2>
                <div className="grid gap-4">
                  <ActivityItem icon="🛡️" title="Secure Login Session" time="Just now" status="success" />
                  <ActivityItem icon="⚙️" title="Viewed System Settings" time="15 mins ago" />
                  <ActivityItem icon="🏷️" title="Checked Service Catalog" time="2 hours ago" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

/* --- SUBCOMPONENTS --- */

const NavItem = ({ icon, label, href, active }) => (
  <a
    className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl no-underline font-bold transition-all ${active
      ? "bg-[var(--background)] text-[var(--primary)] shadow-sm border border-[var(--border-light)]"
      : "text-[var(--text)] opacity-60 hover:opacity-100 hover:bg-[var(--gray-100)] hover:translate-x-1"
      }`}
    href={href}
  >
    <span>{icon}</span> {label}
  </a>
);

const StatCard = ({ icon, label, value, themeColor }) => (
  <div className="bg-[var(--background)] p-6 rounded-2xl border border-[var(--border-light)] transition-all hover:-translate-y-1 hover:shadow-lg group">
    <div className="text-3xl mb-4 transition-transform group-hover:scale-110 origin-left">{icon}</div>
    <div className="text-[var(--text)] font-bold text-[10px] uppercase tracking-widest mb-1 opacity-50">{label}</div>
    <div className="text-lg font-black" style={{ color: themeColor }}>{value}</div>
  </div>
);

const ProfileInfoRow = ({ label, value, badge }) => (
  <div className="flex justify-between items-center py-4.5 border-b border-[var(--border-light)] last:border-0 group">
    <span className="font-bold text-sm text-[var(--text)] opacity-70 group-hover:opacity-100 transition-opacity">{label}</span>
    {badge ? (
      <span className="px-3.5 py-1.5 rounded-full bg-[var(--primary)] text-white font-black uppercase text-[11px] tracking-widest shadow-sm">
        {value}
      </span>
    ) : (
      <span className="font-semibold text-sm text-[var(--text)]">{value}</span>
    )}
  </div>
);

const ActivityItem = ({ icon, title, time, status }) => (
  <div className="flex gap-4 items-center p-5 bg-[var(--background)] rounded-2xl border border-[var(--border-light)] transition-all hover:border-[var(--primary)] hover:border-opacity-30">
    <span className="w-12 h-12 rounded-xl bg-[var(--gray-100)] flex items-center justify-center text-xl shadow-inner border border-[var(--border-light)]">{icon}</span>
    <div className="flex-1">
      <div className="font-black text-[var(--text)] text-sm">{title}</div>
      <div className="text-[var(--text)] text-xs font-medium opacity-50">{time}</div>
    </div>
    {status === 'success' && (
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Active</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
      </div>
    )}
  </div>
);

export default Profile;
