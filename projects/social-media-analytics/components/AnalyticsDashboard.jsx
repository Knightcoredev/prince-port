import { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedPlatforms, setSelectedPlatforms] = useState(['twitter', 'instagram', 'facebook']);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, selectedPlatforms]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?timeRange=${timeRange}&platforms=${selectedPlatforms.join(',')}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const engagementData = {
    labels: analytics?.engagement?.labels || [],
    datasets: [
      {
        label: 'Likes',
        data: analytics?.engagement?.likes || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Comments',
        data: analytics?.engagement?.comments || [],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Shares',
        data: analytics?.engagement?.shares || [],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const platformData = {
    labels: ['Twitter', 'Instagram', 'Facebook'],
    datasets: [
      {
        data: analytics?.platformDistribution || [0, 0, 0],
        backgroundColor: [
          'rgba(29, 161, 242, 0.8)',
          'rgba(225, 48, 108, 0.8)',
          'rgba(24, 119, 242, 0.8)',
        ],
        borderColor: [
          'rgba(29, 161, 242, 1)',
          'rgba(225, 48, 108, 1)',
          'rgba(24, 119, 242, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const sentimentData = {
    labels: analytics?.sentiment?.labels || [],
    datasets: [
      {
        label: 'Positive',
        data: analytics?.sentiment?.positive || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
      {
        label: 'Neutral',
        data: analytics?.sentiment?.neutral || [],
        backgroundColor: 'rgba(107, 114, 128, 0.8)',
      },
      {
        label: 'Negative',
        data: analytics?.sentiment?.negative || [],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Followers</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics?.totalFollowers?.toLocaleString() || '0'}</p>
          <p className="text-sm text-green-600">+12% from last period</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Engagement Rate</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics?.engagementRate || '0'}%</p>
          <p className="text-sm text-green-600">+5.2% from last period</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Total Posts</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics?.totalPosts || '0'}</p>
          <p className="text-sm text-blue-600">+8 new posts</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500">Reach</h3>
          <p className="text-3xl font-bold text-gray-900">{analytics?.totalReach?.toLocaleString() || '0'}</p>
          <p className="text-sm text-green-600">+18% from last period</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Trends */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Engagement Trends</h3>
          <Line data={engagementData} options={chartOptions} />
        </div>

        {/* Platform Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Platform Distribution</h3>
          <Doughnut data={platformData} />
        </div>

        {/* Sentiment Analysis */}
        <div className="bg-white p-6 rounded-lg shadow-md lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Sentiment Analysis</h3>
          <Bar data={sentimentData} options={chartOptions} />
        </div>
      </div>

      {/* Top Posts */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Top Performing Posts</h3>
        <div className="space-y-4">
          {analytics?.topPosts?.map((post, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <p className="font-medium">{post.content}</p>
                <p className="text-sm text-gray-500">{post.platform} • {post.date}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{post.engagement} engagements</p>
                <p className="text-sm text-gray-500">{post.reach} reach</p>
              </div>
            </div>
          )) || (
            <p className="text-gray-500 text-center py-8">No posts data available</p>
          )}
        </div>
      </div>
    </div>
  );
}