import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import withAuth from '../../../components/auth/withAuth';

function ContactSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'submittedAt',
    sortOrder: 'desc',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({});

  // Fetch submissions
  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters).toString();
      const response = await fetch(`/api/contact/submissions?${queryParams}`);
      const result = await response.json();

      if (result.success) {
        setSubmissions(result.data);
        setPagination(result.pagination);
        setStats(result.stats);
        setError(null);
      } else {
        setError(result.error?.message || 'Failed to fetch submissions');
      }
    } catch (err) {
      setError('Failed to fetch submissions');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update submission status
  const updateSubmissionStatus = async (id, status) => {
    try {
      const response = await fetch('/api/contact/submissions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setSubmissions(prev => 
          prev.map(submission => 
            submission.id === id ? { ...submission, status } : submission
          )
        );
        
        // Update stats
        fetchSubmissions();
      } else {
        alert(result.error?.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Failed to update status');
      console.error('Update error:', err);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value // Reset to page 1 when other filters change
    }));
  };

  // Handle search
  const handleSearch = (e) => {
    const value = e.target.value;
    handleFilterChange('search', value);
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'unread':
        return 'bg-red-100 text-red-800';
      case 'read':
        return 'bg-yellow-100 text-yellow-800';
      case 'responded':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [filters]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contact Submissions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and respond to contact form submissions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{stats.total || 0}</div>
            <div className="text-sm text-gray-600">Total Submissions</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-red-600">{stats.unread || 0}</div>
            <div className="text-sm text-gray-600">Unread</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-yellow-600">{stats.read || 0}</div>
            <div className="text-sm text-gray-600">Read</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{stats.responded || 0}</div>
            <div className="text-sm text-gray-600">Responded</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={handleSearch}
                placeholder="Search name, email, or message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
                <option value="responded">Responded</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white rounded-lg shadow-sm border">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading submissions...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchSubmissions}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-8 text-center text-gray-600">
              No submissions found matching your criteria.
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
                <div className="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="col-span-2">Name</div>
                  <div className="col-span-2">Email</div>
                  <div className="col-span-2">Subject</div>
                  <div className="col-span-3">Message</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-1">Date</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <div key={submission.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="grid grid-cols-12 gap-4 items-start">
                      <div className="col-span-2">
                        <div className="text-sm font-medium text-gray-900">
                          {submission.name}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-gray-600">
                          {submission.email}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-sm text-gray-600">
                          {submission.subject || 'No subject'}
                        </div>
                      </div>
                      <div className="col-span-3">
                        <div className="text-sm text-gray-600 line-clamp-2">
                          {submission.message.length > 100
                            ? `${submission.message.substring(0, 100)}...`
                            : submission.message
                          }
                        </div>
                      </div>
                      <div className="col-span-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(submission.status)}`}>
                          {submission.status}
                        </span>
                      </div>
                      <div className="col-span-1">
                        <div className="text-xs text-gray-500">
                          {formatDate(submission.submittedAt)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <select
                          value={submission.status}
                          onChange={(e) => updateSubmissionStatus(submission.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="unread">Unread</option>
                          <option value="read">Read</option>
                          <option value="responded">Responded</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                      {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                      {pagination.totalItems} results
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default withAuth(ContactSubmissions);