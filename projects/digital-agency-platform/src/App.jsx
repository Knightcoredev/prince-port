import React, { useState, useEffect } from 'react';
import { 
  Menu, X, Home, Briefcase, Users, Settings, BarChart3, 
  MessageSquare, Calendar, FileText, Search, Bell, User,
  Plus, Edit, Trash2, Eye, Download, Upload, Filter,
  ChevronDown, Star, Award, TrendingUp, DollarSign,
  Clock, CheckCircle, AlertCircle, Zap, Globe, Smartphone,
  Code, Palette, Camera, Megaphone, Target, Shield
} from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [userRole, setUserRole] = useState('admin'); // admin, client, employee
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState(3);

  // Sample data
  const projects = [
    {
      id: 1,
      name: 'E-Commerce Redesign',
      client: 'TechCorp Inc.',
      status: 'In Progress',
      progress: 75,
      deadline: '2024-12-15',
      budget: '$25,000',
      team: ['John Doe', 'Jane Smith', 'Mike Johnson'],
      type: 'Web Development'
    },
    {
      id: 2,
      name: 'Brand Identity Package',
      client: 'StartupXYZ',
      status: 'Review',
      progress: 90,
      deadline: '2024-12-10',
      budget: '$15,000',
      team: ['Sarah Wilson', 'Tom Brown'],
      type: 'Branding'
    },
    {
      id: 3,
      name: 'Mobile App Development',
      client: 'HealthTech Solutions',
      status: 'Planning',
      progress: 25,
      deadline: '2025-01-30',
      budget: '$45,000',
      team: ['Alex Chen', 'Lisa Garcia', 'David Kim'],
      type: 'Mobile Development'
    }
  ];

  const clients = [
    {
      id: 1,
      name: 'TechCorp Inc.',
      email: 'contact@techcorp.com',
      phone: '+1 (555) 123-4567',
      projects: 3,
      totalValue: '$75,000',
      status: 'Active',
      joinDate: '2024-01-15'
    },
    {
      id: 2,
      name: 'StartupXYZ',
      email: 'hello@startupxyz.com',
      phone: '+1 (555) 987-6543',
      projects: 2,
      totalValue: '$35,000',
      status: 'Active',
      joinDate: '2024-03-20'
    },
    {
      id: 3,
      name: 'HealthTech Solutions',
      email: 'info@healthtech.com',
      phone: '+1 (555) 456-7890',
      projects: 1,
      totalValue: '$45,000',
      status: 'New',
      joinDate: '2024-11-01'
    }
  ];

  const services = [
    {
      icon: <Code className="w-8 h-8" />,
      title: 'Web Development',
      description: 'Custom websites and web applications built with modern technologies',
      price: 'Starting at $5,000',
      features: ['Responsive Design', 'SEO Optimization', 'Performance Optimization', 'CMS Integration']
    },
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: 'Mobile Development',
      description: 'Native and cross-platform mobile applications for iOS and Android',
      price: 'Starting at $15,000',
      features: ['Native iOS/Android', 'Cross-Platform', 'App Store Optimization', 'Push Notifications']
    },
    {
      icon: <Palette className="w-8 h-8" />,
      title: 'UI/UX Design',
      description: 'User-centered design solutions that drive engagement and conversions',
      price: 'Starting at $3,000',
      features: ['User Research', 'Wireframing', 'Prototyping', 'Design Systems']
    },
    {
      icon: <Megaphone className="w-8 h-8" />,
      title: 'Digital Marketing',
      description: 'Comprehensive digital marketing strategies to grow your business',
      price: 'Starting at $2,000/month',
      features: ['SEO/SEM', 'Social Media', 'Content Marketing', 'Analytics']
    }
  ];

  const stats = {
    totalProjects: 156,
    activeClients: 42,
    completedProjects: 134,
    revenue: '$2.4M',
    teamMembers: 18,
    satisfaction: '98%'
  };

  const recentActivities = [
    { id: 1, type: 'project', message: 'Project "E-Commerce Redesign" updated', time: '2 hours ago', user: 'John Doe' },
    { id: 2, type: 'client', message: 'New client "HealthTech Solutions" added', time: '4 hours ago', user: 'Sarah Wilson' },
    { id: 3, type: 'task', message: 'Task "Homepage Design" completed', time: '6 hours ago', user: 'Mike Johnson' },
    { id: 4, type: 'meeting', message: 'Client meeting scheduled for tomorrow', time: '1 day ago', user: 'Lisa Garcia' }
  ];

  const Sidebar = () => (
    <div className={`bg-white shadow-lg transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-16'} min-h-screen`}>
      <div className="p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          {isSidebarOpen && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">PixelCraft</h1>
              <p className="text-sm text-gray-500">Digital Agency</p>
            </div>
          )}
        </div>
      </div>

      <nav className="mt-8">
        {[
          { id: 'home', icon: Home, label: 'Dashboard' },
          { id: 'projects', icon: Briefcase, label: 'Projects' },
          { id: 'clients', icon: Users, label: 'Clients' },
          { id: 'services', icon: Target, label: 'Services' },
          { id: 'team', icon: Users, label: 'Team' },
          { id: 'analytics', icon: BarChart3, label: 'Analytics' },
          { id: 'messages', icon: MessageSquare, label: 'Messages' },
          { id: 'calendar', icon: Calendar, label: 'Calendar' },
          { id: 'files', icon: FileText, label: 'Files' },
          { id: 'settings', icon: Settings, label: 'Settings' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id)}
            className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
              currentView === item.id ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600' : 'text-gray-700'
            }`}
          >
            <item.icon className="w-5 h-5" />
            {isSidebarOpen && <span className="ml-3">{item.label}</span>}
          </button>
        ))}
      </nav>
    </div>
  );

  const Header = () => (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, clients, files..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent w-96"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1.5 rounded-lg font-bold text-sm tracking-wider shadow-md">
            [Your Initials]
          </div>
          
          <select 
            value={userRole} 
            onChange={(e) => setUserRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="admin">Admin View</option>
            <option value="client">Client View</option>
            <option value="employee">Employee View</option>
          </select>

          <button className="relative p-2 hover:bg-gray-100 rounded-lg">
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">John Doe</p>
              <p className="text-xs text-gray-500 capitalize">{userRole}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );

  const Dashboard = () => (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening at PixelCraft.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Projects', value: stats.totalProjects, icon: Briefcase, color: 'bg-blue-500' },
          { label: 'Active Clients', value: stats.activeClients, icon: Users, color: 'bg-green-500' },
          { label: 'Revenue', value: stats.revenue, icon: DollarSign, color: 'bg-purple-500' },
          { label: 'Team Members', value: stats.teamMembers, icon: Users, color: 'bg-orange-500' }
        ].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {projects.slice(0, 3).map((project) => (
              <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-600">{project.client}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    project.status === 'Review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.status}
                  </span>
                  <p className="text-sm text-gray-500 mt-1">{project.progress}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500">{activity.time} • {activity.user}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const ProjectsView = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>
          <p className="text-gray-600">Manage and track all your projects</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </button>
              <select className="px-3 py-2 border border-gray-300 rounded-lg">
                <option>All Status</option>
                <option>In Progress</option>
                <option>Review</option>
                <option>Completed</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      <div className="text-sm text-gray-500">{project.type}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{project.client}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'Review' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${project.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{project.deadline}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.budget}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-primary-600 hover:text-primary-900">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ClientsView = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Clients</h1>
          <p className="text-gray-600">Manage your client relationships</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Client
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                client.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {client.status}
              </span>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{client.name}</h3>
            <p className="text-sm text-gray-600 mb-1">{client.email}</p>
            <p className="text-sm text-gray-600 mb-4">{client.phone}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Projects</p>
                <p className="text-lg font-semibold text-gray-900">{client.projects}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Value</p>
                <p className="text-lg font-semibold text-gray-900">{client.totalValue}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Joined {client.joinDate}</p>
              <div className="flex items-center space-x-2">
                <button className="text-primary-600 hover:text-primary-900">
                  <Eye className="w-4 h-4" />
                </button>
                <button className="text-gray-600 hover:text-gray-900">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ServicesView = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Services</h1>
          <p className="text-gray-600">Our comprehensive digital solutions</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Add Service
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service, index) => (
          <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="text-primary-600 mr-4">
                {service.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
                <p className="text-primary-600 font-medium">{service.price}</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-6">{service.description}</p>
            
            <div className="space-y-2 mb-6">
              {service.features.map((feature, featureIndex) => (
                <div key={featureIndex} className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-between">
              <button className="text-primary-600 hover:text-primary-700 font-medium">Learn More</button>
              <div className="flex items-center space-x-2">
                <button className="text-gray-600 hover:text-gray-900">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="text-red-600 hover:text-red-900">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return <Dashboard />;
      case 'projects':
        return <ProjectsView />;
      case 'clients':
        return <ClientsView />;
      case 'services':
        return <ServicesView />;
      case 'team':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Team Management</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-600">Team management features coming soon...</p>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Analytics & Reports</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-600">Advanced analytics dashboard coming soon...</p>
            </div>
          </div>
        );
      case 'messages':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Messages</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-600">Integrated messaging system coming soon...</p>
            </div>
          </div>
        );
      case 'calendar':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Calendar</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-600">Project calendar and scheduling coming soon...</p>
            </div>
          </div>
        );
      case 'files':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">File Management</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-600">File storage and sharing system coming soon...</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Settings</h1>
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-600">System settings and configuration coming soon...</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1">
        <Header />
        <main className="overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;