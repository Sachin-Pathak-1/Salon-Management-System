import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

export function Navbar({
  isLoggedIn,
  setIsLoggedIn,
  currentUser,
  setCurrentUser
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
  );

  const navigate = useNavigate();
  const isAdmin = currentUser?.role === "admin";
  const dashboardLink = isAdmin ? "/dashboard" : "/staff-dashboard";

  /* THEME */
  const applyTheme = (t) => {
    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
    setTheme(t);
  };

  useEffect(() => {
    applyTheme(theme);
    // eslint-disable-next-line
  }, []);

  /* LOGOUT */
  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.clear();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* LOGO */}
        <Link to="/" className="navbar-logo">
          Blissful Beauty Salon
        </Link>

        {/* CENTER NAV */}
        <div className="navbar-center">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/lpservices" className="nav-link">Services</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>

          {isLoggedIn && (
            <Link to={dashboardLink} className="nav-link">
              Dashboard
            </Link>
          )}
        </div>

        {/* RIGHT */}
        <div className="navbar-right">

          {/* THEME */}
          <button
            className="theme-toggle-btn"
            onClick={() => applyTheme(theme === "light" ? "dark" : "light")}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

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
