import { useContext, useEffect, useState } from 'react';
import { FiCheckCircle, FiClock, FiPlay, FiList } from 'react-icons/fi';
import AppContext from '../context/AppContext';
import TodoTableItem from '../components/TodoTableITem';
const LatestTodos = () => {
  const { axios, fetchTodos } = useContext(AppContext);
  const [overviewData, setoverviewData] = useState({
    completed: 0,
    inProgress: 0,
    pending: 0,
    recentTodos: [],
  });

  const fetchDashboard = async () => {
    try {
      const { data } = await axios.get('/api/v1/todos/data/dashboard');
      if (data.success) {
        setoverviewData(data.overviewData);
        fetchTodos();
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const stats = [
    {
      icon: <FiCheckCircle className="text-2xl text-primary" />,
      label: 'Completed',
      value: overviewData.completed ? overviewData.completed : 0,
    },
    {
      icon: <FiClock className="text-2xl text-primary" />,
      label: 'In Progress',
      value: overviewData.inProgress ? overviewData.inProgress : 0,
    },
    {
      icon: <FiPlay className="text-2xl text-primary" />,
      label: 'Pending',
      value: overviewData.pending ? overviewData.pending : 0,
    },
  ];

  return (
    <div className="flex-1 p-4 md:p-10 bg-gray-900 text-gray-200">
      <div className="flex flex-wrap gap-4">
        {stats.map(({ icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-4 bg-gray-800 p-4 min-w-58 rounded shadow cursor-pointer hover:scale-105 transition-all"
          >
            {icon}
            <div>
              <p className="text-xl font-semibold text-gray-100">{value}</p>
              <p className="text-gray-400 font-light">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center m-4 mt-6 gap-3 text-gray-200">
          <FiList className="text-xl text-primary" />
          <p>Latest Todos</p>
        </div>

        <div className="relative max-w-4xl overflow-x-auto shadow rounded-lg scrollbar-hide bg-gray-800">
          <table className="w-full text-sm text-gray-200">
            <thead className="w-full text-sm text-gray-400 text-left uppercase border-b border-gray-700">
              <tr>
                <th scope="col" className="px-2 py-4 xl:px-6">
                  #
                </th>
                <th scope="col" className="px-2 py-4 xl:px-6">
                  title
                </th>
                <th scope="col" className="px-2 py-4 xl:px-6 max-sm:hidden">
                  Date
                </th>
                <th scope="col" className="px-2 py-4 xl:px-6 max-sm:hidden">
                  Status
                </th>
                <th scope="col" className="px-2 py-4 xl:px-6">
                  Delete
                </th>
              </tr>
            </thead>
            <tbody>
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
        </div>
      </div>
    </div>
  );
};

export default LatestTodos;
