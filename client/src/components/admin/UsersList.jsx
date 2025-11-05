import { useEffect, useState, useContext } from 'react';
import AppContext from '../../context/AppContext';
import { UserX, UserCheck } from 'lucide-react';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';
import toast from 'react-hot-toast';

const UsersList = () => {
  const { axios } = useContext(AppContext);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `/api/v1/admin/users?page=${page}&limit=5`
      );
      if (data.success) {
        setUsers(data.users);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this user?'))
      return;
    try {
      const { data } = await axios.delete(`/api/v1/admin/users/${id}`);
      if (data.success) {
        toast.success(data.message);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate user');
    }
  };

  const handleRestore = async (id) => {
    try {
      const { data } = await axios.put(`/api/v1/admin/users/${id}/restore`);
      if (data.success) {
        toast.success(data.message);
        fetchUsers();
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
    <div>
      <h3 className="text-xl font-semibold mb-4">All Users</h3>
      {users.length === 0 ? (
        <EmptyState message="No users found" />
      ) : (
        <div className="space-y-4">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between bg-gray-800 border border-gray-700 p-4 rounded-xl"
            >
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-sm text-gray-400">{u.email}</p>
                <p className="text-xs text-gray-500">Role: {u.role}</p>
              </div>

              {u.deletedAt ? (
                // Restore button for deactivated users
                <button
                  onClick={() => handleRestore(u.id)}
                  className="flex items-center gap-2 text-green-500 hover:text-green-400"
                >
                  <UserCheck size={20} />
                  <span className="text-sm">Restore</span>
                </button>
              ) : (
                // Deactivate button for active users
                <button
                  onClick={() => handleDeactivate(u.id)}
                  className="flex items-center gap-2 text-red-500 hover:text-red-400"
                >
                  <UserX size={20} />
                  <span className="text-sm">Deactivate</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default UsersList;
