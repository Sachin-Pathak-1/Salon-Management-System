import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

const SALON_API = "http://localhost:5000/api/salons/get";

export function Navbar({
  isLoggedIn,
  setIsLoggedIn,
  currentUser,
  setCurrentUser,
  activeSalon,
  setActiveSalon
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [salons, setSalons] = useState([]);
  const [salonsLoading, setSalonsLoading] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );

  const navigate = useNavigate();
  const location = useLocation();
  const isAdminOrOwner = currentUser?.role === "admin" || currentUser?.role === "owner";

  let dashboardLink = "/staff-dashboard";
  if (currentUser?.role === "admin") dashboardLink = "/dashboard";
  if (currentUser?.role === "manager") dashboardLink = "/manager-dashboard";

  /* ================= AUTH HEADER ================= */
  const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")
      }`
  });

  /* ================= FETCH SALONS ================= */
  const fetchSalons = async () => {
    try {
      setSalonsLoading(true);
      const res = await fetch(SALON_API, {
        headers: authHeader()
      });

      if (!res.ok) {
        console.error("Status:", res.status);
        const text = await res.text();
        console.error("Response:", text);
        setSalons([]);
        return;
      }

      const data = await res.json();
      const list = Array.isArray(data) ? data : [];

      setSalons(list);

      // If no salons returned, clear any previously selected salon (stale value)
      if (!list.length) {
        setActiveSalon("");
        localStorage.removeItem("activeSalon");
      } else {
        // If current activeSalon is missing or not in the fetched list, pick the first
        const found = list.find(s => s._id === activeSalon);
        if (!activeSalon || !found) {
          setActiveSalon(list[0]._id);
        }
      }

    } catch (err) {
      console.error("Network error:", err);
      setSalons([]);
    } finally {
      setSalonsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchSalons();
    // eslint-disable-next-line
  }, [isLoggedIn]);

  /* ================= THEME ================= */
  const applyTheme = (t) => {
    document.documentElement.setAttribute("data-theme", t);

    // Sync with Tailwind 'class' mode
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    localStorage.setItem("theme", t);
    setTheme(t);
  };

  useEffect(() => {
    applyTheme(theme);
    // eslint-disable-next-line
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    // Clear selected salon on logout to avoid leaking previous user's salon
    setActiveSalon("");
    localStorage.removeItem("activeSalon");
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("activeSalon");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* LOGO */}
        <div
          className="navbar-logo"
          onClick={() => navigate(isLoggedIn ? dashboardLink : "/")}
        >
          Blissful Beauty Salon
        </div>

        {/* CENTER NAV */}
        <div className="navbar-center">
          {/* location dropdown always visible */}
          {!isLoggedIn && (
            <div className="location-selector">
              <span>📍</span>
              <select className="location-dropdown">
                <option>Mumbai</option>
                <option>Delhi</option>
                <option>Bengaluru</option>
              </select>
            </div>
          )}

          {/* Show only landing links when NOT logged in */}
          {!isLoggedIn && (
            <>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/lpservices" className="nav-link">Services</Link>
              <Link to="/about" className="nav-link">About</Link>
              <Link to="/contact" className="nav-link">Contact</Link>
            </>
          )}

          {/* Show system links when logged in */}
          {isLoggedIn && (
            <>
              <Link
                to={dashboardLink}
                className={`nav-link ${location.pathname === dashboardLink ? "active" : ""}`}
              >
                Dashboard
              </Link>

              <Link
                to="/add-appointment"
                className={`nav-link ${location.pathname === "/add-appointment" ? "active" : ""}`}
              >
                Add Appointment
              </Link>

              {currentUser?.role === "admin" && (
                <Link
                  to="/plans"
                  className={`nav-link ${location.pathname === "/plans" ? "active" : ""}`}
                >
                  Plans
                </Link>
              )}
            </>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="navbar-right">
          {/* landing page controls when not logged in */}
          {!isLoggedIn && (
            <>
              <div className="lang-toggle">
                🌐 EN
              </div>
              <button
                className="nav-btn book-now"
                onClick={() => navigate('/login')}
              >
                Book Now
              </button>
              <Link to="/login" className="nav-link nav-login">
                Log In
              </Link>
              <Link to="/signup" className="nav-link nav-signup">
                Sign Up
              </Link>
            </>
          )}

          {/* Salon Select (Improved UI) */}
          {isLoggedIn && salons.length > 0 && (
            <div className="salon-select-wrapper">
              <label className="salon-label">Salon</label>
              <select
                value={activeSalon}
                onChange={(e) => setActiveSalon(e.target.value)}
                className="salon-select"
              >
                {salons.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

      
          {/* Theme Toggle */}
          <button
            className="theme-toggle-btn"
            onClick={() => applyTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>
      </div>
    </nav>
  );
}
