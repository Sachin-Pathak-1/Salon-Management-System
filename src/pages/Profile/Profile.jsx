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
    <div className="min-h-screen w-[85%] mx-auto bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">

      <main className="flex-1 p-7">

        {/* Header */}
        <header className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg mb-6">
          <div className="h-40 bg-gradient-to-br from-blue-500 to-blue-700" />

          <div className="flex flex-col md:flex-row gap-5 items-start md:items-center px-6 pb-7 pt-5">
            <div className="-mt-12 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white font-extrabold text-3xl flex items-center justify-center shadow">
              {initials}
            </div>

            <div className="flex-1">
              <h1 className="text-xl font-extrabold mb-1">
                {user.name}
              </h1>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {user.email} •{" "}
                <span className="text-blue-500 font-bold">
                  {user.role}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Member since {user.joinDate}
              </div>
            </div>

            <div className="w-full md:w-auto">
              <button className="bg-gradient-to-br from-blue-500 to-blue-700 text-white px-4 py-2 rounded-lg font-bold">
                Edit Profile
              </button>
            </div>
          </div>
        </header>

        {/* Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">

          {/* Content */}
          <section className="flex flex-col gap-5">

            {/* Overview */}
            <div id="overview" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow">
              <h2 className="text-lg font-extrabold mb-3">
                Account Overview
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  ["📊", "Total Activities", "1,234"],
                  ["⚡", "Active Services", "12"],
                  ["✅", "Completed", "890"],
                ].map(([icon, label, value]) => (
                  <div
                    key={label}
                    className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3 text-center"
                  >
                    <div className="text-xl">{icon}</div>
                    <div className="text-xs font-bold text-gray-600 dark:text-gray-400">
                      {label}
                    </div>
                    <div className="text-lg font-extrabold text-blue-500">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Info */}
            <div id="personal" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow">
              <h2 className="text-lg font-extrabold mb-3">
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

            {/* Activity */}
            <div id="activity" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow">
              <h2 className="text-lg font-extrabold mb-3">
                Recent Activity
              </h2>

              <ul className="flex flex-col gap-3">
                {[
                  ["✅", "Service Completed", "2 hours ago"],
                  ["📝", "Created New Service", "1 day ago"],
                  ["🔄", "Updated Profile", "3 days ago"],
                ].map(([icon, title, time]) => (
                  <li
                    key={title}
                    className="flex gap-3 items-center bg-gray-50 dark:bg-gray-900 rounded-lg p-3"
                  >
                    <span className="w-11 h-11 rounded-full flex items-center justify-center bg-blue-100 dark:bg-gray-700 text-blue-600 text-lg">
                      {icon}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold">{title}</span>
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {time}
                      </span>
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
