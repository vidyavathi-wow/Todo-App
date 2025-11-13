import { useEffect, useState } from 'react';
import { UserX, UserCheck, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';
import toast from 'react-hot-toast';

import {
  getAllUsers,
  deleteUser,
  promoteUser,
  demoteUser,
  restoreUser,
} from '../../services/admin';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers(page, 3);
      if (data.success) {
        setUsers(data.users || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error(data.message || 'Failed to load users');
      }
    } catch (err) {
      console.error('Error fetching users:', err.message);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this user?'))
      return;

    try {
      const data = await deleteUser(id);
      if (data.success) {
        toast.success(data.message || 'User deactivated successfully');
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to deactivate user');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate user');
    }
  };

  const handleRestore = async (id) => {
    try {
      const data = await restoreUser(id, { restore: true });
      if (data.success) {
        toast.success(data.message || 'User restored successfully');
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to restore user');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to restore user');
    }
  };

  const handlePromote = async (id) => {
    try {
      const data = await promoteUser(id, { role: 'admin' });
      if (data.success) {
        toast.success('User promoted to admin');
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to promote user');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to promote user');
    }
  };

  const handleDemote = async (id) => {
    try {
      const data = await demoteUser(id, { role: 'user' });
      if (data.success) {
        toast.success('Admin demoted to user');
        fetchUsers();
      } else {
        toast.error(data.message || 'Failed to demote user');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to demote user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  if (loading) return <Loader />;

  return (
    <div
      className="flex-1 bg-gray-dark dark:bg-gray-100 text-gray-200 dark:text-gray-900 
      px-4 sm:px-6 py-6 overflow-y-auto rounded-lg transition-colors duration-500"
    >
      <h3 className="text-xl sm:text-2xl font-semibold mb-6 border-b border-gray-700 dark:border-gray-300 pb-2">
        All Users
      </h3>

      {users.length === 0 ? (
        <EmptyState message="No users found" />
      ) : (
        <div className="space-y-4">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex flex-wrap sm:flex-nowrap items-center justify-between
              bg-gray-800 dark:bg-white border border-gray-700 dark:border-gray-300
              p-4 rounded-xl hover:border-primary/50 transition-colors duration-300"
            >
              {/* User Details */}
              <div className="flex-1 min-w-[60%] break-words">
                <p className="font-medium text-white dark:text-gray-900 text-base sm:text-lg leading-snug">
                  {u.name}
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-600 break-all">
                  {u.email}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-700 mt-1">
                  Role: {u.role}
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div
                className="
                  mt-3 sm:mt-0
                  flex flex-wrap 
                  w-full sm:w-auto 
                  justify-between sm:justify-center md:justify-end 
                  gap-3
                "
              >
                {/* Restore */}
                {u.deletedAt ? (
                  <button
                    onClick={() => handleRestore(u.id)}
                    className="
                      flex items-center gap-2 px-4 py-2 rounded-lg 
                      w-full sm:w-auto text-sm font-medium 
                      bg-gray-700 dark:bg-gray-200 hover:opacity-80
                      text-green-500 dark:text-gray-900
                    "
                  >
                    <UserCheck size={18} /> Restore
                  </button>
                ) : (
                  <>
                    {/* Promote */}
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handlePromote(u.id)}
                        className="
                          flex items-center gap-2 px-4 py-2 rounded-lg 
                          w-full sm:w-auto text-sm font-medium 
                          bg-gray-700 dark:bg-gray-200 hover:opacity-80
                          text-blue-400 dark:text-gray-900
                        "
                      >
                        <ArrowUpCircle size={18} /> Promote
                      </button>
                    )}

                    {/* Demote */}
                    {u.role === 'admin' && (
                      <button
                        onClick={() => handleDemote(u.id)}
                        className="
                          flex items-center gap-2 px-4 py-2 rounded-lg 
                          w-full sm:w-auto text-sm font-medium 
                          bg-gray-700 dark:bg-gray-200 hover:opacity-80
                          text-yellow-400 dark:text-gray-900
                        "
                      >
                        <ArrowDownCircle size={18} /> Demote
                      </button>
                    )}

                    {/* Deactivate */}
                    <button
                      onClick={() => handleDeactivate(u.id)}
                      className="
                        flex items-center gap-2 px-4 py-2 rounded-lg 
                        w-full sm:w-auto text-sm font-medium 
                        bg-gray-700 dark:bg-gray-200 hover:opacity-80
                        text-red-500 dark:text-gray-900
                      "
                    >
                      <UserX size={18} /> Deactivate
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default UsersList;
