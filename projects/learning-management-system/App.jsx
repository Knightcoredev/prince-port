import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CourseCard from './components/CourseCard';
import LessonPlayer from './components/LessonPlayer';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [userRole, setUserRole] = useState('student'); // 'student' or 'instructor'

  const courses = [
    {
      id: 1,
      title: 'Introduction to React',
      instructor: 'Dr. Johnson',
      progress: 75,
      nextLesson: 'React Hooks',
      dueDate: '2024-12-15',
      image: 'https://via.placeholder.com/300x200?text=React+Course',
      description: 'Learn the fundamentals of React development',
      lessons: 24,
      duration: '8 weeks'
    },
    {
      id: 2,
      title: 'Advanced JavaScript',
      instructor: 'Prof. Williams',
      progress: 45,
      nextLesson: 'Async/Await',
      dueDate: '2024-12-20',
      image: 'https://via.placeholder.com/300x200?text=JavaScript+Course',
      description: 'Master advanced JavaScript concepts',
      lessons: 32,
      duration: '10 weeks'
    },
    {
      id: 3,
      title: 'Database Design',
      instructor: 'Dr. Brown',
      progress: 90,
      nextLesson: 'Final Project',
      dueDate: '2024-12-10',
      image: 'https://via.placeholder.com/300x200?text=Database+Course',
      description: 'Learn database design principles',
      lessons: 18,
      duration: '6 weeks'
    }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard userRole={userRole} />;
      case 'courses':
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                {userRole === 'instructor' ? 'Manage Courses' : 'My Courses'}
              </h1>
              {userRole === 'instructor' && (
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  Create New Course
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} userRole={userRole} />
              ))}
            </div>
          </div>
        );
      case 'assignments':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {userRole === 'instructor' ? 'Manage Assignments' : 'My Assignments'}
            </h1>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">React Component Project</h3>
                    <p className="text-sm text-gray-600">Introduction to React</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Due: Dec 15, 2024</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                      Pending
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Database Schema Design</h3>
                    <p className="text-sm text-gray-600">Database Design</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">Due: Dec 18, 2024</p>
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      In Progress
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'grades':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Grades</h1>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Introduction to React</h3>
                    <p className="text-sm text-gray-600">Current Grade</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">A-</p>
                    <p className="text-sm text-gray-600">89%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Advanced JavaScript</h3>
                    <p className="text-sm text-gray-600">Current Grade</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">B+</p>
                    <p className="text-sm text-gray-600">85%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'calendar':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Calendar</h1>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <p className="text-gray-600">Calendar view coming soon...</p>
            </div>
          </div>
        );
      case 'messages':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <p className="text-gray-600">Messaging system coming soon...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard userRole={userRole} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeView={activeView} setActiveView={setActiveView} userRole={userRole} />
      <div className="flex-1">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">EduPlatform</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={userRole} 
                onChange={(e) => setUserRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="student">Student View</option>
                <option value="instructor">Instructor View</option>
              </select>
              <button className="p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-2H4v2zM4 15h8v-2H4v2zM4 11h10V9H4v2zM4 7h12V5H4v2z" />
                </svg>
              </button>
            </div>
          </div>
        </header>
        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;