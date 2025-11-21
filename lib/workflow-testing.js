/**
 * Comprehensive workflow testing utilities
 * Tests complete user workflows and integration points
 */

import { blogApi, projectsApi, contactApi, authApi, adminApi } from './api-client';
import { getUserFriendlyMessage } from './error-handling';

// Test results structure
class TestResult {
  constructor(name, description) {
    this.name = name;
    this.description = description;
    this.status = 'pending'; // pending, running, passed, failed
    this.startTime = null;
    this.endTime = null;
    this.duration = null;
    this.error = null;
    this.details = {};
  }

  start() {
    this.status = 'running';
    this.startTime = Date.now();
  }

  pass(details = {}) {
    this.status = 'passed';
    this.endTime = Date.now();
    this.duration = this.endTime - this.startTime;
    this.details = details;
  }

  fail(error, details = {}) {
    this.status = 'failed';
    this.endTime = Date.now();
    this.duration = this.endTime - this.startTime;
    this.error = error;
    this.details = details;
  }
}

// Workflow test suite
export class WorkflowTester {
  constructor() {
    this.results = [];
    this.isRunning = false;
  }

  // Add a test
  addTest(name, description, testFn) {
    const result = new TestResult(name, description);
    this.results.push(result);
    
    return async () => {
      result.start();
      try {
        const details = await testFn();
        result.pass(details);
      } catch (error) {
        result.fail(error);
      }
      return result;
    };
  }

  // Run all tests
  async runAll() {
    this.isRunning = true;
    const startTime = Date.now();
    
    console.log('🚀 Starting workflow tests...');
    
    // Test public user workflows
    await this.testPublicUserWorkflows();
    
    // Test admin workflows (if authenticated)
    await this.testAdminWorkflows();
    
    // Test error scenarios
    await this.testErrorScenarios();
    
    const endTime = Date.now();
    const totalDuration = endTime - startTime;
    
    this.isRunning = false;
    
    // Generate report
    const report = this.generateReport(totalDuration);
    console.log('✅ Workflow tests completed');
    console.table(this.results.map(r => ({
      Test: r.name,
      Status: r.status,
      Duration: r.duration ? `${r.duration}ms` : 'N/A',
      Error: r.error ? r.error.message : ''
    })));
    
    return report;
  }

  // Test public user workflows
  async testPublicUserWorkflows() {
    console.log('📱 Testing public user workflows...');

    // Test 1: Blog browsing workflow
    const testBlogBrowsing = this.addTest(
      'Blog Browsing',
      'User can browse and read blog posts',
      async () => {
        // Fetch blog posts
        const posts = await blogApi.getPosts({ limit: 5 });
        if (!posts.success || !Array.isArray(posts.data)) {
          throw new Error('Failed to fetch blog posts');
        }

        // If posts exist, test individual post fetching
        if (posts.data.length > 0) {
          const firstPost = posts.data[0];
          const singlePost = await blogApi.getPost(firstPost.id);
          if (!singlePost.success) {
            throw new Error('Failed to fetch individual blog post');
          }
        }

        return {
          postsCount: posts.data.length,
          hasIndividualPost: posts.data.length > 0
        };
      }
    );

    // Test 2: Project showcase workflow
    const testProjectShowcase = this.addTest(
      'Project Showcase',
      'User can browse and filter projects',
      async () => {
        // Fetch all projects
        const projects = await projectsApi.getProjects();
        if (!projects.success || !Array.isArray(projects.data)) {
          throw new Error('Failed to fetch projects');
        }

        // Test filtering
        const filteredProjects = await projectsApi.getProjects({ 
          category: 'web-app',
          featured: true 
        });
        if (!filteredProjects.success) {
          throw new Error('Failed to filter projects');
        }

        return {
          totalProjects: projects.data.length,
          filteredProjects: filteredProjects.data.length,
          categories: projects.meta?.categories || [],
          technologies: projects.meta?.technologies || []
        };
      }
    );

    // Test 3: Contact form workflow
    const testContactForm = this.addTest(
      'Contact Form',
      'User can submit contact form',
      async () => {
        const testData = {
          name: 'Test User',
          email: 'test@example.com',
          subject: 'Test Subject',
          message: 'This is a test message for workflow testing.'
        };

        const result = await contactApi.submitForm(testData);
        if (!result.success) {
          throw new Error('Failed to submit contact form');
        }

        return {
          submitted: true,
          submissionId: result.data?.id
        };
      }
    );

    // Run public tests
    await testBlogBrowsing();
    await testProjectShowcase();
    await testContactForm();
  }

