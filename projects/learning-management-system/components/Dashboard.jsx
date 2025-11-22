import React from 'react';
import CourseCard from './CourseCard';

export default function Dashboard({ userRole = 'student' }) {
  const studentCourses = [
    {
      id: 1,
      title: 'Introduction to React',
      instructor: 'Dr. Johnson',
      progress: 75,
      nextLesson: 'React Hooks',
      dueDate: '2024-12-15',
      image: 'https://via.placeholder.com/300x200?text=React+Course'
    },
    {
      id: 2,
      title: 'Advanced JavaScript',
      instructor: 'Prof. Williams',
      progress: 45,
      nextLesson: 'Async/Await',
      dueDate: '2024-12-20',
      image: 'https://via.placeholder.com/300x200?text=JavaScript+Course'
    },
    {
      id: 3,
      title: 'Database Design',
      instructor: 'Dr. Brown',
      progress: 90,
      nextLesson: 'Final Project',
      dueDate: '2024-12-10',
      image: 'https://via.placeholder.com/300x200?text=Database+Course'
    }
  ];

  const instructorCourses = [
    {
      id: 1,
      title: 'Web Development Fundamentals',
      students: 45,
      completion: 68,
      assignments: 3,
      image: 'https://via.placeholder.com/300x200?text=Web+Dev+Course'
    },
    {
      id: 2,
      title: 'Advanced React Patterns',
      students: 32,
      completion: 82,
      assignments: 1,
      image: 'https://via.placeholder.com/300x200?text=Advanced+React'
    }
  ];

  const upcomingAssignments = [
    { id: 1, title: 'React Component Project', course: 'Introduction to React', dueDate: '2024-12-15', status: 'pending' },
    { id: 2, title: 'Database Schema Design', course: 'Database Design', dueDate: '2024-12-18', status: 'in-progress' },
    { id: 3, title: 'JavaScript Quiz', course: 'Advanced JavaScript', dueDate: '2024-12-22', status: 'pending' },
  ];

  const recentActivity = [
    { id: 1, action: 'Completed lesson', item: 'React State Management', time: '2 hours ago' },
    { id: 2, action: 'Submitted assignment', item: 'JavaScript Functions', time: '1 day ago' },
    { id: 3, action: 'Started course', item: 'Database Design', time: '3 days ago' },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {userRole === 'instructor' ? 'Instructor Dashboard' : 'Student Dashboard'}
        </h1>
        <p className="text-gray-600">
          {userRole === 'instructor' 
            ? 'Manage your courses and track student progress' 
            : 'Welcome back! Continue your learning journey'
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {userRole === 'student' ? (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                  <p className="text-3xl font-bold text-gray-900">6</p>
                </div>
                <div className="text-blue-600">📚</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-gray-900">4</p>
                </div>
                <div className="text-green-600">✅</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Assignments Due</p>
                  <p className="text-3xl font-bold text-gray-900">3</p>
                </div>
                <div className="text-yellow-600">📝</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Grade</p>
                  <p className="text-3xl font-bold text-gray-900">87%</p>
                </div>
                <div className="text-purple-600">📈</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Courses</p>
                  <p className="text-3xl font-bold text-gray-900">8</p>
                </div>
                <div className="text-blue-600">📚</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">245</p>
                </div>
                <div className="text-green-600">👥</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Reviews</p>
                  <p className="text-3xl font-bold text-gray-900">12</p>
                </div>
                <div className="text-yellow-600">📋</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Completion</p>
                  <p className="text-3xl font-bold text-gray-900">75%</p>
                </div>
                <div className="text-purple-600">📈</div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Courses Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {userRole === 'instructor' ? 'My Courses' : 'Continue Learning'}
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {userRole === 'student' 
                ? studentCourses.slice(0, 3).map((course) => (
                    <CourseCard key={course.id} course={course} userRole={userRole} />
                  ))
                : instructorCourses.map((course) => (
                    <CourseCard key={course.id} course={course} userRole={userRole} />
                  ))
              }
            </div>
          </div>
        </div>

        {/* Assignments/Activity Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {userRole === 'instructor' ? 'Recent Activity' : 'Upcoming Assignments'}
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {userRole === 'student' 
                ? upcomingAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                        <p className="text-sm text-gray-600">{assignment.course}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{assignment.dueDate}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          assignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {assignment.status}
                        </span>
                      </div>
                    </div>
                  ))
                : recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">📚</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.action}: {activity.item}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}