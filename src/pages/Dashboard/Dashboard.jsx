import { Footer } from "../../components/Footer";
import { useNavigate } from "react-router-dom";



const PopularServices = [
  { service: "Haircuts & Styling", bookings: 2150 },
  { service: "Hair Coloring", bookings: 120 },
  { service: "Facials", bookings: 90 },
  { service: "Manicure/Pedicure", bookings: 80 },
  { service: "Massages", bookings: 70 },
];

const RecentActivities = [
  { profile: "/image.png", name: "Sarah Johnson", activity: "Booked haircut appointment", time: "2 hours ago" },
  { profile: "/image.png", name: "Emily Chen", activity: "Completed facial treatment", time: "3 hours ago" },
  { profile: "/image.png", name: "Maria Rodriguez", activity: "Left a 5-star review", time: "5 hours ago" },
  { profile: "/image.png", name: "Lisa Wong", activity: "Scheduled hair coloring", time: "1 day ago" },
];

export function Dashboard() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex flex-col gap-10 min-h-screen bg-[var(--background)] text-[var(--text)] px-4 py-10 items-center transition-colors duration-300 ease">
        {/* Welcome Section */}
        <div className="bg-[var(--gray-100)] w-full max-w-4xl mx-auto p-8 flex flex-col gap-5 rounded-lg border border-[var(--border-light)] text-[var(--text)] shadow-sm transition-all duration-300 ease">
          <h2 className="text-2xl font-bold text-[var(--text)]">Welcome to Salon Dashboard!</h2>

          <div className="intro">
            <span className="text-lg font-semibold text-[var(--text)]">Manage Your Salon</span>
            <p className="text-[var(--gray-700)]">Manage your salon's operations, appointments, and customer experience.</p>
          </div>

          <button className="bg-[var(--primary)] text-white border-none px-4 py-2.5 rounded font-bold cursor-pointer w-fit transition-all duration-300 ease hover:bg-[var(--secondary)]" onClick={() => navigate("/appointments")} >View Appointments</button>

          <div className="flex justify-between gap-6">
            <div>
              <h3 className="text-xl font-semibold text-[var(--text)]">Next Steps</h3>
              <ul className="list-none p-0">
                <li className="text-sm font-semibold text-[var(--gray-700)] cursor-pointer mb-2.5 transition-all duration-300 ease hover:text-[var(--primary)]">Schedule appointment</li>
                <li className="text-sm font-semibold text-[var(--gray-700)] cursor-pointer mb-2.5 transition-all duration-300 ease hover:text-[var(--primary)]">Add new service</li>
                <li className="text-sm font-semibold text-[var(--gray-700)] cursor-pointer mb-2.5 transition-all duration-300 ease hover:text-[var(--primary)]">View customer reviews</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[var(--text)]">At a Glance</h3>
              <ul className="list-none p-0">
                <li className="text-sm font-semibold text-[var(--gray-700)] cursor-pointer mb-2.5 transition-all duration-300 ease hover:text-[var(--primary)]">12 Today's Appointments</li>
                <li className="text-sm font-semibold text-[var(--gray-700)] cursor-pointer mb-2.5 transition-all duration-300 ease hover:text-[var(--primary)]">8 Active Services</li>
                <li className="text-sm font-semibold text-[var(--gray-700)] cursor-pointer mb-2.5 transition-all duration-300 ease hover:text-[var(--primary)]">45 Customer Reviews</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-[var(--text)]">More Actions</h3>
              <ul className="list-none p-0">
                <li className="text-sm font-semibold text-[var(--gray-700)] cursor-pointer mb-2.5 transition-all duration-300 ease hover:text-[var(--primary)]">Manage staff schedule</li>
                <li className="text-sm font-semibold text-[var(--gray-700)] cursor-pointer mb-2.5 transition-all duration-300 ease hover:text-[var(--primary)]">Update service prices</li>
                <li className="text-sm font-semibold text-[var(--gray-700)] cursor-pointer mb-2.5 transition-all duration-300 ease hover:text-[var(--primary)]">View monthly reports</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quick Note */}
        <div className="bg-[var(--gray-100)] w-full max-w-4xl mx-auto p-8 flex flex-col gap-5 rounded-lg border border-[var(--border-light)] text-[var(--text)] shadow-sm transition-all duration-300 ease">
          <h3 className="text-xl font-semibold text-[var(--text)]">Quick Note</h3>
          <form className="flex flex-col gap-3">
            <input type="text" placeholder="Note Title" className="border border-[var(--border-light)] p-2.5 rounded font-semibold bg-[var(--background)] text-[var(--text)] transition-all duration-300 ease focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            <textarea placeholder="Add a note about today's appointments or customer feedback..." className="h-24 border border-[var(--border-light)] p-2.5 rounded font-semibold bg-[var(--background)] text-[var(--text)] transition-all duration-300 ease focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
            <button className="bg-[var(--primary)] text-white border-none px-4 py-2.5 rounded font-bold cursor-pointer w-fit transition-all duration-300 ease hover:bg-[var(--secondary)]">Save Note</button>
          </form>
        </div>

        {/* Tables */}
        <div className="flex gap-6 w-full max-w-4xl mx-auto">
          <div className="bg-[var(--gray-100)] flex-1 min-h-28 p-8 flex flex-col gap-5 rounded-lg border border-[var(--border-light)] text-[var(--text)] shadow-sm transition-all duration-300 ease">
            <h3 className="text-xl font-semibold text-[var(--text)]">Popular Services</h3>
            <div className="flex justify-between font-semibold text-[var(--gray-700)] mb-3">
              <span>Service</span>
              <span>Bookings</span>
            </div>

            {PopularServices.map((item, index) => (
              <div key={index} className="flex justify-between border-t border-[var(--border-light)] py-2.5 text-sm text-[var(--text)]">
                <span>{item.service}</span>
                <span>{item.bookings}</span>
              </div>
            ))}
          </div>

          <div className="bg-[var(--gray-100)] flex-1 min-h-28 p-8 flex flex-col gap-5 rounded-lg border border-[var(--border-light)] text-[var(--text)] shadow-sm transition-all duration-300 ease">
            <h3 className="text-xl font-semibold text-[var(--text)]">Recent Activities</h3>
            <div className="flex justify-between font-semibold text-[var(--gray-700)] mb-3">
              <span>Name</span>
              <span>Time</span>
            </div>

            {RecentActivities.map((item, index) => (
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
    </div>


  );
}
