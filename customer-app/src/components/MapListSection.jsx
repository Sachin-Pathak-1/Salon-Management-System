import React from 'react';
import SalonCard from './SalonCard';

const MapListSection = ({ salons }) => {
  const firstSalon = salons?.[0];
  const mapQuery = encodeURIComponent(
    firstSalon?.location
      ? `${firstSalon.name || 'Salon'} ${firstSalon.location}`
      : 'Mumbai salons'
  );
  const mapSrc = `https://www.google.com/maps?q=${mapQuery}&z=13&output=embed`;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-3xl font-bold mb-8 text-[var(--text)]">Nearby Salons & Spas</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-96 rounded-lg shadow-inner overflow-hidden bg-[var(--gray-200)]">
          <iframe
            title="Nearby salons map"
            src={mapSrc}
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        <div className="space-y-6 overflow-y-auto max-h-96">
          {salons.map((s) => (
            <SalonCard key={s.id} salon={s} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default MapListSection;
