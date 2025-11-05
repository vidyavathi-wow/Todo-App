import { useState } from 'react';
import { FiUsers, FiClock } from 'react-icons/fi';
import UsersList from '../components/admin/UsersList';
import ActivityLogs from '../components/admin/ActivityLogs';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="flex-1 bg-gray-900 text-white px-6 md:px-12 py-10 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">
        Admin Dashboard
      </h2>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md ${
            activeTab === 'users'
              ? 'bg-primary text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <FiUsers /> Users
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-md ${
            activeTab === 'logs'
              ? 'bg-primary text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <FiClock /> Activity Logs
        </button>
      </div>

      {activeTab === 'users' ? <UsersList /> : <ActivityLogs />}
    </div>
  );
};

export default AdminDashboard;
