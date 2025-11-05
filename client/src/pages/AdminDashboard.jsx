import { useEffect, useState, useContext } from 'react';
import AppContext from '../context/AppContext';
import { FiUsers, FiClock } from 'react-icons/fi';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import toast from 'react-hot-toast';
const AdminDashboard = () => {
  const { axios, user } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [usersRes, logsRes] = await Promise.all([
          axios.get('/api/v1/admin/users'),
          axios.get('/api/v1/admin/activitylogs'),
        ]);
        setUsers(usersRes.data.users || []);
        setActivityLogs(logsRes.data.logs || []);
      } catch (error) {
        toast(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [axios, user]);

  if (loading) return <Loader />;

  return (
    <div className="flex-1 bg-gray-900 text-white px-6 md:px-12 py-10 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">
        Admin Dashboard
      </h2>

      <div className="mb-10">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiUsers /> All Users
        </h3>
        {users.length === 0 ? (
          <EmptyState message="No users found" />
        ) : (
          <div className="space-y-4">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-start gap-4 bg-gray-800 border border-gray-700 p-4 rounded-xl hover:border-primary/50 transition"
              >
                <div className="p-2 bg-primary/20 text-primary rounded-full">
                  <FiUsers size={20} />
                </div>
                <div>
                  <p className="text-base font-medium">{u.name}</p>
                  <p className="text-sm text-gray-400">{u.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Role: {u.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACTIVITY LOGS SECTION */}
      <div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FiClock /> Recent Activity Logs
        </h3>
        {activityLogs.length === 0 ? (
          <EmptyState message="No activity logs yet" />
        ) : (
          <div className="space-y-4">
            {activityLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 bg-gray-800 border border-gray-700 p-4 rounded-xl hover:border-primary/50 transition"
              >
                <div className="p-2 bg-primary/20 text-primary rounded-full">
                  <FiClock size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium">{log.action}</p>
                  <p className="text-sm text-gray-400 mt-1">
                    By: {log.User?.name || 'Unknown User'}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
