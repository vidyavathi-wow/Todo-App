import { useEffect, useState, useContext } from 'react';
import AppContext from '../../context/AppContext';
import Loader from '../common/Loader';
import EmptyState from '../common/EmptyState';
import Pagination from '../common/Pagination';
import toast from 'react-hot-toast';

const ActivityLogs = () => {
  const { axios } = useContext(AppContext);
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `/api/v1/admin/activitylogs?page=${page}&limit=5`
      );
      if (data.success) {
        setLogs(data.logs);
        setTotalPages(data.totalPages);
      }
    } catch (err) {
      console.error(err);
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
    <div>
      <h3 className="text-xl font-semibold mb-4">Recent Activity Logs</h3>
      {logs.length === 0 ? (
        <EmptyState message="No activity logs yet" />
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-gray-800 border border-gray-700 p-4 rounded-xl"
            >
              <p className="font-medium">{log.action}</p>
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

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
};

export default ActivityLogs;
