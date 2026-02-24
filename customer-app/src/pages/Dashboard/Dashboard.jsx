import { Footer } from "../../components/Footer";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";


const EXPENSE_API = "http://localhost:5000/api/expenses";
const formatCurrency = (value) =>
  `INR ${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;


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

export function Dashboard({ activeSalon: activeSalonProp }) {
  const navigate = useNavigate();
  const [activeSalon, setActiveSalon] = useState(activeSalonProp || localStorage.getItem("activeSalon") || "");
  const [expenseSummary, setExpenseSummary] = useState({
    weeklyExpense: 0,
    monthlyExpense: 0,
    annualExpense: 0
  });
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [isSummaryFallbackUsed, setIsSummaryFallbackUsed] = useState(false);

  const calculateSummaryFromList = (expenses = []) => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart = new Date(now.getFullYear(), 0, 1);

    const weeklyExpense = expenses
      .filter((expense) => {
        const date = new Date(expense.date);
        return date >= weekStart && date <= now;
      })
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

    const monthlyExpense = expenses
      .filter((expense) => {
        const date = new Date(expense.date);
        return date >= monthStart && date <= now;
      })
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

    const annualExpense = expenses
      .filter((expense) => {
        const date = new Date(expense.date);
        return date >= yearStart && date <= now;
      })
      .reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

    return { weeklyExpense, monthlyExpense, annualExpense };
  };

  useEffect(() => {
    if (activeSalonProp) {
      setActiveSalon(activeSalonProp);
    }
  }, [activeSalonProp]);

  useEffect(() => {
    const syncSalon = () => setActiveSalon(localStorage.getItem("activeSalon") || "");
    window.addEventListener("storage", syncSalon);
    syncSalon();

    return () => window.removeEventListener("storage", syncSalon);
  }, []);

  useEffect(() => {
    const loadExpenses = async () => {
      if (!activeSalon) return;
      try {
        const headers = {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        };
        const [summaryRes, listRes] = await Promise.all([
          fetch(`${EXPENSE_API}/summary?salonId=${activeSalon}`, { headers }),
          fetch(`${EXPENSE_API}?salonId=${activeSalon}`, { headers })
        ]);

        const summaryData = await summaryRes.json();
        const listData = await listRes.json();
        const safeList = Array.isArray(listData) ? listData : [];

        if (summaryRes.ok) {
          const serverSummary = {
            weeklyExpense: summaryData.weeklyExpense || 0,
            monthlyExpense: summaryData.monthlyExpense || 0,
            annualExpense: summaryData.annualExpense || 0
          };

          const fallbackSummary = calculateSummaryFromList(safeList);
          const isAllZeroFromApi =
            serverSummary.weeklyExpense === 0 &&
            serverSummary.monthlyExpense === 0 &&
            serverSummary.annualExpense === 0 &&
            safeList.length > 0;

          if (isAllZeroFromApi) {
            setExpenseSummary(fallbackSummary);
            setIsSummaryFallbackUsed(true);
          } else {
            setExpenseSummary(serverSummary);
            setIsSummaryFallbackUsed(false);
          }
        } else {
          setExpenseSummary(calculateSummaryFromList(safeList));
          setIsSummaryFallbackUsed(true);
        }

        if (listRes.ok) {
          setRecentExpenses(safeList.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to load expenses:", err);
        setIsSummaryFallbackUsed(true);
      }
    };

    loadExpenses();
  }, [activeSalon]);

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

        <div className="bg-[var(--gray-100)] w-full max-w-4xl mx-auto p-8 flex flex-col gap-5 rounded-lg border border-[var(--border-light)] text-[var(--text)] shadow-sm transition-all duration-300 ease">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-[var(--text)]">Expense Overview</h3>
            <button
              className="bg-[var(--primary)] text-white border-none px-4 py-2.5 rounded font-bold cursor-pointer w-fit transition-all duration-300 ease hover:bg-[var(--secondary)]"
              onClick={() => navigate("/expenses")}
            >
              Manage Expenses
            </button>
          </div>
          {isSummaryFallbackUsed && (
            <p className="text-xs mt-2" style={{ color: "var(--warning)" }}>
              Expense summary is currently calculated from recent records due to a summary API mismatch.
            </p>
          )}

          {!activeSalon ? (
            <p className="text-sm text-[var(--gray-700)]">Select a salon to view expenses.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-[var(--border-light)] rounded-lg p-4 bg-[var(--background)]">
                  <p className="text-sm text-[var(--gray-700)]">Weekly Expense</p>
                  <p className="text-lg font-bold">{formatCurrency(expenseSummary.weeklyExpense)}</p>
                </div>
                <div className="border border-[var(--border-light)] rounded-lg p-4 bg-[var(--background)]">
                  <p className="text-sm text-[var(--gray-700)]">Monthly Expense</p>
                  <p className="text-lg font-bold">{formatCurrency(expenseSummary.monthlyExpense)}</p>
                </div>
                <div className="border border-[var(--border-light)] rounded-lg p-4 bg-[var(--background)]">
                  <p className="text-sm text-[var(--gray-700)]">Annual Expense</p>
                  <p className="text-lg font-bold">{formatCurrency(expenseSummary.annualExpense)}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-[var(--border-light)]">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-light)] bg-[var(--background)]">
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Category</th>
                      <th className="p-3 text-left">Amount</th>
                      <th className="p-3 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentExpenses.length === 0 ? (
                      <tr>
                        <td className="p-3 text-[var(--gray-700)]" colSpan={4}>No expenses found.</td>
                      </tr>
                    ) : (
                      recentExpenses.map((expense) => (
                        <tr key={expense._id} className="border-b border-[var(--border-light)] bg-[var(--background)]">
                          <td className="p-3">{new Date(expense.date).toLocaleDateString("en-IN")}</td>
                          <td className="p-3">{expense.category}</td>
                          <td className="p-3 font-semibold">{formatCurrency(expense.amount)}</td>
                          <td className="p-3">{expense.description || "-"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
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
