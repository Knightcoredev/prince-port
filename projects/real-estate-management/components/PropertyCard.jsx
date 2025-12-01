import React from 'react';

export default function PropertyCard({ property, compact = false }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'for sale': 
        return 'bg-green-100 text-green-800';
      case 'rented':
      case 'for rent': 
        return 'bg-blue-100 text-blue-800';
      case 'maintenance': 
        return 'bg-yellow-100 text-yellow-800';
      case 'sold': 
        return 'bg-gray-100 text-gray-800';
      default: 
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <img
          src={property.image || property.images?.[0] || 'https://via.placeholder.com/80x60?text=Property'}
          alt={property.title}
          className="w-16 h-12 object-cover rounded"
        />
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{property.title}</h4>
          <p className="text-sm text-gray-600">{property.address || property.location}</p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-blue-600">{formatPrice(property.price)}</p>
          <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(property.status)}`}>
            {property.status}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <div className="relative">
        <img
          src={property.image || property.images?.[0] || 'https://via.placeholder.com/400x300?text=Property+Image'}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
            {property.status.charAt(0).toUpperCase() + property.status.slice(1)}
          </span>
        </div>
        {property.type && (
          <div className="absolute top-3 left-3">
            <span className="px-2 py-1 bg-black bg-opacity-70 text-white rounded text-xs font-medium">
              {property.type}
            </span>
          </div>
        )}
        {property.featured && (
          <div className="absolute bottom-3 left-3">
            <span className="px-2 py-1 bg-yellow-500 text-white rounded text-xs font-medium">
              Featured
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
            {property.title}
          </h3>
          <div className="text-right ml-2">
            <p className="text-xl font-bold text-blue-600">
              {formatPrice(property.price)}
              {property.type === 'rent' && '/mo'}
            </p>
          </div>
        </div>

        <div className="flex items-center text-gray-600 text-sm mb-3">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="line-clamp-1">{property.address || property.location}</span>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z" />
              </svg>
              <span className="text-sm">{property.bedrooms} bed</span>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10v11M20 10v11" />
              </svg>
              <span className="text-sm">{property.bathrooms} bath</span>
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-gray-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
              <span className="text-sm">{property.sqft} sqft</span>
            </div>
          </div>
        </div>

        {property.description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {property.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {property.daysOnMarket && (
              <span className="text-xs text-gray-500">
                {property.daysOnMarket} days on market
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
              View Details
            </button>
            <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}