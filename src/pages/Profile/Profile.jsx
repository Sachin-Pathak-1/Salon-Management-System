
import InfoRow from "../../components/InfoRow";

const Profile = ({ currentUser }) => {
  const user = currentUser || {
    name: "Ananya Patel",
    email: "ananyapatel@gmail.com",
    role: "Standard User",
    joinDate: "Feb 2022",
    phone: "+91 85412 36524",
    location: "Mumbai, India",
  };
  const initials = (user.name || "").split(" ").map(n => n[0] || "").slice(0,2).join("").toUpperCase();

  return (
    <div className="flex min-h-screen w-[85%] mx-auto bg-[var(--background)] text-[var(--text)] font-['Inter'] transition-colors duration-300 ease">

      <main className="flex-1 bg-[var(--background)] py-10">
        <div className="px-7">
          <header className="bg-[var(--gray-100)] rounded-xl overflow-hidden shadow-lg mb-6">
            <div className="h-40 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark,var(--primary))] relative"></div>
            <div className="flex gap-5 items-center px-6 pb-7 relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark,var(--primary))] text-white font-extrabold text-2xl flex items-center justify-center shadow-lg -mt-12">
                {initials}
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-extrabold text-[var(--text)] mb-1.5">{user.name}</h1>
                <div className="text-[var(--gray-700)] text-xs mb-1.5">{user.email} • <span className="text-[var(--primary)] font-bold">{user.role}</span></div>
                <div className="text-[var(--gray-700)] text-xs">Member since {user.joinDate}</div>
              </div>
              <div className="text-right">
                <button className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark,var(--primary))] text-white border-none px-4 py-2.5 rounded-xl font-bold cursor-pointer">Edit Profile</button>
              </div>
            </div>
          </header>

          <section className="grid grid-cols-[260px_1fr] gap-5">
            <aside className="sticky top-25">
              <nav className="flex flex-col gap-2">
                <a className="px-3 py-2.5 rounded-lg text-[var(--gray-700)] no-underline font-semibold active:bg-[var(--hover-bg)] active:text-[var(--primary)]" href="#overview">Overview</a>
                <a className="px-3 py-2.5 rounded-lg text-[var(--gray-700)] no-underline font-semibold" href="#personal">Personal</a>
                <a className="px-3 py-2.5 rounded-lg text-[var(--gray-700)] no-underline font-semibold" href="#activity">Activity</a>
                <a className="px-3 py-2.5 rounded-lg text-[var(--gray-700)] no-underline font-semibold" href="#settings">Settings</a>
              </nav>
            </aside>

            <section className="flex flex-col gap-4.5">
              <div id="overview" className="bg-[var(--gray-100)] rounded-xl overflow-hidden shadow-md border border-[var(--border-light)] p-4.5">
                <h2 className="text-lg font-extrabold text-[var(--text)] mb-3">Account Overview</h2>
                <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
                  <div className="bg-[var(--background)] border border-[var(--border-light)] p-3 rounded-xl text-center">
                    <div className="text-2xl mb-3">📊</div>
                    <div className="text-[var(--gray-700)] font-bold text-xs uppercase tracking-wider mb-2">Total Activities</div>
                    <div className="text-lg font-extrabold text-[var(--primary)]">1,234</div>
                  </div>
                  <div className="bg-[var(--background)] border border-[var(--border-light)] p-3 rounded-xl text-center">
                    <div className="text-2xl mb-3">⚡</div>
                    <div className="text-[var(--gray-700)] font-bold text-xs uppercase tracking-wider mb-2">Active Services</div>
                    <div className="text-lg font-extrabold text-[var(--primary)]">12</div>
                  </div>
                  <div className="bg-[var(--background)] border border-[var(--border-light)] p-3 rounded-xl text-center">
                    <div className="text-2xl mb-3">✅</div>
                    <div className="text-[var(--gray-700)] font-bold text-xs uppercase tracking-wider mb-2">Completed</div>
                    <div className="text-lg font-extrabold text-[var(--primary)]">890</div>
                  </div>
                </div>
              </div>

              <div id="personal" className="bg-[var(--gray-100)] rounded-xl overflow-hidden shadow-md border border-[var(--border-light)] p-4.5">
                <h2 className="text-lg font-extrabold text-[var(--text)] mb-3">Personal Information</h2>
                <div className="flex flex-col gap-3">
                  <InfoRow label="Full name" value={user.name} />
                  <InfoRow label="Email" value={user.email} />
                  <InfoRow label="Phone" value={user.phone} />
                  <InfoRow label="Location" value={user.location} />
                  <InfoRow label="Account type" value={user.role} />
                  <InfoRow label="Member since" value={user.joinDate} />
                </div>
              </div>

              <div id="activity" className="bg-[var(--gray-100)] rounded-xl overflow-hidden shadow-md border border-[var(--border-light)] p-4.5">
                <h2 className="text-lg font-extrabold text-[var(--text)] mb-3">Recent Activity</h2>
                <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                  <li className="flex gap-3 items-center p-3 bg-[var(--gray-100)] rounded-lg">
                    <span className="w-11 h-11 rounded-full flex items-center justify-center bg-[var(--hover-bg)] text-[var(--primary)] text-lg">✅</span>
                    <div className="flex flex-col">
                      <div className="font-bold text-[var(--text)] text-sm">Service Completed</div>
                      <div className="text-[var(--gray-700)] text-xs mt-1">2 hours ago</div>
                    </div>
                  </li>
                  <li className="flex gap-3 items-center p-3 bg-[var(--gray-100)] rounded-lg">
                    <span className="w-11 h-11 rounded-full flex items-center justify-center bg-[var(--hover-bg)] text-[var(--primary)] text-lg">📝</span>
                    <div className="flex flex-col">
                      <div className="font-bold text-[var(--text)] text-sm">Created New Service</div>
                      <div className="text-[var(--gray-700)] text-xs mt-1">1 day ago</div>
                    </div>
                  </li>
                  <li className="flex gap-3 items-center p-3 bg-[var(--gray-100)] rounded-lg">
                    <span className="w-11 h-11 rounded-full flex items-center justify-center bg-[var(--hover-bg)] text-[var(--primary)] text-lg">🔄</span>
                    <div className="flex flex-col">
                      <div className="font-bold text-[var(--text)] text-sm">Updated Profile</div>
                      <div className="text-[var(--gray-700)] text-xs mt-1">3 days ago</div>
                    </div>
                  </li>
                </ul>
              </div>
            </section>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;
