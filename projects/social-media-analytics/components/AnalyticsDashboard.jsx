import React, { useState } from 'react';
import EngagementChart from './EngagementChart';
import MetricsCard from './MetricsCard';

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter', 'instagram', 'facebook']);

  const mockAnalytics = {
    totalFollowers: 125400,
    engagementRate: 8.7,
    totalPosts: 156,
    totalReach: 2400000,
    topPosts: [
      {
        content: "Just launched our new product! 🚀 What do you think?",
        platform: "Twitter",
        date: "2 hours ago",
        engagement: 1250,
        reach: 15600
      },
      {
        content: "Behind the scenes of our latest campaign",
        platform: "Instagram",
        date: "1 day ago",
        engagement: 2100,
        reach: 28400
      },
      {
        content: "Tips for better social media engagement",
        platform: "Facebook",
        date: "2 days ago",
        engagement: 890,
        reach: 12300
      }
    ]
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        
        <div className="flex gap-4">
          {/* Time Range Selector */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="1d">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>

          {/* Platform Filter */}
          <div className="flex gap-2">
            {['twitter', 'instagram', 'facebook'].map((platform) => (
              <button
                key={platform}
                onClick={() => {
                  if (selectedPlatforms.includes(platform)) {
                    setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
                  } else {
                    setSelectedPlatforms([...selectedPlatforms, platform]);
                  }
                }}
                className={`px-4 py-2 rounded-lg capitalize ${
                  selectedPlatforms.includes(platform)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {platform}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricsCard
          title="Total Followers"
          value={mockAnalytics.totalFollowers.toLocaleString()}
          change="+12%"
          changeType="positive"
          icon="👥"
        />
        
        <MetricsCard
          title="Engagement Rate"
          value={`${mockAnalytics.engagementRate}%`}
          change="+5.2%"
          changeType="positive"
          icon="💬"
        />
        
        <MetricsCard
          title="Total Posts"
          value={mockAnalytics.totalPosts.toString()}
          change="+8 new"
          changeType="neutral"
          icon="📝"
        />
        
        <MetricsCard
          title="Reach"
          value={mockAnalytics.totalReach.toLocaleString()}
          change="+18%"
          changeType="positive"
          icon="📊"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trends */}
        <EngagementChart />

        {/* Platform Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Platform Distribution</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Twitter</span>
              </div>
              <span className="font-medium">35%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-pink-500 rounded"></div>
                <span>Instagram</span>
              </div>
              <span className="font-medium">40%</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-600 rounded"></div>
                <span>Facebook</span>
              </div>
              <span className="font-medium">25%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Posts */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Top Performing Posts</h3>
        <div className="space-y-4">
          {mockAnalytics.topPosts.map((post, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{post.content}</p>
                <p className="text-sm text-gray-500">{post.platform} • {post.date}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{post.engagement.toLocaleString()} engagements</p>
                <p className="text-sm text-gray-500">{post.reach.toLocaleString()} reach</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}