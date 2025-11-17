import React, { useEffect, useState, useContext } from 'react';
import {
  X,
  ArrowUpCircle,
  ArrowDownCircle,
  UserX,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Loader from '../common/Loader';
import {
  getUserDetails,
  deactivateUser,
  activateUser,
  promoteUser,
  demoteUser,
} from '../../services/admin';
import AppContext from '../../context/AppContext';

export default function UserDetailsDrawer({
  userId,
  open,
  onClose,
  onUpdated,
}) {
  const { user: currentUser } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (open && userId) fetchDetails();
    if (!open) setDetails(null);
  }, [open, userId]);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await getUserDetails(userId);
      if (res.success) {
        setDetails(res);
      } else {
        toast.error(res.message || 'Failed to fetch user details');
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to fetch user details'
      );
    } finally {
      setLoading(false);
    }
  };

  const isSelf = currentUser?.id === details?.user?.id;

  const handleDeactivate = async () => {
    if (!details) return;
    if (!window.confirm('Are you sure you want to deactivate this user?'))
      return;

    setActionLoading(true);
    try {
      const res = await deactivateUser(details.user.id);
      if (res.success) {
        toast.success(res.message);
        onUpdated?.();
        fetchDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!details) return;

    setActionLoading(true);
    try {
      const res = await activateUser(details.user.id);
      if (res.success) {
        toast.success(res.message);
        onUpdated?.();
        fetchDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to activate user');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePromote = async () => {
    if (!details) return;

    setActionLoading(true);
    try {
      const res = await promoteUser(details.user.id);
      if (res.success) {
        toast.success(res.message);
        onUpdated?.();
        fetchDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to promote user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDemote = async () => {
    if (!details) return;

    setActionLoading(true);
    try {
      const res = await demoteUser(details.user.id);
      if (res.success) {
        toast.success(res.message);
        onUpdated?.();
        fetchDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to demote admin');
    } finally {
      setActionLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      ></div>

      {/* Centered Modal */}
      <div
        className="
        relative z-50 
        w-[90%] max-w-lg
        bg-gray-900 dark:bg-white 
        text-white dark:text-gray-900
        p-6 rounded-2xl shadow-xl 
        max-h-[85vh] overflow-y-auto
        animate-fadeIn
      "
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">User Details</h2>
          <button onClick={onClose}>
            <X className="text-white dark:text-gray-900" />
          </button>
        </div>

        {loading || !details ? (
          <Loader />
        ) : (
          <>
            {/* User Info */}
            <div className="space-y-2">
              <p className="text-lg font-semibold">{details.user.name}</p>
              <p className="text-sm text-gray-400 dark:text-gray-700">
                {details.user.email}
              </p>

              <p className="text-xs">Role: {details.user.role}</p>

              <p className="text-xs">
                Status:{' '}
                {details.user.deletedAt ? (
                  <span className="text-red-400">Inactive</span>
                ) : (
                  <span className="text-green-400">Active</span>
                )}
              </p>

              {/* NEW — Todo Stats */}
              <div className="mt-3 space-y-1 text-xs">
                <p className="text-xs">
                  Todos: {details.stats?.todosCount ?? 0}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-4">
              {!isSelf && !details.user.deletedAt && (
                <button
                  disabled={actionLoading}
                  onClick={handleDeactivate}
                  className="px-4 py-2 bg-red-600 rounded-md"
                >
                  <UserX size={16} /> Deactivate
                </button>
              )}

              {!isSelf && details.user.deletedAt && (
                <button
                  disabled={actionLoading}
                  onClick={handleActivate}
                  className="px-4 py-2 bg-green-600 rounded-md"
                >
                  <UserCheck size={16} /> Activate
                </button>
              )}

              {!isSelf &&
                details.user.role !== 'admin' &&
                !details.user.deletedAt && (
                  <button
                    disabled={actionLoading}
                    onClick={handlePromote}
                    className="px-4 py-2 bg-blue-600 rounded-md"
                  >
                    <ArrowUpCircle size={16} /> Promote
                  </button>
                )}

              {!isSelf &&
                details.user.role === 'admin' &&
                !details.user.deletedAt && (
                  <button
                    disabled={actionLoading}
                    onClick={handleDemote}
                    className="px-4 py-2 bg-yellow-500 rounded-md"
                  >
                    <ArrowDownCircle size={16} /> Demote
                  </button>
                )}

              {isSelf && (
                <p className="text-xs text-gray-400 mt-2">
                  You cannot modify your own account.
                </p>
              )}
            </div>

            {/* Recent Activity */}
            <div className="mt-5">
              <h4 className="font-semibold mb-1">Recent Activity</h4>

              {details.logs?.length ? (
                <div className="space-y-2">
                  {details.logs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-gray-800 dark:bg-gray-100 rounded-md"
                    >
                      <p className="text-sm">{log.action}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No recent activity</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
