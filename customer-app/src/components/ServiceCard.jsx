import React from 'react';

const ServiceCard = ({ service }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <img
        src={service.image || '/service-placeholder.jpg'}
        alt={service.name}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold text-(--text)">
          {service.name}
        </h3>
        <p className="text-(--gray-700) text-sm mt-2">
          {service.description}
        </p>
      </div>
    </div>
  );
};

export default ServiceCard;
