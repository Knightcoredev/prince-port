import React from 'react';

export default function Sidebar({ activeView, setActiveView }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'engagement', label: 'Engagement', icon: '💬' },
    { id: 'audience', label: 'Audience', icon: '👥' },
    { id: 'content', label: 'Content', icon: '📝' },
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const socialAccounts = [
    { platform: 'Instagram', followers: '12.5K', status: 'connected', color: 'bg-pink-500' },
    { platform: 'Twitter', followers: '8.2K', status: 'connected', color: 'bg-blue-500' },
    { platform: 'Facebook', followers: '15.8K', status: 'connected', color: 'bg-blue-600' },
    { platform: 'LinkedIn', followers: '3.4K', status: 'disconnected', color: 'bg-blue-700' },
  ];

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">SocialInsight</h1>
        <p className="text-gray-400 text-sm">Analytics Dashboard</p>
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

      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Connected Accounts
        </h3>
        <div className="space-y-3">
          {socialAccounts.map((account, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${account.color}`}></div>
                <div>
                  <p className="text-sm font-medium">{account.platform}</p>
                  <p className="text-xs text-gray-400">{account.followers} followers</p>
                </div>
              </div>
              <div className={`w-2 h-2 rounded-full ${
                account.status === 'connected' ? 'bg-green-400' : 'bg-red-400'
              }`}></div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="font-semibold mb-2">This Month</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Total Reach</span>
            <span className="text-blue-400">2.4M</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Engagement</span>
            <span className="text-green-400">8.7%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">New Followers</span>
            <span className="text-purple-400">+1.2K</span>
          </div>
        </div>
      </div>
    </div>
  );
}