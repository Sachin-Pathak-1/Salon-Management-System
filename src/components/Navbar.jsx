import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import './Navbar.css';

export function Navbar({ isLoggedIn, setIsLoggedIn, currentUser, setCurrentUser }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setShowProfileMenu(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🚀</span>
          ServiceHub
        </Link>

        {/* Nav Links */}
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          <li className="nav-item">
            <Link to="/services" className="nav-link">Services</Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-link">About</Link>
          </li>
          <li className="nav-item">
            <Link to="/contact" className="nav-link">Contact</Link>
          </li>
          <li className="nav-item">
            <Link to="/help" className="nav-link">Help</Link>
          </li>
        </ul>

        {/* Auth Section */}
        <div className="navbar-auth">
          {!isLoggedIn ? (
            <>
              <Link to="/login" className="nav-btn login-btn">
                Login
              </Link>
            </>
          ) : (
            <div className="profile-dropdown">
              <button
                className="profile-btn"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <span className="profile-avatar">👤</span>
                <span className="profile-name">{currentUser || 'User'}</span>
                <span className="dropdown-arrow">▼</span>
              </button>

              {showProfileMenu && (
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">
                    📋 Profile
                  </Link>
                  <Link to="/activity" className="dropdown-item">
                    📊 Activity
                  </Link>
                  <Link to="/history" className="dropdown-item">
                    📜 History
                  </Link>
                  <Link to="/customers" className="dropdown-item">
                    👥 Customers
                  </Link>
                  <Link to="/dashboard" className="dropdown-item">
                    📈 Dashboard
                  </Link>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item logout-btn" onClick={handleLogout}>
                    🚪 Logout
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
