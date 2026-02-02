import { Footer } from "../../components/Footer";
import { Layout } from "../Layout";

const Views = [
  { page: "Service A", views: 2150 },
  { page: "Service B", views: 120 },
  { page: "Service C", views: 90 },
  { page: "Service D", views: 80 },
  { page: "Service E", views: 70 },
];

const Recent = [
  { profile: "/image.png", name: "John Doe", activity: "Viewed Service A", time: "2 hours ago" },
  { profile: "/image.png", name: "Jane Smith", activity: "Booked Service B", time: "3 hours ago" },
  { profile: "/image.png", name: "Alice Johnson", activity: "Left a review on Service C", time: "5 hours ago" },
  { profile: "/image.png", name: "Bob Brown", activity: "Updated profile information", time: "1 day ago" },
];

export function Dashboard() {
  return (
    <Layout>
      <div className="flex flex-col gap-10 min-h-screen bg-[var(--background)] text-[var(--text)] px-4 py-10 items-center transition-colors duration-300 ease">
        {/* Welcome Section */}
        <div className="bg-[var(--gray-100)] w-full max-w-4xl mx-auto p-8 flex flex-col gap-5 rounded-lg border border-[var(--border-light)] text-[var(--text)] shadow-sm transition-all duration-300 ease">
          <h2 className="text-2xl font-bold text-[var(--text)]">Welcome to Services Management Dashboard!</h2>

          <div className="intro">
            <span className="text-lg font-semibold text-[var(--text)]">Get Started</span>
            <p className="text-[var(--gray-700)]">You can customize your dashboard here.</p>
          </div>

          <button className="bg-[var(--primary)] text-white border-none px-4 py-2.5 rounded font-bold cursor-pointer w-fit transition-all duration-300 ease hover:bg-[var(--secondary)]">Customize Dashboard</button>

          <div className="flex justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-[var(--text)]">Next Steps</h3>
              <ul className="list-none p-0">
                <li className="text-sm font-semibold text-[var(--gray-700)] cursor-pointer mb-2.5 transition-all duration-300 ease hover:text-[var(--primary)]">Write a blog</li>
                <li className="text-sm font-semibold text-[var(--gray-700)] cursor-pointer mb-2.5 transition-all duration-300 ease hover:text-[var(--primary)]">Add an about page</li>
                <li className="text-sm font-semibold text-[var(--gray-700)] cursor-pointer mb-2.5 transition-all duration-300 ease hover:text-[var(--primary)]">View your site</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[var(--text)]">At a Glance</h3>
              <ul className="list-none p-0">
                <li className="text-sm font-semibold text-[var(--gray-700)] cursor-pointer mb-2.5 transition-all duration-300 ease hover:text-[var(--primary)]">35 Posts</li>
                <li className="text-sm font-semibold text-[var(--gray-700)] cursor-pointer mb-2.5 transition-all duration-300 ease hover:text-[var(--primary)]">21 Pages</li>
                <li className="text-sm font-semibold text-[var(--gray-700)] cursor-pointer mb-2.5 transition-all duration-300 ease hover:text-[var(--primary)]">18 Comments</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[var(--text)]">More Actions</h3>
              <ul className="list-none p-0">
                <li className="text-sm font-semibold text-[var(--gray-700)] cursor-pointer mb-2.5 transition-all duration-300 ease hover:text-[var(--primary)]">Manage Widgets or Menu</li>
                <li className="text-sm font-semibold text-[var(--gray-700)] cursor-pointer mb-2.5 transition-all duration-300 ease hover:text-[var(--primary)]">Turn comments on or off</li>
                <li className="text-sm font-semibold text-[var(--gray-700)] cursor-pointer mb-2.5 transition-all duration-300 ease hover:text-[var(--primary)]">More about getting started</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Draft */}
        <div className="bg-[var(--gray-100)] w-full max-w-4xl mx-auto p-8 flex flex-col gap-5 rounded-lg border border-[var(--border-light)] text-[var(--text)] shadow-sm transition-all duration-300 ease">
          <h3 className="text-xl font-semibold text-[var(--text)]">Quick Draft</h3>
          <form className="flex flex-col gap-3">
            <input type="text" placeholder="Title" className="border border-[var(--border-light)] p-2.5 rounded font-semibold bg-[var(--background)] text-[var(--text)] transition-all duration-300 ease focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            <textarea placeholder="What's on your mind?" className="h-24 border border-[var(--border-light)] p-2.5 rounded font-semibold bg-[var(--background)] text-[var(--text)] transition-all duration-300 ease focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            <button className="bg-[var(--primary)] text-white border-none px-4 py-2.5 rounded font-bold cursor-pointer w-fit transition-all duration-300 ease hover:bg-[var(--secondary)]">Save Draft</button>
          </form>
        </div>

        {/* Tables */}
        <div className="flex gap-6 w-full max-w-4xl mx-auto">
          <div className="bg-[var(--gray-100)] flex-1 min-h-28 p-8 flex flex-col gap-5 rounded-lg border border-[var(--border-light)] text-[var(--text)] shadow-sm transition-all duration-300 ease">
            <h3 className="text-xl font-semibold text-[var(--text)]">Viewed services by users</h3>
            <div className="flex justify-between font-semibold text-[var(--gray-700)] mb-3">
              <span>Page</span>
              <span>Page Views</span>
            </div>

            {Views.map((item, index) => (
              <div key={index} className="flex justify-between border-t border-[var(--border-light)] py-2.5 text-sm text-[var(--text)]">
                <span>{item.page}</span>
                <span>{item.views}</span>
              </div>
            ))}
          </div>

          <div className="bg-[var(--gray-100)] flex-1 min-h-28 p-8 flex flex-col gap-5 rounded-lg border border-[var(--border-light)] text-[var(--text)] shadow-sm transition-all duration-300 ease">
            <h3 className="text-xl font-semibold text-[var(--text)]">Recent Activities</h3>
            <div className="flex justify-between font-semibold text-[var(--gray-700)] mb-3">
              <span>Name</span>
              <span>Time</span>
            </div>

            {Recent.map((item, index) => (
              <div key={index} className="flex justify-between border-t border-[var(--border-light)] py-2.5 text-sm text-[var(--text)]">
                <div className="flex gap-2.5 items-center">
                  <img src={item.profile} alt="profile" className="w-6 h-6 rounded-full" />
                  <div>
                    <div>{item.name}</div>
                    <small className="text-xs text-gray-400">{item.activity}</small>
                  </div>
                </div>
                <span>{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
        <Footer />
    </Layout>
  );
}
