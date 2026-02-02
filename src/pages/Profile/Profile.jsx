
import InfoRow from "../../components/InfoRow";
import "./Profile.css";

const Profile = ({ currentUser }) => {
  const user = currentUser || {
    name: "Ananya Patel",
    email: "ananyapatel@gmail.com",
    role: "Standard User",
    joinDate: "Feb 2022",
    phone: "+91 85412 36524",
    location: "Mumbai, India",
  };
  const initials = (user.name || "").split(" ").map(n => n[0] || "").slice(0,2).join("").toUpperCase();

  return (
    <div className="profile-layout">

      <main className="profile-main-pane">
        <header className="profile-header">
          <div className="profile-banner" aria-hidden></div>
          <div className="profile-header-inner">
            <div className="avatar-large" aria-hidden>
              {initials}
            </div>
            <div className="profile-meta">
              <h1 className="profile-name">{user.name}</h1>
              <div className="profile-sub">{user.email} • <span className="profile-role">{user.role}</span></div>
              <div className="profile-joined">Member since {user.joinDate}</div>
            </div>
            <div className="profile-actions">
              <button className="btn-edit">Edit Profile</button>
            </div>
          </div>
        </header>

        <section className="profile-grid">
          <aside className="profile-side">
            <nav className="side-nav">
              <a className="side-link active" href="#overview">Overview</a>
              <a className="side-link" href="#personal">Personal</a>
              <a className="side-link" href="#activity">Activity</a>
              <a className="side-link" href="#settings">Settings</a>
            </nav>
          </aside>

          <section className="profile-content-area">
            <div id="overview" className="card overview-card">
              <h2 className="card-title">Account Overview</h2>
              <div className="cards-row">
                <div className="small-card">
                  <div className="small-icon">📊</div>
                  <div className="small-meta">Total Activities</div>
                  <div className="small-value">1,234</div>
                </div>
                <div className="small-card">
                  <div className="small-icon">⚡</div>
                  <div className="small-meta">Active Services</div>
                  <div className="small-value">12</div>
                </div>
                <div className="small-card">
                  <div className="small-icon">✅</div>
                  <div className="small-meta">Completed</div>
                  <div className="small-value">890</div>
                </div>
              </div>
            </div>

            <div id="personal" className="card personal-card">
              <h2 className="card-title">Personal Information</h2>
              <div className="info-list">
                <InfoRow label="Full name" value={user.name} />
                <InfoRow label="Email" value={user.email} />
                <InfoRow label="Phone" value={user.phone} />
                <InfoRow label="Location" value={user.location} />
                <InfoRow label="Account type" value={user.role} />
                <InfoRow label="Member since" value={user.joinDate} />
              </div>
            </div>

            <div id="activity" className="card activity-card">
              <h2 className="card-title">Recent Activity</h2>
              <ul className="activity-list">
                <li className="activity-row"><span className="act-icon">✅</span><div><div className="act-title">Service Completed</div><div className="act-time">2 hours ago</div></div></li>
                <li className="activity-row"><span className="act-icon">📝</span><div><div className="act-title">Created New Service</div><div className="act-time">1 day ago</div></div></li>
                <li className="activity-row"><span className="act-icon">🔄</span><div><div className="act-title">Updated Profile</div><div className="act-time">3 days ago</div></div></li>
              </ul>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
};

export default Profile;
