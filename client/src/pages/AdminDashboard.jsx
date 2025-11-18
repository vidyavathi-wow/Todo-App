import React, { useEffect, useState } from 'react';
import UserCard from '../components/admin/UserCard';
import UserDetailsDrawer from '../components/admin/UserDetailsDrawer';
import Loader from '../components/common/Loader';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import { getAllUsers } from '../services/admin';
import AppContext from '../context/AppContext';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchUsers = async (p = page) => {
    setLoading(true);
    try {
      const res = await getAllUsers(p, 12);
      if (res.success) {
        setUsers(res.users || []);
        setTotalPages(res.totalPages || 1);
      } else {
        toast.error(res.message || 'Failed to load users');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

  const openUser = (u) => {
    setSelectedUserId(u.id);
    setDrawerOpen(true);
  };

  const onDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedUserId(null);
  };

  const onUpdated = () => {
    // refresh list after actions performed in drawer
    fetchUsers(page);
  };

  if (loading) return <Loader />;

  return (
    <div className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 md:px-12 py-10 overflow-y-auto transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 dark:border-gray-300 pb-2">
        Admin Dashboard
      </h2>

      {users.length === 0 ? (
        <EmptyState message="No users found" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((u) => (
            <div key={u.id}>
              <UserCard user={u} onClick={() => openUser(u)} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
        />
      </div>

      <UserDetailsDrawer
        userId={selectedUserId}
        open={drawerOpen}
        onClose={onDrawerClose}
        onUpdated={onUpdated}
      />
    </div>
  );
};

export default AdminDashboard;
