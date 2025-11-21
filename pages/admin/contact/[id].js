import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import AdminLayout from '../../../components/admin/AdminLayout';
import withAuth from '../../../components/auth/withAuth';

function ContactSubmissionDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  // Fetch submission details
  const fetchSubmission = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/contact/submissions/${id}`);
      const result = await response.json();

      if (result.success) {
        setSubmission(result.data);
        setError(null);
      } else {
        setError(result.error?.message || 'Failed to fetch submission');
      }
    } catch (err) {
      setError('Failed to fetch submission');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update submission status
  const updateStatus = async (status) => {
    try {
      setUpdating(true);
      const response = await fetch(`/api/contact/submissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmission(result.data);
      } else {
        alert(result.error?.message || 'Failed to update status');
      }
    } catch (err) {
      alert('Failed to update status');
      console.error('Update error:', err);
    } finally {
      setUpdating(false);
    }
  };

  // Delete submission
  const deleteSubmission = async () => {
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/contact/submissions/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        router.push('/admin/contact');
      } else {
        alert(result.error?.message || 'Failed to delete submission');
      }
    } catch (err) {
      alert('Failed to delete submission');
      console.error('Delete error:', err);
    }
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
    fetchSubmission();
  }, [id]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading submission...</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/admin/contact" className="text-blue-600 hover:text-blue-800">
            ← Back to Contact Submissions
          </Link>
        </div>
      </AdminLayout>
    );
  }

  if (!submission) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Submission not found</p>
          <Link href="/admin/contact" className="text-blue-600 hover:text-blue-800">
            ← Back to Contact Submissions
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Link href="/admin/contact" className="text-blue-600 hover:text-blue-800 text-sm">
              ← Back to Contact Submissions
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">Contact Submission</h1>
            <p className="text-sm text-gray-600">
              Submitted on {formatDate(submission.submittedAt)}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(submission.status)}`}>
              {submission.status}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Submission Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{submission.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">
                    <a href={`mailto:${submission.email}`} className="text-blue-600 hover:text-blue-800">
                      {submission.email}
                    </a>
                  </p>
                </div>
                {submission.subject && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Subject</label>
                    <p className="mt-1 text-sm text-gray-900">{submission.subject}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Message</h2>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap text-gray-900">{submission.message}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`mailto:${submission.email}?subject=Re: ${submission.subject || 'Your message'}&body=Hi ${submission.name},%0D%0A%0D%0AThank you for your message.%0D%0A%0D%0A`}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Reply via Email
                </a>
                
                <button
                  onClick={() => navigator.clipboard.writeText(submission.email)}
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Email
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Management */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Management</h2>
              <div className="space-y-3">
                <button
                  onClick={() => updateStatus('read')}
                  disabled={updating || submission.status === 'read'}
                  className="w-full px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Mark as Read'}
                </button>
                
                <button
                  onClick={() => updateStatus('responded')}
                  disabled={updating || submission.status === 'responded'}
                  className="w-full px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Mark as Responded'}
                </button>
                
                <button
                  onClick={() => updateStatus('unread')}
                  disabled={updating || submission.status === 'unread'}
                  className="w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Updating...' : 'Mark as Unread'}
                </button>
              </div>
            </div>

            {/* Submission Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Submission Details</h2>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Submission ID:</span>
                  <p className="text-gray-600 font-mono text-xs">{submission.id}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">IP Address:</span>
                  <p className="text-gray-600">{submission.ipAddress}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Submitted:</span>
                  <p className="text-gray-600">{formatDate(submission.submittedAt)}</p>
                </div>
                {submission.updatedAt && submission.updatedAt !== submission.submittedAt && (
                  <div>
                    <span className="font-medium text-gray-700">Last Updated:</span>
                    <p className="text-gray-600">{formatDate(submission.updatedAt)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-lg shadow-sm border border-red-200 p-6">
              <h2 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h2>
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete this submission. This action cannot be undone.
              </p>
              <button
                onClick={deleteSubmission}
                className="w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Delete Submission
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default withAuth(ContactSubmissionDetail);