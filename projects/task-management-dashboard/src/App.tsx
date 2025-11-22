import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KanbanBoard from './components/KanbanBoard';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'kanban':
        return <KanbanBoard />;
      case 'tasks':
        return (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Tasks</h1>
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Task
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <TaskCard
                task={{
                  id: '1',
                  title: 'Update user authentication',
                  description: 'Implement OAuth 2.0 and improve security',
                  priority: 'high',
                  status: 'in-progress',
                  assignee: 'Alice Johnson',
                  dueDate: '2024-12-01',
                  tags: ['security', 'backend']
                }}
              />
              <TaskCard
                task={{
                  id: '2',
                  title: 'Design new landing page',
                  description: 'Create modern, responsive design',
                  priority: 'medium',
                  status: 'todo',
                  assignee: 'Bob Smith',
                  dueDate: '2024-12-05',
                  tags: ['design', 'frontend']
                }}
              />
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
      case 'team':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Team</h1>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <p className="text-gray-600">Team management coming soon...</p>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports</h1>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <p className="text-gray-600">Reports and analytics coming soon...</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <p className="text-gray-600">Settings panel coming soon...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-1">
        {renderContent()}
      </main>
      
      {isTaskModalOpen && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={(task) => {
            console.log('New task:', task);
            setIsTaskModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default App;