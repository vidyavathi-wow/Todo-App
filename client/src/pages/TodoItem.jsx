import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Trash } from 'lucide-react';
import AppContext from '../context/AppContext';
import toast from 'react-hot-toast';
import TodoHeader from '../components/todoItem/TodoHeader';
import TodoContent from '../components/todoItem/TodoContent';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { getTodoById, deleteTodo, updateTodoStatus } from '../services/todos';

export default function TodoItem() {
  const { todoId } = useParams();
  const { setEditTodo, fetchTodos, user } = useContext(AppContext);
  const navigate = useNavigate();

  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const canModify =
    todo && (todo.userId === user.id || todo.assignedToUserId === user.id);

  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const data = await getTodoById(todoId);
        if (data.success) {
          setTodo(data.todo);
        } else {
          toast.error(data.message || 'Failed to load todo');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch todo');
      } finally {
        setLoading(false);
      }
    };
    fetchTodo();
  }, [todoId]);

  const updateStatus = async (newStatus) => {
    if (!todo || !canModify) {
      toast.error("You can't update this task");
      return;
    }

    try {
      setUpdatingStatus(true);
      const data = await updateTodoStatus(todoId, { status: newStatus });

      if (data.success) {
        setTodo((prev) => ({ ...prev, status: newStatus }));
        toast.success('Status updated');
        fetchTodos();
      } else {
        toast.error(data.message || 'Failed to update');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating todo');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEdit = () => {
    if (!canModify) {
      toast.error('You cannot edit this task');
      return;
    }
    setEditTodo(todo);
    navigate('/addTodo');
  };

  const handleDelete = async () => {
    if (!canModify) {
      toast.error('You cannot delete this task');
      return;
    }

    try {
      const data = await deleteTodo(todoId);
      if (data.success) {
        toast.success('Todo deleted');
        fetchTodos();
        navigate(-1);
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete todo');
    }
  };

  if (loading) return <Loader />;
  if (!todo) return <EmptyState message="Todo not found" />;

  return (
    <div
      className="
        flex-1 bg-gray-dark text-secondary h-full overflow-scroll p-6
        dark:bg-gray-50 dark:text-gray-900
      "
    >
      <div className="flex flex-col overflow-auto">
        {/* HEADER — disable status change if no permission */}
        <TodoHeader
          todo={todo}
          updatingStatus={updatingStatus}
          onStatusChange={(e) => updateStatus(e.target.value)}
          disabled={!canModify}
        />

        {/* Assignee chip */}
        <div className="mt-3">
          <span className="text-sm text-secondary/80 dark:text-gray-700">
            Assigned To:{' '}
            <span
              className="
                inline-flex items-center px-2 py-1 rounded-full 
                bg-gray-700 border border-gray-600
                dark:bg-gray-200 dark:border-gray-300 dark:text-gray-900
              "
            >
              {todo?.assignee?.name
                ? `${todo.assignee.name} (${todo.assignee.email})`
                : todo?.assignedToUserId
                  ? `User #${todo.assignedToUserId}`
                  : 'Unassigned'}
            </span>
          </span>
        </div>

        {/* Main card */}
        <div
          className="
            mt-6 bg-linear-to-br from-gray-800 via-gray-900 to-black 
            border border-gray-700 rounded-2xl p-8 shadow-lg 
            hover:shadow-xl transition-all duration-300 relative
            dark:from-white dark:via-gray-100 dark:to-gray-200 
            dark:border-gray-300
          "
        >
          <TodoContent todo={todo} />

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-4 mt-8">
            {/* EDIT button */}
            {canModify && (
              <Button
                onClick={handleEdit}
                noDefault
                className="
                  flex items-center gap-2 bg-blue-500 hover:bg-blue-400 
                  text-white text-sm font-medium px-4 py-2 rounded-lg 
                  shadow-md transition
                "
              >
                <Edit size={18} />
                Edit
              </Button>
            )}

            {/* DELETE button */}
            {canModify && (
              <Button
                noDefault
                onClick={handleDelete}
                className="
                  flex items-center gap-2 bg-red-500 hover:bg-red-400 
                  text-white text-sm font-medium px-4 py-2 rounded-lg 
                  shadow-md transition
                "
              >
                <Trash size={18} />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
