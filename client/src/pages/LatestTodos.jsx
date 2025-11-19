import { useContext, useEffect, useState } from 'react';
import { FiCheckCircle, FiClock, FiPlay, FiList } from 'react-icons/fi';
import AppContext from '../context/AppContext';
import TodoTableItem from '../components/TodoTableITem';
import EmptyState from '../components/common/EmptyState';
import Loader from '../components/common/Loader';
import { getDashboardData } from '../services/todos';

const LatestTodos = () => {
  const { fetchTodos, todos, user } = useContext(AppContext);
  const [recentTodos, setRecentTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  const uid = user?.id;

  // 📌 All todos that belong to logged-in user (created or assigned)
  const userTodos = todos.filter(
    (t) => t.userId === uid || t.assignedToUserId === uid
  );

  // 📌 STATS based on userTodos only
  const stats = {
    completed: userTodos.filter((t) => t.status === 'completed').length,
    inProgress: userTodos.filter((t) => t.status === 'inProgress').length,
    pending: userTodos.filter((t) => t.status === 'pending').length,
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const data = await getDashboardData();

      if (data.success) {
        //  FIXED: Filter recent todos WITH creator + assigned user conditions
        const filtered = (data.recentTodos || []).filter(
          (t) => t.userId === uid || t.assignedToUserId === uid
        );

        setRecentTodos(filtered);

        // refresh global todos
        await fetchTodos();
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

  return (
    <div className="flex-1 p-4 md:p-10 bg-gray-900 dark:bg-gray-50 text-gray-200 dark:text-gray-900 transition-colors duration-300 overflow-y-auto">
      {/* STATS */}
      <div className="flex flex-wrap gap-4 mb-8">
        {[
          {
            icon: <FiCheckCircle className="text-2xl text-primary" />,
            label: 'Completed',
            value: stats.completed,
          },
          {
            icon: <FiClock className="text-2xl text-primary" />,
            label: 'In Progress',
            value: stats.inProgress,
          },
          {
            icon: <FiPlay className="text-2xl text-primary" />,
            label: 'Pending',
            value: stats.pending,
          },
        ].map(({ icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-4 bg-gray-800 dark:bg-white shadow-md hover:shadow-lg min-w-[180px] p-5 rounded-lg border border-gray-700 dark:border-gray-200 hover:scale-[1.03] transition-all"
          >
            {icon}
            <div>
              <p className="text-2xl font-semibold">{value}</p>
              <p className="text-gray-400 dark:text-gray-600 font-light">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* LATEST TODOS */}
      <div>
        <div className="flex items-center m-4 mt-6 gap-3">
          <FiList className="text-xl text-primary" />
          <p className="text-lg font-semibold">Latest Todos</p>
        </div>

        <div className="relative w-full overflow-x-auto shadow-lg rounded-lg bg-gray-800 dark:bg-white border dark:border-gray-200 max-h-[500px]">
          {loading ? (
            <Loader />
          ) : recentTodos.length === 0 ? (
            <EmptyState message="No recent todos found" />
          ) : (
            <table className="w-full text-sm">
              <thead className="text-gray-400 dark:text-gray-600 text-left uppercase border-b">
                <tr>
                  <th className="px-3 py-4">#</th>
                  <th className="px-3 py-4">Title</th>
                  <th className="px-2 py-4 max-sm:hidden">Assigned To</th>
                  <th className="px-2 py-4 max-sm:hidden">Date</th>
                  <th className="px-3 py-4 max-sm:hidden">Status</th>
                  <th className="px-3 py-4">Delete</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {recentTodos.map((todo, i) => (
                  <TodoTableItem
                    key={todo.id}
                    todo={todo}
                    index={i + 1}
                    fetchTodos={fetchDashboard}
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
