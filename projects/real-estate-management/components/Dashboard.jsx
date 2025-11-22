import React from 'react';
import PropertyCard from './PropertyCard';

export default function Dashboard() {
  const stats = [
    { title: 'Total Properties', value: '156', change: '+12', color: 'blue', icon: '🏠' },
    { title: 'Active Listings', value: '24', change: '+3', color: 'green', icon: '📋' },
    { title: 'Sold This Month', value: '8', change: '+2', color: 'purple', icon: '💰' },
    { title: 'Total Revenue', value: '$2.4M', change: '+15%', color: 'yellow', icon: '📈' },
  ];

  const recentProperties = [
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
      daysOnMarket: 15
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
      daysOnMarket: 8
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
      daysOnMarket: 32
    }
  ];

  const recentActivity = [
    { id: 1, action: 'Property sold', property: 'Suburban Family Home', amount: '$650,000', time: '2 hours ago' },
    { id: 2, action: 'New listing', property: 'Modern Downtown Condo', amount: '$450,000', time: '1 day ago' },
    { id: 3, action: 'Price updated', property: 'Luxury Penthouse', amount: '$1,200,000', time: '2 days ago' },
    { id: 4, action: 'Showing scheduled', property: 'Garden View Apartment', amount: 'Tomorrow 2PM', time: '3 days ago' },
  ];

  const upcomingTasks = [
    { id: 1, task: 'Property inspection', property: 'Modern Downtown Condo', time: 'Today 2:00 PM' },
    { id: 2, task: 'Client meeting', property: 'Luxury Penthouse', time: 'Tomorrow 10:00 AM' },
    { id: 3, task: 'Photo shoot', property: 'Suburban Family Home', time: 'Friday 9:00 AM' },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's your property management overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-green-600 font-medium">{stat.change}</p>
              </div>
              <div className="text-3xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Properties */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Properties</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentProperties.map((property) => (
                <PropertyCard key={property.id} property={property} compact={true} />
              ))}
            </div>
          </div>
        </div>

        {/* Activity & Tasks */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{activity.action}:</span> {activity.property}
                      </p>
                      <p className="text-sm text-gray-600">{activity.amount}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Tasks</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{task.task}</p>
                      <p className="text-sm text-gray-600">{task.property}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{task.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}