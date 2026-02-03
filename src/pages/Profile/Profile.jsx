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

  const initials = (user.name || "")
    .split(" ")
    .map((n) => n[0] || "")
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen max-w-7xl mx-auto bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 px-6 lg:px-10 transition-colors font-sans">

      <main className="py-8">

        {/* HEADER */}
        <header className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 mb-8">
          <div className="h-40 bg-gradient-to-br from-blue-500 to-blue-700" />

          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center px-6 pb-8 pt-5">
            <div className="-mt-14 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg">
              {initials}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight mb-1">
                {user.name}
              </h1>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {user.email} •{" "}
                <span className="text-blue-500 font-semibold">
                  {user.role}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Member since {user.joinDate}
              </div>
            </div>

            <button className="bg-gradient-to-br from-blue-500 to-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow hover:opacity-90 transition">
              Edit Profile
            </button>
          </div>
        </header>

        {/* MAIN GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">

          {/* CONTENT */}
          <section className="flex flex-col gap-6">

            {/* OVERVIEW */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
              <h2 className="text-lg font-semibold mb-4">
                Account Overview
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  ["📊", "Total Appointments", "30"],
                  ["⚡", "Active Services", "12"],
                  ["✅", "Completed", "10"],
                ].map(([icon, label, value]) => (
                  <div
                    key={label}
                    className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 text-center ring-1 ring-gray-200 dark:ring-gray-700"
                  >
                    <div className="text-xl mb-1">{icon}</div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {label}
                    </div>
                    <div className="text-lg font-bold text-blue-500">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* PERSONAL INFO */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
              <h2 className="text-lg font-semibold mb-4">
                Personal Information
              </h2>

              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                <InfoRow label="Full name" value={user.name} />
                <InfoRow label="Email" value={user.email} />
                <InfoRow label="Phone" value={user.phone} />
                <InfoRow label="Location" value={user.location} />
                <InfoRow label="Account type" value={user.role} />
                <InfoRow label="Member since" value={user.joinDate} />
              </div>
            </div>

            {/* ACTIVITY */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700">
              <h2 className="text-lg font-semibold mb-4">
                Recent Activity
              </h2>

              <ul className="flex flex-col gap-4">
                {[
                  ["✅", "Service Completed", "2 hours ago"],
                  ["📝", "Created New Service", "1 day ago"],
                  ["🔄", "Updated Profile", "3 days ago"],
                ].map(([icon, title, time]) => (
                  <li
                    key={title}
                    className="flex gap-4 items-center bg-gray-50 dark:bg-gray-900 rounded-xl p-4"
                  >
                    <span className="w-11 h-11 rounded-full flex items-center justify-center bg-blue-100 dark:bg-gray-700 text-blue-600 text-lg">
                      {icon}
                    </span>
                    <div>
                      <div className="font-medium">{title}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {time}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

          </section>
        </section>
      </main>
    </div>
  );
};

export default Profile;
