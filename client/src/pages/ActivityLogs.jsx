import { useEffect, useState } from 'react';
import { FiClock } from 'react-icons/fi';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import { getActivityLogs } from '../services/activitylogs';
import toast from 'react-hot-toast';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getActivityLogs(page, 3);
      if (data.success) {
        setLogs(data.logs || []);
        setTotalPages(data.totalPages || 1);
      } else {
        toast.error(data.message || 'Failed to load activity logs');
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  return (
    <div className="flex-1 bg-gray-900 text-white px-6 md:px-12 py-10 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">
        Activity Logs
      </h2>

      {loading ? (
        <Loader />
      ) : logs.length === 0 ? (
        <EmptyState message="No activities yet" />
      ) : (
        <>
          <div className="space-y-4">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-4 bg-gray-800 border border-gray-700 p-4 rounded-xl hover:border-primary/50 transition"
              >
                <div className="p-2 bg-primary/20 text-primary rounded-full">
                  <FiClock size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-base font-medium">{log.action}</p>
                  {log.details && (
                    <p className="text-sm text-gray-400 mt-1">{log.details}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

export default ActivityLogs;
