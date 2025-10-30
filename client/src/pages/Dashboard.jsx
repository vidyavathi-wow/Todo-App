import { useContext } from 'react';
import TodoList from '../components/todos/TodoList';
import AppContext from '../context/AppContext';
import toast from 'react-hot-toast';
import TodoInsights from '../components/TodoInsights';
import Calendar from '../components/Calender';
import TodaysTodos from '../components/TodaysTodos';

export default function Dashboard() {
  const { todos, axios, fetchTodos } = useContext(AppContext);

  const updateTaskStatus = async (todo) => {
    try {
      const { data } = await axios.put(`/api/v1/todos/${todo.id}`, {});
      if (data.success) {
        toast.success('Todo status updated');
        fetchTodos();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div
      className="flex-1 h-full overflow-scroll p-4 bg-gray-dark text-white sm:p-6 md:p-8 
                    grid grid-cols-1 lg:grid-cols-3 gap-6 transition-all duration-500 ease-in-out"
    >
      <div className="lg:col-span-2 transition-transform duration-500 ease-in-out hover:scale-[1.01]">
        <TodoList todos={todos} onUpdateStatus={updateTaskStatus} />
      </div>
      <div className="lg:col-span-1 overflow-y-auto max-h-[80vh] pr-2 space-y-6">
        <div className="transition-transform duration-500 ease-in-out hover:scale-[1.02]">
          <Calendar />
        </div>
        <div className="transition-transform duration-500 ease-in-out hover:scale-[1.02]">
          <TodaysTodos />
        </div>
      </div>
    </div>
  );
}
