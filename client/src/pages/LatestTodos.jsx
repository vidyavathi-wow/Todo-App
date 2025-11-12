import { useContext, useEffect, useState } from 'react';
import { FiCheckCircle, FiClock, FiPlay, FiList } from 'react-icons/fi';
import AppContext from '../context/AppContext';
import TodoTableItem from '../components/TodoTableITem';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';
import { getDashboardData } from '../services/todos';

const LatestTodos = () => {
  const { fetchTodos } = useContext(AppContext);
  const [overviewData, setOverviewData] = useState({
    completed: 0,
    inProgress: 0,
    pending: 0,
    recentTodos: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const data = await getDashboardData();
      if (data.success) {
        setOverviewData({
          ...data.overviewData,
          recentTodos: data.recentTodos || [],
        });
        fetchTodos();
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = [
    {
      icon: <FiCheckCircle className="text-2xl text-primary" />,
      label: 'Completed',
      value: overviewData.completed || 0,
    },
    {
      icon: <FiClock className="text-2xl text-primary" />,
      label: 'In Progress',
      value: overviewData.inProgress || 0,
    },
    {
      icon: <FiPlay className="text-2xl text-primary" />,
      label: 'Pending',
      value: overviewData.pending || 0,
    },
  ];

  return (
    <div className="flex-1 p-4 md:p-10 bg-gray-900 dark:bg-gray-50 text-gray-200 dark:text-gray-900 transition-colors duration-300">
      {/* ✅ Stats Overview */}
      <div className="flex flex-wrap gap-4 mb-8">
        {stats.map(({ icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-4 bg-gray-800 dark:bg-white shadow-md hover:shadow-lg min-w-[180px] p-5 rounded-lg border border-gray-700 dark:border-gray-200 cursor-pointer hover:scale-[1.03] transition-all duration-200"
          >
            {icon}
            <div>
              <p className="text-2xl font-semibold text-gray-100 dark:text-gray-800">
                {value}
              </p>
              <p className="text-gray-400 dark:text-gray-600 font-light">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Latest Todos Section */}
      <div>
        <div className="flex items-center m-4 mt-6 gap-3 text-gray-200 dark:text-gray-800">
          <FiList className="text-xl text-primary" />
          <p className="text-lg font-semibold">Latest Todos</p>
        </div>

        <div className="relative max-w-4xl overflow-x-auto shadow-lg rounded-lg scrollbar-hide bg-gray-800 dark:bg-white border border-gray-700 dark:border-gray-200 transition-colors duration-300">
          {loading ? (
            <Loader />
          ) : overviewData.recentTodos.length === 0 ? (
            <EmptyState message="No recent todos found" />
          ) : (
            <table className="w-full text-sm text-gray-200 dark:text-gray-800">
              <thead className="text-gray-400 dark:text-gray-600 text-left uppercase border-b border-gray-700 dark:border-gray-300 bg-gray-900/70 dark:bg-gray-100/60">
                <tr>
                  <th scope="col" className="px-3 py-4 xl:px-6"></th>
                  <th scope="col" className="px-3 py-4 xl:px-6">
                    Title
                  </th>
                  {/* This was the broken line that I removed:
                  <th scope="col" className="px-3 py-4 xl:px-6 max-sm:hidden"> 
                  */}
                  <th scope="col" className="px-2 py-4 xl:px-6">
                    Assigned To
                  </th>
                  <th scope="col" className="px-2 py-4 xl:px-6 max-sm:hidden">
                    Date
                  </th>
                  <th scope="col" className="px-3 py-4 xl:px-6 max-sm:hidden">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-4">
                    Delete
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700 dark:divide-gray-200">
                {overviewData.recentTodos.map((todo, index) => (
                  <TodoTableItem
                    key={todo.id}
                    todo={todo}
                    fetchTodos={fetchDashboard}
                    index={index + 1}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LatestTodos;