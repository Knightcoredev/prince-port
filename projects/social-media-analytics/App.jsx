import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import EngagementChart from './components/EngagementChart';
import MetricsCard from './components/MetricsCard';

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <AnalyticsDashboard />;
      case 'analytics':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Detailed Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EngagementChart />
              <div className="space-y-4">
                <MetricsCard
                  title="Reach"
                  value="2.4M"
                  change={12.5}
                  icon="👁️"
                />
                <MetricsCard
                  title="Impressions"
                  value="5.8M"
                  change={8.3}
                  icon="📊"
                />
                <MetricsCard
                  title="Clicks"
                  value="45.2K"
                  change={-2.1}
                  icon="🖱️"
                />
              </div>
            </div>
          </div>
        );
      case 'engagement':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Engagement Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <MetricsCard title="Likes" value="125.4K" change={15.2} icon="❤️" />
              <MetricsCard title="Comments" value="8.7K" change={22.1} icon="💬" />
              <MetricsCard title="Shares" value="12.3K" change={-5.4} icon="🔄" />
              <MetricsCard title="Saves" value="6.8K" change={18.7} icon="🔖" />
            </div>
            <EngagementChart />
          </div>
        );
      case 'audience':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Audience Insights</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Demographics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>18-24 years</span>
                      <span>32%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '32%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>25-34 years</span>
                      <span>45%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>35-44 years</span>
                      <span>18%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '18%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>45+ years</span>
                      <span>5%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">Top Locations</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>United States</span>
                    <span className="text-gray-600">28%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>United Kingdom</span>
                    <span className="text-gray-600">15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Canada</span>
                    <span className="text-gray-600">12%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Australia</span>
                    <span className="text-gray-600">8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Germany</span>
                    <span className="text-gray-600">7%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'content':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Content Performance</h2>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <p className="text-gray-600">Content analysis coming soon...</p>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Reports</h2>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <p className="text-gray-600">Custom reports coming soon...</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <p className="text-gray-600">Settings panel coming soon...</p>
            </div>
          </div>
        );
      default:
        return <AnalyticsDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="flex-1">
        <Header />
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;