import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

export default function AddAppointment() {
  const navigate = useNavigate();
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const response = await api.get('/salons/get');
        setSalons(response.data);
      } catch (err) {
        setError('Failed to load salons');
        console.error('Error loading salons:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalons();
  }, []);

  const handleSalonClick = (salon) => {
    setActionError(null);

    if (salon.status !== "open") {
      setActionError("This salon is currently unavailable for booking.");
      return;
    }

    navigate(`/create-appointment/${salon._id}`);
  };

  if (loading) return <div>Loading salons...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-layout">
      <main className="admin-main-content">
        <div className="admin-header">
          <h1>Add Appointment</h1>
          <p>Select a salon to add an appointment</p>
        </div>

        <div className="admin-content">

          {actionError && (
            <div style={{ color: "red", marginBottom: "10px" }}>
              {actionError}
            </div>
          )}

          <div className="salons-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salons.length === 0 ? (
              <p className="col-span-full text-center opacity-70">
                No salons found.
              </p>
            ) : (
              salons.map((salon) => {
                const isUnavailable = salon.status !== "open";

                return (
                  <div
                    key={salon._id}
                    className={`salon-card border rounded-2xl p-5 shadow-[var(--card-shadow)] transition-shadow duration-300
                      ${isUnavailable
                        ? "opacity-60 cursor-not-allowed"
                        : "hover:shadow-[var(--card-shadow-lg)] cursor-pointer"
                      }`}
                    style={{ backgroundColor: 'var(--gray-100)', borderColor: 'var(--border-light)' }}
                    onClick={() => handleSalonClick(salon)}
                  >
                    {salon.logo && (
                      <img
                        src={salon.logo}
                        alt={`${salon.name} logo`}
                        className="w-full h-32 object-cover rounded-xl mb-4"
                      />
                    )}

                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>
                        {salon.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${salon.status === "open"
                            ? "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/30"
                            : salon.status === "closed"
                              ? "bg-[var(--danger)]/15 text-[var(--danger)] border-[var(--danger)]/30"
                              : "bg-[var(--accent)]/15 text-[var(--accent)] border-[var(--accent)]/30"
                          }`}
                      >
                        {salon.status}
                      </span>
                    </div>

                    <div className="text-sm opacity-80 space-y-1" style={{ color: 'var(--text)' }}>
                      <p><span className="font-semibold">Address:</span> {salon.address}</p>
                      <p><span className="font-semibold">Contact:</span> {salon.contact}</p>
                      {salon.email && <p><span className="font-semibold">Email:</span> {salon.email}</p>}
                      <p>
                        <span className="font-semibold">Hours:</span>{" "}
                        {salon.openingTime || "N/A"} - {salon.closingTime || "N/A"}
                      </p>
                    </div>

                    <div className="mt-4 text-center">
                      <button
                        className="btn-primary px-4 py-2 rounded-md transition-colors duration-300"
                        disabled={isUnavailable}
                      >
                        {isUnavailable ? "Unavailable" : "Select Salon"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
