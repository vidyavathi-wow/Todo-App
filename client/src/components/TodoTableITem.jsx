import toast from 'react-hot-toast';
import { FiTrash2 } from 'react-icons/fi';
import { STATUS_COLORS as COLORS } from '../utils/Constants.jsx';
import AppContext from '../context/AppContext';
import { deleteTodo } from '../services/todos';

const TodoTableItem = ({ todo, fetchTodos, index }) => {
  const { title, status, createdAt, id } = todo;

  const todoDate = new Date(createdAt).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const handleDelete = async () => {
    try {
      const data = await deleteTodo(id);
      if (data.success) {
        toast.success('Todo deleted successfully');
        await fetchTodos();
      } else {
        toast.error(data.message || 'Failed to delete todo');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const statusKey = (status || '').toLowerCase();
  const colorClass = COLORS[statusKey] || 'bg-gray-500';

  return (
    <tr className="border-b border-gray-700 hover:bg-gray-700/30 transition-all">
      <td className="px-2 py-4">{index}</td>
      <td className="px-2 py-4">{title}</td>
      <td className="px-2 py-4 max-sm:hidden">{todoDate}</td>
      <td className="px-2 py-4 max-sm:hidden">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium text-white ${colorClass}`}
        >
          {status}
        </span>
      </td>
      <td className="px-2 mx-auto py-4 text-sm text-center">
        <FiTrash2
          onClick={handleDelete}
          size={20}
          className="text-red-500 cursor-pointer hover:scale-110 transition-transform"
          title="Delete Todo"
        />
      </td>
    </tr>
  );
};

export default TodoTableItem;
