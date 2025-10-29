import { useContext } from 'react';
import TodoList from '../components/todos/TodoList';
import AppContext from '../context/AppContext';
import toast from 'react-hot-toast';
import TodoInsights from '../components/TodoInsights';

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
    <div className="flex-1 h-full overflow-scroll p-4 bg-gray-dark  text-white sm:p-6 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <TodoList todos={todos} onUpdateStatus={updateTaskStatus} />
      </div>
      <div className="lg:col-span-1">
        <TodoInsights />
      </div>
    </div>
  );
}
