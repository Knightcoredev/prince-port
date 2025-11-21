import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/AdminLayout';
import { WorkflowTester } from '../../lib/workflow-testing';
import { useToast } from '../../components/ui/Toast';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function IntegrationTest() {
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const router = useRouter();
  const toast = useToast();

  // Run integration tests
  const runTests = async () => {
    setIsRunning(true);
    setTestResults(null);
    
    try {
      toast.info('Starting integration tests...', { duration: 3000 });
      
      const tester = new WorkflowTester();
      const results = await tester.runAll();
      
      setTestResults(results);
      
      if (results.summary.failed === 0) {
        toast.success(`All ${results.summary.total} tests passed! 🎉`);
      } else {
        toast.warning(`${results.summary.failed} of ${results.summary.total} tests failed`);
      }
    } catch (error) {
      console.error('Test execution error:', error);
      toast.error('Failed to run integration tests');
    } finally {
      setIsRunning(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'running':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'failed':
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'running':
        return <LoadingSpinner size="sm" />;
      default:
        return (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integration Tests</h1>
            <p className="mt-1 text-gray-600">
              Test complete user workflows and system integration
            </p>
          </div>
          <button
            onClick={runTests}
            disabled={isRunning}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              isRunning
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isRunning ? (
              <span className="flex items-center">
                <LoadingSpinner size="sm" color="white" className="mr-2" />
                Running Tests...
              </span>
            ) : (
              'Run All Tests'
            )}
          </button>
        </div>

        {/* Test Results Summary */}
        {testResults && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Summary</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {testResults.summary.total}
                </div>
                <div className="text-sm text-gray-600">Total Tests</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {testResults.summary.passed}
                </div>
                <div className="text-sm text-gray-600">Passed</div>
              </div>
              
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {testResults.summary.failed}
                </div>
                <div className="text-sm text-gray-600">Failed</div>
              </div>
              
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {testResults.summary.successRate}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <p>Total Duration: {testResults.summary.totalDuration}ms</p>
              <p>Completed: {new Date(testResults.timestamp).toLocaleString()}</p>
            </div>
          </div>
        )}

        {/* Test Results List */}
        {testResults && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Test Results</h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {testResults.results.map((result, index) => (
                <div
                  key={index}
                  className="p-6 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedTest(selectedTest === index ? null : index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                        {getStatusIcon(result.status)}
                        <span className="ml-1 capitalize">{result.status}</span>
                      </span>
                      <div>
                        <h3 className="font-medium text-gray-900">{result.name}</h3>
                        <p className="text-sm text-gray-600">{result.description}</p>
                      </div>
                    </div>
                    
                    <div className="text-right text-sm text-gray-500">
                      {result.duration && <div>{result.duration}ms</div>}
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          selectedTest === index ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Test Details */}
                  {selectedTest === index && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {result.error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                          <h4 className="font-medium text-red-800 mb-1">Error</h4>
                          <p className="text-sm text-red-700">{result.error.message}</p>
                          {result.error.stack && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-xs text-red-600">
                                Show stack trace
                              </summary>
                              <pre className="mt-1 text-xs text-red-600 overflow-auto max-h-32">
                                {result.error.stack}
                              </pre>
                            </details>
                          )}
                        </div>
                      )}

                      {Object.keys(result.details).length > 0 && (
                        <div className="p-3 bg-gray-50 rounded-md">
                          <h4 className="font-medium text-gray-800 mb-2">Details</h4>
                          <pre className="text-xs text-gray-600 overflow-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        {!testResults && !isRunning && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              Integration Testing
            </h2>
            <div className="text-blue-800 space-y-2">
              <p>
                This tool tests complete user workflows to ensure all components work together properly.
              </p>
              <p className="font-medium">Tests include:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Public user workflows (blog browsing, project showcase, contact form)</li>
                <li>Admin workflows (dashboard, content management)</li>
                <li>Error handling scenarios</li>
                <li>API integration points</li>
              </ul>
              <p className="mt-4">
                Click "Run All Tests" to start the comprehensive integration test suite.
              </p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}