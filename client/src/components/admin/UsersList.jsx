import { useEffect, useState } from 'react';
import { UserX, UserCheck } from 'lucide-react';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';
import toast from 'react-hot-toast';
import { getAllUsers, deleteUser, updateUser } from '../../services/admin';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllUsers(page, 5);
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
      const data = await updateUser(id, { restore: true });
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

  useEffect(() => {
    fetchUsers();
  }, [page]);

  if (loading) return <Loader />;

  return (
    <div className="flex-1 bg-gray-dark text-gray-200 px-4 sm:px-6 py-6 overflow-y-auto rounded-lg">
      <h3 className="text-xl sm:text-2xl font-semibold mb-6 border-b border-gray-700 pb-2">
        All Users
      </h3>

      {users.length === 0 ? (
        <EmptyState message="No users found" />
      ) : (
        <div className="space-y-4">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex flex-wrap sm:flex-nowrap items-center justify-between bg-gray-800 border border-gray-700 p-4 rounded-xl hover:border-primary/50 transition"
            >
              {/* User Info */}
              <div className="flex-1 min-w-[60%] break-words">
                <p className="font-medium text-white text-base sm:text-lg leading-snug">
                  {u.name}
                </p>
                <p className="text-sm text-gray-400 break-all">{u.email}</p>
                <p className="text-xs text-gray-500 mt-1">Role: {u.role}</p>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 sm:mt-0 flex-shrink-0 w-full sm:w-auto flex justify-end sm:justify-center">
                {u.deletedAt ? (
                  <button
                    onClick={() => handleRestore(u.id)}
                    className="flex items-center justify-center gap-2 text-green-500 hover:text-green-400 bg-gray-700 sm:bg-transparent px-3 py-2 rounded-lg sm:rounded-none w-full sm:w-auto transition"
                  >
                    <UserCheck size={18} />
                    <span className="text-sm font-medium sm:block">
                      Restore
                    </span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleDeactivate(u.id)}
                    className="flex items-center justify-center gap-2 text-red-500 hover:text-red-400 bg-gray-700 sm:bg-transparent px-3 py-2 rounded-lg sm:rounded-none w-full sm:w-auto transition"
                  >
                    <UserX size={18} />
                    <span className="text-sm font-medium sm:block">
                      Deactivate
                    </span>
                  </button>
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
