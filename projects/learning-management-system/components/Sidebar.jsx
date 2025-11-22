import React from 'react';

export default function Sidebar({ activeView, setActiveView, userRole = 'student' }) {
  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'courses', label: 'My Courses', icon: '📚' },
    { id: 'assignments', label: 'Assignments', icon: '📝' },
    { id: 'grades', label: 'Grades', icon: '📈' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'messages', label: 'Messages', icon: '💬' },
  ];

  const instructorMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'courses', label: 'Manage Courses', icon: '📚' },
    { id: 'students', label: 'Students', icon: '👥' },
    { id: 'assignments', label: 'Assignments', icon: '📝' },
    { id: 'gradebook', label: 'Gradebook', icon: '📋' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
  ];

  const menuItems = userRole === 'instructor' ? instructorMenuItems : studentMenuItems;

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">EduPlatform</h1>
        <p className="text-gray-400 text-sm">Learning Management System</p>
      </div>

      <nav className="space-y-2 mb-8">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeView === item.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mb-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-semibold mb-2">Quick Stats</h3>
        <div className="space-y-2 text-sm">
          {userRole === 'student' ? (
            <>
              <div className="flex justify-between">
                <span className="text-gray-400">Enrolled Courses</span>
                <span className="text-blue-400">6</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Completed</span>
                <span className="text-green-400">4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Assignments Due</span>
                <span className="text-yellow-400">3</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span className="text-gray-400">Active Courses</span>
                <span className="text-blue-400">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Students</span>
                <span className="text-green-400">245</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pending Reviews</span>
                <span className="text-yellow-400">12</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">
              {userRole === 'instructor' ? 'Dr' : 'JS'}
            </span>
          </div>
          <div>
            <p className="font-medium">
              {userRole === 'instructor' ? 'Dr. Smith' : 'Jane Student'}
            </p>
            <p className="text-gray-400 text-sm capitalize">{userRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
}