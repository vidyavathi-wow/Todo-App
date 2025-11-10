import { useEffect, useState } from 'react';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';
import toast from 'react-hot-toast';
import { getActivityLogs } from '../../services/admin';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getActivityLogs(page, 5);
      if (data.success) {
        setLogs(data.logs || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error(data.message || 'Failed to load logs');
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
      toast.error('Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  if (loading) return <Loader />;

  return (
    <div className="flex-1 bg-gray-dark text-gray-200 px-4 sm:px-6 py-6 overflow-y-auto rounded-lg">
      <h3 className="text-xl sm:text-2xl font-semibold mb-6 border-b border-gray-700 pb-2">
        Recent Activity Logs
      </h3>

      {logs.length === 0 ? (
        <EmptyState message="No activity logs yet" />
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-gray-800 border border-gray-700 p-4 rounded-xl hover:border-primary/50 transition break-words whitespace-pre-wrap"
            >
              <p className="font-medium text-white text-base sm:text-lg leading-snug">
                {log.action}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                By: {log.user?.name || 'Unknown User'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(log.timestamp).toLocaleString()}
              </p>
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

export default ActivityLogs;
