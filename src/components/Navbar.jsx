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
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );

  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = currentUser?.role === "admin";
  const dashboardLink = isAdmin ? "/dashboard" : "/staff-dashboard";

  /* ================= AUTH HEADER ================= */
  const authHeader = () => ({
    Authorization: `Bearer ${
      localStorage.getItem("adminToken") ||
      localStorage.getItem("staffToken")
    }`
  });

  /* ================= FETCH SALONS ================= */
  const fetchSalons = async () => {
  try {
    const res = await fetch(SALON_API, {
      headers: authHeader()
    });

    if (!res.ok) {
      console.error("Status:", res.status);
      const text = await res.text();
      console.error("Response:", text);
      return;
    }

    const data = await res.json();
    const list = Array.isArray(data) ? data : [];

    setSalons(list);

    if (list.length && !activeSalon) {
      setActiveSalon(list[0]._id);
    }

  } catch (err) {
    console.error("Network error:", err);
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
    localStorage.removeItem("adminToken");
    localStorage.removeItem("staffToken");
    localStorage.removeItem("currentUser");
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
          Blissful Beauty
        </div>

        {/* CENTER NAV */}
        <div className="navbar-center">

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
            </>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="navbar-right">

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

          {/* Auth Section */}
          {!isLoggedIn ? (
            <Link to="/login" className="nav-btn login-btn">
              Login
            </Link>
          ) : (
            <div className="profile-container">

              <button
                className="profile-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="profile-avatar">
                  {currentUser?.name?.charAt(0).toUpperCase()}
                </div>
                <span>{currentUser?.name}</span>
                <span>▼</span>
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown">

                  <div className="dropdown-header">
                    <p className="dropdown-name">{currentUser?.name}</p>
                    <p className="dropdown-email">{currentUser?.email}</p>
                    <small>{currentUser?.role}</small>
                  </div>

                  <div className="dropdown-divider" />

                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/profilepage")}
                  >
                    Profile
                  </button>

                  <button
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>

                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
