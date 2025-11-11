import { useState } from 'react';
import { FiUsers, FiClock } from 'react-icons/fi';
import UsersList from '../components/admin/UsersList';
import ActivityLogs from '../components/admin/ActivityLogs';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  const baseTab =
    'flex items-center gap-2 px-4 py-2 rounded-md border transition-colors duration-200';

  const inactiveTab =
    'bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-700 ' +
    'dark:bg-white dark:text-gray-700 dark:hover:bg-gray-100 dark:border-gray-300';

  const activeTabCls = 'bg-primary text-white border-transparent';

  return (
    <div className="flex-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 md:px-12 py-10 overflow-y-auto transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 dark:border-gray-300 pb-2">
        Admin Dashboard
      </h2>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('users')}
          aria-pressed={activeTab === 'users'}
          className={`${baseTab} ${activeTab === 'users' ? activeTabCls : inactiveTab}`}
        >
          <FiUsers /> Users
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          aria-pressed={activeTab === 'logs'}
          className={`${baseTab} ${activeTab === 'logs' ? activeTabCls : inactiveTab}`}
        >
          <FiClock /> Activity Logs
        </button>
      </div>

      {activeTab === 'users' ? <UsersList /> : <ActivityLogs />}
    </div>
  );
};

export default AdminDashboard;
