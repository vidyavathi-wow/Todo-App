import { useContext } from 'react';
import TodoList from '../components/todos/TodoList';
import AppContext from '../context/AppContext';
import Calendar from '../components/Calender';
import TodaysTodos from '../components/TodaysTodos';
import toast from 'react-hot-toast';
import { updateTodoStatus } from '../services/todos';

export default function Dashboard() {
  const { todos, fetchTodos, user } = useContext(AppContext);

  const handleUpdateStatus = async (todo) => {
    try {
      const data = await updateTodoStatus(todo.id, {});
      if (data.success) {
        toast.success('Todo status updated');
        fetchTodos();
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating status');
    }
  };

  return (
    <div
      className="flex-1 h-full overflow-y-auto p-4 sm:p-6 md:p-8 
                 bg-gray-dark dark:bg-gray-100 
                 text-white dark:text-gray-900 
                 transition-colors duration-300 ease-in-out"
    >
      <div className="lg:col-span-2 transition-transform duration-500 ease-in-out hover:scale-[1.01]">
        <div className="lg:col-span-3 mb-4 flex justify-between items-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white dark:text-gray-900">
            👋 Welcome,{' '}
            <span className="text-primary">{user?.name || 'User'}</span>!
          </h2>
        </div>

        <TodoList todos={todos} onUpdateStatus={handleUpdateStatus} />
      </div>

          <TodoList todos={todos} onUpdateStatus={handleUpdateStatus} />
        </div>
        <div
          className="lg:col-span-1 flex flex-col gap-6 
                     overflow-visible lg:overflow-y-auto 
                     max-h-full sm:max-h-[80vh] 
                     transition-transform duration-500 ease-in-out"
        >
          <div className="transition-transform duration-500 ease-in-out hover:scale-[1.02]">
            <Calendar />
          </div>
          <div className="transition-transform duration-500 ease-in-out hover:scale-[1.02]">
            <TodaysTodos />
          </div>
        </div>
      </div>
    </div>
  );
}
