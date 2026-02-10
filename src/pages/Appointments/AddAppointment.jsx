import React, { useState, useEffect } from 'react';
import api from '../../api';

export default function AddAppointment() {
  const [salons, setSalons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          <div className="salons-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {salons.length === 0 ? (
              <p className="col-span-full text-center text-gray-500">No salons found.</p>
            ) : (
              salons.map((salon) => (
                <div key={salon._id} className="salon-card bg-white shadow-lg rounded-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                  {salon.logo && (
                    <img
                      src={salon.logo}
                      alt={`${salon.name} logo`}
                      className="w-full h-32 object-cover rounded-md mb-4"
                    />
                  )}
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{salon.name}</h3>
                  <p className="text-gray-600 mb-1"><strong>Address:</strong> {salon.address}</p>
                  <p className="text-gray-600 mb-1"><strong>Contact:</strong> {salon.contact}</p>
                  {salon.email && <p className="text-gray-600 mb-1"><strong>Email:</strong> {salon.email}</p>}
                  <p className="text-gray-600 mb-1"><strong>Opening Time:</strong> {salon.openingTime || 'N/A'}</p>
                  <p className="text-gray-600 mb-1"><strong>Closing Time:</strong> {salon.closingTime || 'N/A'}</p>
                  <p className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    salon.status === 'open' ? 'bg-green-100 text-green-800' :
                    salon.status === 'closed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    Status: {salon.status}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
