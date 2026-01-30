import Sidebar from "../../components/Sidebar";
import InfoRow from "../../components/InfoRow";
import "./Profile.css";

const Profile = () => {
  return (
    <div className="profile-layout">
      {/* LEFT SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="profile-content">
        <div className="content-bg"></div>
        <div className="content-wrapper">

          {/* PAGE HEADER */}
          <div className="page-header">
            <h2>Personal Information</h2>
          </div>

          {/* TWO COLUMN LAYOUT */}
          <div className="two-column">

            {/* LEFT COLUMN - BASICS */}
            <div className="section">
              <h4 className="section-title">BASICS</h4>
              <div className="card">
                <InfoRow label="Full Name" value="Ananya Patel" />
                <InfoRow label="Display Name" value="Ananya" />
                <InfoRow label="Email" value="ananyapatel@gmail.com" locked />
                <InfoRow label="Phone Number" value="85412 36524" />
                <InfoRow label="Date of Birth" value="29 Feb, 2005" />
                <InfoRow
                  label="Address"
                  value="B-402, Green Heights
Andheri East, Mumbai
Maharashtra, India"
                />
              </div>
            </div>

            {/* RIGHT COLUMN - PREFERENCES */}
            <div className="section">
              <h4 className="section-title">PREFERENCES</h4>
              <div className="card">
                <InfoRow label="Language" value="English (India)" />
                <InfoRow label="Date Format" value="MM, DD, YYYY" />
                <InfoRow label="Timezone" value="India (GMT+5:30)" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
