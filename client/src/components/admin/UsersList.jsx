import { useEffect, useState, useContext } from 'react';
import AppContext from '../../context/AppContext';
import { FiTrash2 } from 'react-icons/fi';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import Pagination from './Pagination';
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
        `/api/v1/admin/users?page=${page}&limit=2`
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const { data } = await axios.delete(`/api/v1/admin/users/${id}`);
      if (data.success) {
        toast.success(data.message);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
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
              <button
                onClick={() => handleDelete(u.id)}
                className="text-red-500 hover:text-red-400"
              >
                <FiTrash2 size={20} />
              </button>
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
