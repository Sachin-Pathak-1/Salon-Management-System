import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

  const handleProfileMenuClick = (path) => {
    navigate(path);
    setShowProfileMenu(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Service Management System</span>
        </Link>

        {/* Center Navigation */}
        <div className="navbar-center">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/services" className="nav-link">Services</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          <Link to="/dashboard" className="nav-link">Dashboard</Link>
        </div>

        {/* Right Side - Auth Buttons */}
        <div className="navbar-right">
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
                  {currentUser?.avatar}
                </div>
                <span>{currentUser?.name || 'User'}</span>
                <span className="dropdown-arrow">▼</span>
              </button>

              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-user-info">
                      <div className="dropdown-avatar">
                        {currentUser?.avatar }
                      </div>
                      <div>
                        <p className="dropdown-name">{currentUser?.name}</p>
                        <p className="dropdown-email">{currentUser?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="dropdown-divider"></div>

                  <button
                    className="dropdown-item"
                    onClick={() => handleProfileMenuClick('/profile')}
                  >
                    <span className="dropdown-icon"></span>
                    View Profile
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => handleProfileMenuClick('/activity')}
                  >
                    <span className="dropdown-icon"></span>
                    My Activity
                  </button>

                  <button
                    className="dropdown-item"
                    onClick={() => handleProfileMenuClick('/history')}
                  >
                    <span className="dropdown-icon"></span>
                    History
                  </button>

                  <div className="dropdown-divider"></div>

                  <button
                    className="dropdown-item logout-item"
                    onClick={handleLogout}
                  >
                    <span className="dropdown-icon"></span>
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
