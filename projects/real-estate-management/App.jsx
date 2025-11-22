import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PropertyCard from './components/PropertyCard';

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const properties = [
    {
      id: 1,
      title: 'Modern Downtown Condo',
      price: 450000,
      location: 'Downtown, City Center',
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1200,
      status: 'For Sale',
      image: 'https://via.placeholder.com/300x200?text=Modern+Condo',
      daysOnMarket: 15,
      description: 'Beautiful modern condo in the heart of downtown with stunning city views.',
      features: ['Balcony', 'Parking', 'Gym', 'Concierge']
    },
    {
      id: 2,
      title: 'Suburban Family Home',
      price: 650000,
      location: 'Westside, Maple Street',
      bedrooms: 4,
      bathrooms: 3,
      sqft: 2400,
      status: 'Sold',
      image: 'https://via.placeholder.com/300x200?text=Family+Home',
      daysOnMarket: 8,
      description: 'Spacious family home with large backyard and modern amenities.',
      features: ['Garden', 'Garage', 'Fireplace', 'Updated Kitchen']
    },
    {
      id: 3,
      title: 'Luxury Penthouse',
      price: 1200000,
      location: 'Uptown, Sky Tower',
      bedrooms: 3,
      bathrooms: 3,
      sqft: 1800,
      status: 'For Sale',
      image: 'https://via.placeholder.com/300x200?text=Luxury+Penthouse',
      daysOnMarket: 32,
      description: 'Exclusive penthouse with panoramic city views and premium finishes.',
      features: ['Terrace', 'Wine Cellar', 'Smart Home', 'Valet Parking']
    },
    {
      id: 4,
      title: 'Cozy Studio Apartment',
      price: 280000,
      location: 'Midtown, Arts District',
      bedrooms: 1,
      bathrooms: 1,
      sqft: 650,
      status: 'For Rent',
      image: 'https://via.placeholder.com/300x200?text=Studio+Apartment',
      daysOnMarket: 5,
      description: 'Charming studio in the vibrant arts district, perfect for young professionals.',
      features: ['Exposed Brick', 'High Ceilings', 'Laundry', 'Pet Friendly']
    }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'properties':
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Add New Property
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        );
      case 'clients':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Clients</h1>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">JD</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">John Doe</h3>
                      <p className="text-sm text-gray-600">john.doe@email.com</p>
                      <p className="text-sm text-gray-600">Looking for: 3BR House</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">JS</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Jane Smith</h3>
                      <p className="text-sm text-gray-600">jane.smith@email.com</p>
                      <p className="text-sm text-gray-600">Looking for: Downtown Condo</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      Prospect
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'leads':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Leads</h1>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <p className="text-gray-600">Lead management system coming soon...</p>
            </div>
          </div>
        );
      case 'transactions':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Transactions</h1>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Suburban Family Home</h3>
                    <p className="text-sm text-gray-600">Sold to: Johnson Family</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">$650,000</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Modern Downtown Condo</h3>
                    <p className="text-sm text-gray-600">Pending: Smith Contract</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-blue-600">$450,000</p>
                    <p className="text-sm text-gray-600">In Progress</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'calendar':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Calendar</h1>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <p className="text-gray-600">Calendar view coming soon...</p>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports</h1>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <p className="text-gray-600">Reports and analytics coming soon...</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <p className="text-gray-600">Settings panel coming soon...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">RealtyPro Dashboard</h1>
              <p className="text-gray-600">Manage your real estate portfolio</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h10V9H4v2zM4 7h12V5H4v2z" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">RP</span>
              </div>
            </div>
          </div>
        </header>
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;