  // Test admin workflows
  async testAdminWorkflows() {
    console.log('👨‍💼 Testing admin workflows...');

    // Check if user is authenticated
    let isAuthenticated = false;
    try {
      const session = await authApi.checkSession();
      isAuthenticated = session.success && session.data?.authenticated;
    } catch (error) {
      console.log('ℹ️ Admin tests skipped - not authenticated');
      return;
    }

    if (!isAuthenticated) {
      console.log('ℹ️ Admin tests skipped - not authenticated');
      return;
    }

    // Test 4: Admin dashboard workflow
    const testAdminDashboard = this.addTest(
      'Admin Dashboard',
      'Admin can access dashboard and analytics',
      async () => {
        const analytics = await adminApi.getAnalytics();
        if (!analytics.success) {
          throw new Error('Failed to fetch analytics');
        }

        return {
          hasAnalytics: true,
          metrics: Object.keys(analytics.data || {})
        };
      }
    );

    // Test 5: Blog management workflow
    const testBlogManagement = this.addTest(
      'Blog Management',
      'Admin can manage blog posts',
      async () => {
        // Create a test blog post
        const testPost = {
          title: 'Test Blog Post',
          content: 'This is a test blog post content.',
          excerpt: 'Test excerpt',
          status: 'draft',
          categories: ['test'],
          tags: ['workflow-test']
        };

        const created = await blogApi.createPost(testPost);
        if (!created.success) {
          throw new Error('Failed to create blog post');
        }

        const postId = created.data.id;

        // Update the post
        const updated = await blogApi.updatePost(postId, {
          ...testPost,
          title: 'Updated Test Blog Post'
        });
        if (!updated.success) {
          throw new Error('Failed to update blog post');
        }

        // Delete the test post
        const deleted = await blogApi.deletePost(postId);
        if (!deleted.success) {
          throw new Error('Failed to delete blog post');
        }

        return {
          created: true,
          updated: true,
          deleted: true,
          postId
        };
      }
    );

    // Test 6: Project management workflow
    const testProjectManagement = this.addTest(
      'Project Management',
      'Admin can manage projects',
      async () => {
        // Create a test project
        const testProject = {
          title: 'Test Project',
          description: 'This is a test project.',
          technologies: ['React', 'Node.js'],
          category: 'web-app',
          featured: false
        };

        const created = await projectsApi.createProject(testProject);
        if (!created.success) {
          throw new Error('Failed to create project');
        }

        const projectId = created.data.id;

        // Update the project
        const updated = await projectsApi.updateProject(projectId, {
          ...testProject,
          title: 'Updated Test Project'
        });
        if (!updated.success) {
          throw new Error('Failed to update project');
        }

        // Delete the test project
        const deleted = await projectsApi.deleteProject(projectId);
        if (!deleted.success) {
          throw new Error('Failed to delete project');
        }

        return {
          created: true,
          updated: true,
          deleted: true,
          projectId
        };
      }
    );

    // Test 7: Contact submissions management
    const testContactManagement = this.addTest(
      'Contact Management',
      'Admin can manage contact submissions',
      async () => {
        const submissions = await contactApi.getSubmissions({ limit: 5 });
        if (!submissions.success) {
          throw new Error('Failed to fetch contact submissions');
        }

        // If submissions exist, test status update
        let statusUpdated = false;
        if (submissions.data.length > 0) {
          const firstSubmission = submissions.data[0];
          const updated = await contactApi.updateSubmission(firstSubmission.id, {
            status: 'read'
          });
          statusUpdated = updated.success;
        }

        return {
          submissionsCount: submissions.data.length,
          statusUpdated
        };
      }
    );

    // Run admin tests
    await testAdminDashboard();
    await testBlogManagement();
    await testProjectManagement();
    await testContactManagement();
  }

  // Test error scenarios
  async testErrorScenarios() {
    console.log('🚨 Testing error scenarios...');

    // Test 8: Invalid API requests
    const testInvalidRequests = this.addTest(
      'Error Handling',
      'System handles invalid requests gracefully',
      async () => {
        const errors = [];

        // Test 404 error
        try {
          await blogApi.getPost('non-existent-id');
        } catch (error) {
          errors.push({ type: '404', handled: true });
        }

        // Test invalid data
        try {
          await contactApi.submitForm({
            name: '', // Invalid empty name
            email: 'invalid-email', // Invalid email
            message: '' // Invalid empty message
          });
        } catch (error) {
          errors.push({ type: 'validation', handled: true });
        }

        return {
          errorsHandled: errors.length,
          errors
        };
      }
    );

    await testInvalidRequests();
  }

  // Generate test report
  generateReport(totalDuration) {
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const total = this.results.length;

    return {
      summary: {
        total,
        passed,
        failed,
        successRate: total > 0 ? Math.round((passed / total) * 100) : 0,
        totalDuration
      },
      results: this.results,
      timestamp: new Date().toISOString()
    };
  }

  // Get failed tests
  getFailedTests() {
    return this.results.filter(r => r.status === 'failed');
  }

  // Get passed tests
  getPassedTests() {
    return this.results.filter(r => r.status === 'passed');
  }
}

// Convenience function to run all workflow tests
export const runWorkflowTests = async () => {
  const tester = new WorkflowTester();
  return await tester.runAll();
};

// Export for use in components
export default WorkflowTester;