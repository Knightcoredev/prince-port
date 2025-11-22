import React from 'react';

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'tasks', label: 'Tasks', icon: '✅' },
    { id: 'kanban', label: 'Kanban Board', icon: '📋' },
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'team', label: 'Team', icon: '👥' },
    { id: 'reports', label: 'Reports', icon: '📈' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="bg-gray-900 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">TaskFlow</h1>
        <p className="text-gray-400 text-sm">Project Management</p>
      </div>

      <nav className="space-y-2">
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

      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-semibold mb-2">Quick Stats</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Active Tasks</span>
            <span className="text-blue-400">24</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Completed</span>
            <span className="text-green-400">156</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Team Members</span>
            <span className="text-purple-400">8</span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center space-x-3 p-3 bg-gray-800 rounded-lg">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold">JD</span>
          </div>
          <div>
            <p className="font-medium">John Doe</p>
            <p className="text-gray-400 text-sm">Project Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}