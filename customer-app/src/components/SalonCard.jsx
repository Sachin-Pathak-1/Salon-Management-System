import React from 'react';

const SalonCard = ({ salon }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <img
        src={salon.image || '/placeholder.jpg'}
        alt={salon.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-(--text)">
          {salon.name}
        </h3>
        <p className="text-sm text-(--gray-700)">
          {salon.location}
        </p>
        <div className="mt-2 flex items-center">
          <span className="text-yellow-500">★</span>
          <span className="ml-1 text-sm text-(--text)">{salon.rating}</span>
        </div>
        <div className="mt-4">
          <a
            href={salon.url || '#'}
            className="inline-block px-4 py-2 bg-(--primary) text-white rounded-md text-sm"
          >
            Explore
          </a>
        </div>
      </div>
    </div>
  );
};

export default SalonCard;
