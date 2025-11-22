import React from 'react';

export default function Sidebar({ activeView, setActiveView }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'properties', label: 'Properties', icon: '🏠' },
    { id: 'clients', label: 'Clients', icon: '👥' },
    { id: 'leads', label: 'Leads', icon: '🎯' },
    { id: 'transactions', label: 'Transactions', icon: '💰' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">RealtyPro</h1>
        <p className="text-gray-400 text-sm">Property Management</p>
      </div>

      <nav className="space-y-2 mb-8">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeView === item.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mb-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-semibold mb-2">Quick Stats</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Active Listings</span>
            <span className="text-blue-400">24</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Sold This Month</span>
            <span className="text-green-400">8</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">New Leads</span>
            <span className="text-yellow-400">15</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total Revenue</span>
            <span className="text-purple-400">$2.4M</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="font-semibold mb-3">Recent Activity</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-gray-300">Property sold: $450K</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-gray-300">New listing added</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span className="text-gray-300">Client meeting scheduled</span>
          </div>
        </div>
      </div>
    </div>
  );
}