import React, { useState } from 'react';
import TaskCard, { Task } from './TaskCard';

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'todo',
      title: 'To Do',
      tasks: [
        {
          id: '1',
          title: 'Design new user interface',
          description: 'Create mockups for the new dashboard layout',
          priority: 'high',
          assignee: 'Alice Johnson',
          dueDate: '2024-12-15',
          tags: ['design', 'ui/ux'],
          status: 'todo'
        },
        {
          id: '2',
          title: 'Set up CI/CD pipeline',
          description: 'Configure automated testing and deployment',
          priority: 'medium',
          assignee: 'Bob Smith',
          dueDate: '2024-12-20',
          tags: ['devops', 'automation'],
          status: 'todo'
        }
      ]
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      tasks: [
        {
          id: '3',
          title: 'Implement user authentication',
          description: 'Add OAuth 2.0 and JWT token management',
          priority: 'high',
          assignee: 'Carol Davis',
          dueDate: '2024-12-10',
          tags: ['backend', 'security'],
          status: 'in-progress'
        }
      ]
    },
    {
      id: 'review',
      title: 'Review',
      tasks: [
        {
          id: '4',
          title: 'Update API documentation',
          description: 'Document new endpoints and response formats',
          priority: 'low',
          assignee: 'David Wilson',
          dueDate: '2024-12-08',
          tags: ['documentation', 'api'],
          status: 'review'
        }
      ]
    },
    {
      id: 'done',
      title: 'Done',
      tasks: [
        {
          id: '5',
          title: 'Fix mobile responsive issues',
          description: 'Resolve layout problems on mobile devices',
          priority: 'medium',
          assignee: 'Eve Brown',
          dueDate: '2024-12-05',
          tags: ['frontend', 'mobile'],
          status: 'done'
        }
      ]
    }
  ]);

  const getColumnColor = (columnId: string) => {
    switch (columnId) {
      case 'todo': return 'bg-gray-100 border-gray-300';
      case 'in-progress': return 'bg-blue-50 border-blue-300';
      case 'review': return 'bg-yellow-50 border-yellow-300';
      case 'done': return 'bg-green-50 border-green-300';
      default: return 'bg-gray-100 border-gray-300';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Add New Task
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.id} className={`rounded-lg border-2 border-dashed p-4 ${getColumnColor(column.id)}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">{column.title}</h2>
              <span className="bg-white text-gray-600 text-sm px-2 py-1 rounded-full">
                {column.tasks.length}
              </span>
            </div>

            <div className="space-y-3">
              {column.tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>

            <button className="w-full mt-3 p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors">
              + Add a task
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Board Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{columns.reduce((sum, col) => sum + col.tasks.length, 0)}</div>
            <div className="text-sm text-gray-500">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{columns.find(c => c.id === 'in-progress')?.tasks.length || 0}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{columns.find(c => c.id === 'review')?.tasks.length || 0}</div>
            <div className="text-sm text-gray-500">In Review</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{columns.find(c => c.id === 'done')?.tasks.length || 0}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
}