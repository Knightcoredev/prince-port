import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import Analytics from '../../components/admin/Analytics';

export default function AnalyticsPage({ user }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async (range = dateRange) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/analytics?range=${range}`);
      const result = await response.json();
      
      if (result.success) {
        setAnalytics(result.data);
      } else {
        setError(result.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
    fetchAnalytics(newRange);
  };

  const exportData = () => {
    if (!analytics) return;
    
    const data = {
      exportDate: new Date().toISOString(),
      dateRange,
      summary: {
        totalBlogPosts: analytics.totalBlogPosts,
        totalProjects: analytics.totalProjects,
        totalContacts: analytics.totalContacts,
        unreadContacts: analytics.unreadContacts
      },
      monthlyStats: analytics.monthlyStats,
      popularPosts: analytics.popularPosts,
      recentActivity: analytics.recentActivity
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout title="Analytics & Reporting" user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics & Reporting</h1>
            <p className="text-gray-600 mt-1">
              Detailed insights into your portfolio performance and user engagement.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => fetchAnalytics(dateRange)}
              disabled={loading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            <button
              onClick={exportData}
              disabled={!analytics || loading}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Data
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error loading analytics data</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={() => fetchAnalytics(dateRange)}
                  className="mt-2 text-sm text-red-800 underline hover:text-red-900"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !analytics && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading analytics data...</span>
            </div>
          </div>
        )}

        {/* Analytics Component */}
        {!loading && analytics && (
          <Analytics 
            analytics={analytics} 
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        )}

        {/* Additional Insights */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Content Engagement</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics.totalBlogPosts > 0 ? 'Active' : 'Getting Started'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Contact Response Rate</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics.unreadContacts === 0 ? '100%' : 
                     `${Math.round(((analytics.totalContacts - analytics.unreadContacts) / analytics.totalContacts) * 100)}%`}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Portfolio Completeness</span>
                  <span className="text-sm font-medium text-gray-900">
                    {analytics.totalProjects > 0 ? 'Complete' : 'In Progress'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
              <div className="space-y-3">
                {analytics.totalBlogPosts === 0 && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-600">
                      Start publishing blog posts to increase engagement and showcase your expertise.
                    </p>
                  </div>
                )}
                {analytics.unreadContacts > 0 && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-600">
                      You have {analytics.unreadContacts} unread message{analytics.unreadContacts > 1 ? 's' : ''} that need attention.
                    </p>
                  </div>
                )}
                {analytics.totalProjects < 3 && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-600">
                      Add more projects to your portfolio to better showcase your skills and experience.
                    </p>
                  </div>
                )}
                {analytics.popularPosts.length === 0 && analytics.totalBlogPosts > 0 && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-600">
                      Promote your blog posts on social media to increase readership.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}