import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import '.././harshal.css'

export function ProfilePage({ currentUser, isLoggedIn }) {
  const navigate = useNavigate();

  if (!isLoggedIn) {
    navigate('/login');
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-banner"></div>
          <div className="profile-info-section">
            <div className="profile-avatar-large">
              {currentUser?.avatar || '👤'}
            </div>
            <div className="profile-details">
              <h1>{currentUser?.name}</h1>
              <p className="profile-email">{currentUser?.email}</p>
              <p className="profile-role">{currentUser?.role || 'Standard User'}</p>
              <p className="profile-joined">Joined {currentUser?.joinDate}</p>
            </div>
            <button className="edit-profile-btn">Edit Profile</button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {/* Left Sidebar */}
          <aside className="profile-sidebar">
            <nav className="profile-nav">
              <a href="#overview" className="nav-item active">Overview</a>
              <a href="#settings" className="nav-item">Settings</a>
              <a href="#privacy" className="nav-item">Privacy</a>
              <a href="#notifications" className="nav-item">Notifications</a>
              <a href="#security" className="nav-item">Security</a>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="profile-main">
            {/* Overview Section */}
            <section className="profile-section">
              <h2>Account Overview</h2>
              <div className="overview-cards">
                <div className="overview-card">
                  <div className="card-icon">📊</div>
                  <h3>Total Activities</h3>
                  <p className="card-value">1,234</p>
                </div>
                <div className="overview-card">
                  <div className="card-icon">⚡</div>
                  <h3>Active Services</h3>
                  <p className="card-value">12</p>
                </div>
                <div className="overview-card">
                  <div className="card-icon">✅</div>
                  <h3>Completed Tasks</h3>
                  <p className="card-value">890</p>
                </div>
                <div className="overview-card">
                  <div className="card-icon">🎯</div>
                  <h3>Success Rate</h3>
                  <p className="card-value">98%</p>
                </div>
              </div>
            </section>

            {/* Personal Information */}
            <section className="profile-section">
              <h2>Personal Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <label>Full Name</label>
                  <p>{currentUser?.name}</p>
                </div>
                <div className="info-item">
                  <label>Email Address</label>
                  <p>{currentUser?.email}</p>
                </div>
                <div className="info-item">
                  <label>Account Type</label>
                  <p>{currentUser?.role}</p>
                </div>
                <div className="info-item">
                  <label>Member Since</label>
                  <p>{currentUser?.joinDate}</p>
                </div>
                <div className="info-item">
                  <label>Phone Number</label>
                  <p>+1 (555) 123-4567</p>
                </div>
                <div className="info-item">
                  <label>Location</label>
                  <p>San Francisco, CA</p>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="profile-section">
              <h2>Recent Activity</h2>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon">✅</div>
                  <div className="activity-content">
                    <p className="activity-title">Service Completed</p>
                    <p className="activity-time">2 hours ago</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">📝</div>
                  <div className="activity-content">
                    <p className="activity-title">Created New Service</p>
                    <p className="activity-time">1 day ago</p>
                  </div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon">🔄</div>
                  <div className="activity-content">
                    <p className="activity-title">Updated Profile</p>
                    <p className="activity-time">3 days ago</p>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
