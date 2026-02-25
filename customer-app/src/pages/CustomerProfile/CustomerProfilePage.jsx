import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import { allExperiences } from "../Beauty/beautyData";
import { RatingStars } from "../Beauty/beautyUi";

export function CustomerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [profile, setProfile] = useState({ name: "", email: "", contact: "", address: "" });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const profileRes = await api.get("/auth/customer/me");
        setProfile({
          name: profileRes.data?.name || "",
          email: profileRes.data?.email || "",
          contact: profileRes.data?.contact || "",
          address: profileRes.data?.address || ""
        });
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load profile");
      }

      try {
        const appointmentsRes = await api.get("/appointments/customer/my");
        setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
      } catch {
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const bookingHistory = useMemo(() => appointments.slice(0, 5), [appointments]);
  const saved = useMemo(() => allExperiences.slice(0, 4), []);
  const wallet = useMemo(() => ({ balance: 1250, rewards: 420, tier: "Gold" }), []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await api.put("/auth/customer/profile", {
        name: profile.name,
        contact: profile.contact,
        address: profile.address
      });

      const updatedUser = {
        ...(JSON.parse(localStorage.getItem("currentUser") || "{}")),
        name: res.data?.name || profile.name,
        contact: res.data?.contact || profile.contact,
        address: res.data?.address || profile.address,
        role: "customer"
      };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      setSuccess("Profile updated successfully");
      setEditMode(false);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="beauty-shell">
        <div className="beauty-container">
          <div className="beauty-panel"><div className="beauty-panel-body">Loading profile...</div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="beauty-shell">
      <div className="beauty-container">
        <section className="beauty-hero">
          <h1>Customer Profile</h1>
          <p>Manage your profile, track bookings, and use rewards for premium experiences.</p>
        </section>

        {error ? <div className="beauty-empty" style={{ borderStyle: "solid", borderColor: "#d18e86" }}>{error}</div> : null}
        {success ? <div className="beauty-empty" style={{ borderStyle: "solid", borderColor: "#8ac4a1" }}>{success}</div> : null}

        <div className="beauty-detail-grid">
          <div>
            <article className="beauty-panel">
              <div className="beauty-panel-body">
                <div className="beauty-row">
                  <h2 style={{ margin: 0 }}>Profile Info</h2>
                  <button type="button" className="beauty-btn beauty-btn-light" onClick={() => setEditMode((v) => !v)}>{editMode ? "Cancel" : "Edit Profile"}</button>
                </div>

                <form onSubmit={handleSave} style={{ display: "grid", gap: 10, marginTop: 12 }}>
                  <input className="beauty-input" value={profile.name} disabled={!editMode} onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))} placeholder="Name" />
                  <input className="beauty-input" value={profile.email} disabled placeholder="Email" />
                  <input className="beauty-input" value={profile.contact} disabled={!editMode} onChange={(e) => setProfile((prev) => ({ ...prev, contact: e.target.value }))} placeholder="Contact" />
                  <input className="beauty-input" value={profile.address} disabled={!editMode} onChange={(e) => setProfile((prev) => ({ ...prev, address: e.target.value }))} placeholder="Address" />
                  {editMode ? <button type="submit" className="beauty-btn beauty-btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button> : null}
                </form>
              </div>
            </article>

            <article className="beauty-panel" style={{ marginTop: 16 }}>
              <div className="beauty-panel-body">
                <h2 style={{ marginTop: 0 }}>Booking History</h2>
                {bookingHistory.length === 0 ? (
                  <p className="beauty-muted">No bookings yet.</p>
                ) : (
                  <div style={{ display: "grid", gap: 8 }}>
                    {bookingHistory.map((appointment) => (
                      <div key={appointment._id} className="beauty-service">
                        <div>
                          <strong>{appointment?.serviceId?.name || "Service"}</strong>
                          <p className="beauty-muted" style={{ margin: "4px 0 0" }}>
                            {appointment?.date ? new Date(appointment.date).toLocaleDateString() : "Date pending"} • {appointment?.time || "Time pending"}
                          </p>
                        </div>
                        <span className="beauty-tag">{appointment?.status || "pending"}</span>
                      </div>
                    ))}
                  </div>
                )}
                <Link to="/customer/appointments/new" className="beauty-btn beauty-btn-primary" style={{ marginTop: 12, display: "inline-block", textDecoration: "none" }}>
                  Book New Appointment
                </Link>
              </div>
            </article>

            <article className="beauty-panel" style={{ marginTop: 16 }}>
              <div className="beauty-panel-body">
                <h2 style={{ marginTop: 0 }}>Saved Salons & Spas</h2>
                <div className="beauty-grid" style={{ marginTop: 8 }}>
                  {saved.map((item) => (
                    <Link key={item.id} to={`/experiences/${item.type}/${item.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                      <article className="beauty-card">
                        <img className="beauty-thumb" src={item.images[0]} alt={item.name} />
                        <div className="beauty-card-body">
                          <h3 className="beauty-title">{item.name}</h3>
                          <RatingStars value={item.rating} />
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            </article>
          </div>

          <aside className="beauty-panel beauty-sticky">
            <div className="beauty-panel-body">
              <h3 style={{ marginTop: 0 }}>Wallet & Rewards</h3>
              <div className="beauty-service" style={{ marginBottom: 10 }}>
                <div>
                  <p className="beauty-muted" style={{ margin: 0 }}>Wallet Balance</p>
                  <strong>INR {wallet.balance}</strong>
                </div>
              </div>
              <div className="beauty-service" style={{ marginBottom: 10 }}>
                <div>
                  <p className="beauty-muted" style={{ margin: 0 }}>Reward Points</p>
                  <strong>{wallet.rewards} pts</strong>
                </div>
              </div>
              <div className="beauty-service">
                <div>
                  <p className="beauty-muted" style={{ margin: 0 }}>Membership Tier</p>
                  <strong>{wallet.tier}</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}


