import { useNavigate } from "react-router-dom";

export function ActivityPage({ isLoggedIn }) {
  const navigate = useNavigate();

  if (!isLoggedIn) {
    navigate("/login");
    return null;
  }

  const activities = [
    { id: 1, icon: "✅", title: "Service Completed", description: 'Completed "Email Marketing Setup" service', time: "2 hours ago", category: "completed" },
    { id: 2, icon: "📝", title: "Created New Service", description: 'Added "Social Media Management" to portfolio', time: "4 hours ago", category: "created" },
    { id: 3, icon: "💬", title: "New Message", description: "Received message from John Doe", time: "1 day ago", category: "message" },
    { id: 4, icon: "🎯", title: "Goal Achieved", description: "Reached 100 completed services milestone", time: "2 days ago", category: "milestone" },
    { id: 5, icon: "⭐", title: "Review Posted", description: "Received 5-star review from Sarah Smith", time: "3 days ago", category: "review" },
    { id: 6, icon: "🔔", title: "New Booking", description: 'Booking received for "Website Design" service', time: "4 days ago", category: "booking" },
    { id: 7, icon: "💰", title: "Payment Received", description: "Received payment of $500 for completed service", time: "5 days ago", category: "payment" },
    { id: 8, icon: "🏆", title: "Badge Earned", description: 'Earned "Top Performer" badge', time: "1 week ago", category: "achievement" },
  ];

  const categoryColors = {
    completed: "bg-emerald-500 text-emerald-500 border-emerald-500",
    created: "bg-blue-500 text-blue-500 border-blue-500",
    message: "bg-amber-500 text-amber-500 border-amber-500",
    milestone: "bg-pink-500 text-pink-500 border-pink-500",
    review: "bg-cyan-500 text-cyan-500 border-cyan-500",
    booking: "bg-violet-500 text-violet-500 border-violet-500",
    payment: "bg-indigo-500 text-indigo-500 border-indigo-500",
    achievement: "bg-orange-500 text-orange-500 border-orange-500",
  };

  return (
    <div className="min-h-screen bg-background px-5 py-10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-gray-100 p-8 rounded-2xl shadow mb-8">
          <div>
            <h1 className="text-3xl font-extrabold mb-2">My Activity</h1>
            <p className="text-sm text-gray-600 font-medium">
              View all your recent activities and events
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {["All", "Completed", "Messages", "Bookings"].map((item, i) => (
              <button
                key={i}
                className={`px-5 py-2 rounded-xl text-sm font-bold border-2 transition
                  ${i === 0
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-100 border-gray-200 hover:border-blue-600 hover:text-blue-600"
                  }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Activities */}
        <div className="flex flex-col gap-4 mb-10">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="bg-gray-100 border border-gray-200 rounded-xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center
                         shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl text-white shadow
                ${categoryColors[activity.category].split(" ")[0]}`}
              >
                {activity.icon}
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="font-bold text-base mb-1">{activity.title}</h3>
                <p className="text-sm text-gray-600">{activity.description}</p>
              </div>

              {/* Meta */}
              <div className="flex flex-col items-start md:items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-lg border-2 text-xs font-bold capitalize
                  ${categoryColors[activity.category].replace("bg-", "border-").replace("text-", "text-")}`}
                >
                  {activity.category}
                </span>
                <span className="text-xs text-gray-600 font-semibold">
                  {activity.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: "📊", title: "This Month", value: "34", label: "activities" },
            { icon: "⭐", title: "Rating", value: "4.9/5", label: "average rating" },
            { icon: "✅", title: "Completed", value: "98%", label: "success rate" },
            { icon: "👥", title: "Clients", value: "156", label: "total clients" },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-gray-100 border border-gray-200 rounded-2xl p-7 text-center shadow transition
                         hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <h3 className="text-sm font-bold uppercase mb-2">{stat.title}</h3>
              <p className="text-3xl font-extrabold text-blue-600 mb-1">
                {stat.value}
              </p>
              <small className="text-xs text-gray-600 font-medium">
                {stat.label}
              </small>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
