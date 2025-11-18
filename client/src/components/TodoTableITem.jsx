import { FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { deleteTodo } from '../services/todos';

const TodoTableItem = ({ todo, fetchTodos, index }) => {
  const dateObj = todo?.date
    ? new Date(todo.date)
    : todo?.createdAt
      ? new Date(todo.createdAt)
      : null;

  const formattedDate =
    dateObj && !isNaN(dateObj)
      ? dateObj.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '-';

  // Get Assigned User
  const assignee =
    todo?.assignee?.name ||
    (todo?.assignedToUserId
      ? `User #${todo.assignedToUserId}`
      : 'Not Assigned');

  const handleDelete = async () => {
    try {
      const res = await deleteTodo(todo.id);
      if (res.success) {
        toast.success('Todo deleted successfully');
        fetchTodos();
      } else {
        toast.error(res.message || 'Delete failed');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting todo');
    }
  };

  return (
    <tr className="border-b border-gray-700 hover:bg-gray-500 transition-all">
      <td className="px-2 py-4 xl:px-6 text-gray-600">{index}</td>

      <td className="px-2 dark:text-gray-800 py-4 xl:px-6 font-medium text-gray-100">
        {todo.title}
      </td>

      <td className="px-2 py-4 xl:px-6 max-sm:hidden">
        <span className="text-primary">{assignee}</span>
      </td>

      <td className="px-2 py-4 xl:px-6 max-sm:hidden">{formattedDate}</td>

      <td className="px-2 py-4 xl:px-6 max-sm:hidden capitalize">
        {todo.status}
      </td>

      <td className="px-2 py-4 xl:px-6">
        <button
          onClick={handleDelete}
          className="text-red-400 hover:text-red-500 transition"
        >
          <FiTrash2 size={18} />
        </button>
      </td>
    </tr>
  );
};

export default TodoTableItem;
