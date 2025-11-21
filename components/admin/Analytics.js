import { useState, useEffect } from 'react';

export default function Analytics({ analytics, dateRange, onDateRangeChange }) {
  const [selectedMetric, setSelectedMetric] = useState('overview');

  if (!analytics) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const metrics = [
    { id: 'overview', name: 'Overview', icon: 'chart' },
    { id: 'content', name: 'Content', icon: 'document' },
    { id: 'engagement', name: 'Engagement', icon: 'users' },
  ];

  const getIcon = (iconName) => {
    const icons = {
      chart: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      document: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      users: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    };
    return icons[iconName] || null;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Monthly Trends Chart */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Monthly Trends</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-end space-x-2 h-32">
            {analytics.monthlyStats.map((stat, index) => {
              const maxValue = Math.max(...analytics.monthlyStats.map(s => s.contacts + s.blogPosts));
              const height = ((stat.contacts + stat.blogPosts) / maxValue) * 100;
              
              return (
                <div key={stat.month} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center space-y-1">
                    {/* Blog posts bar */}
                    <div 
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${(stat.blogPosts / maxValue) * 100}px` }}
                      title={`${stat.blogPosts} blog posts`}
                    ></div>
                    {/* Contacts bar */}
                    <div 
                      className="w-full bg-green-500 rounded-b"
                      style={{ height: `${(stat.contacts / maxValue) * 100}px` }}
                      title={`${stat.contacts} contacts`}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-center">
                    {stat.month}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
              <span>Blog Posts</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
              <span>Contacts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-900">Total Views</p>
              <p className="text-lg font-semibold text-blue-900">
                {analytics.monthlyStats.reduce((sum, stat) => sum + stat.views, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-900">Conversion Rate</p>
              <p className="text-lg font-semibold text-green-900">
                {analytics.totalContacts > 0 ? 
                  ((analytics.totalContacts / analytics.monthlyStats.reduce((sum, stat) => sum + stat.views, 0)) * 100).toFixed(1) + '%' : 
                  '0%'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-orange-900">Avg. Response Time</p>
              <p className="text-lg font-semibold text-orange-900">2.4 hrs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => (
    <div className="space-y-6">
      {/* Content Performance */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Content Performance</h4>
        <div className="space-y-3">
          {analytics.popularPosts.map((post, index) => (
            <div key={post.slug} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{post.title}</p>
                <p className="text-xs text-gray-500">{post.readingTime} min read</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{post.views}</p>
                <p className="text-xs text-gray-500">views</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-900">Published Posts</h5>
          <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.totalBlogPosts}</p>
          <p className="text-xs text-gray-500 mt-1">
            +{analytics.monthlyStats[analytics.monthlyStats.length - 1]?.blogPosts || 0} this month
          </p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-900">Total Projects</h5>
          <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.totalProjects}</p>
          <p className="text-xs text-gray-500 mt-1">Portfolio showcase</p>
        </div>
      </div>
    </div>
  );

  const renderEngagement = () => (
    <div className="space-y-6">
      {/* Contact Form Analytics */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Contact Form Analytics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-900">Total Submissions</h5>
            <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.totalContacts}</p>
            <p className="text-xs text-green-600 mt-1">
              +{analytics.recentContacts} in last 30 days
            </p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-900">Unread Messages</h5>
            <p className="text-2xl font-bold text-gray-900 mt-1">{analytics.unreadContacts}</p>
            <p className="text-xs text-orange-600 mt-1">Requires attention</p>
          </div>
        </div>
      </div>

      {/* Monthly Contact Trends */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Monthly Contact Trends</h4>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-end space-x-2 h-24">
            {analytics.monthlyStats.map((stat) => {
              const maxContacts = Math.max(...analytics.monthlyStats.map(s => s.contacts));
              const height = maxContacts > 0 ? (stat.contacts / maxContacts) * 80 : 0;
              
              return (
                <div key={stat.month} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${height}px` }}
                    title={`${stat.contacts} contacts in ${stat.month}`}
                  ></div>
                  <span className="text-xs text-gray-600 mt-2 transform -rotate-45">
                    {stat.month.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header with Date Range Selector */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Analytics & Reporting</h3>
          <div className="flex items-center space-x-4">
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="6m">Last 6 months</option>
            </select>
          </div>
        </div>

        {/* Metric Tabs */}
        <div className="mt-4">
          <nav className="flex space-x-8">
            {metrics.map((metric) => (
              <button
                key={metric.id}
                onClick={() => setSelectedMetric(metric.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedMetric === metric.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {getIcon(metric.icon)}
                <span>{metric.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {selectedMetric === 'overview' && renderOverview()}
        {selectedMetric === 'content' && renderContent()}
        {selectedMetric === 'engagement' && renderEngagement()}
      </div>
    </div>
  );
}