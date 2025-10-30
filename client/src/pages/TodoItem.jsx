import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Trash } from 'lucide-react';
import AppContext from '../context/AppContext';
import toast from 'react-hot-toast';
import TodoHeader from '../components/todoItem/TodoHeader';
import TodoContent from '../components/todoItem/TodoContent';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
export default function TodoItem() {
  const { todoId } = useParams();
  const { axios, setEditTodo, fetchTodos } = useContext(AppContext);
  const navigate = useNavigate();

  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const { data } = await axios.get(`/api/v1/todos/${todoId}`);
        if (data.success) setTodo(data.todo);
        else toast.error(data.message);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to fetch todo');
      } finally {
        setLoading(false);
      }
    };
    fetchTodo();
  }, [todoId, axios]);

  const updateTodoStatus = async (newStatus) => {
    if (!todo) return;
    try {
      setUpdatingStatus(true);
      const { data } = await axios.put(`/api/v1/todos/${todoId}`, {
        status: newStatus,
      });
      if (data.success) {
        setTodo((prev) => ({ ...prev, status: newStatus }));
        toast.success('Status updated');
        fetchTodos();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => toast.error(err.msg));
      } else {
        toast.error(error.message || 'Failed to save todo');
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleEdit = () => {
    setEditTodo(todo);
    navigate('/addTodo');
  };

  const handleDelete = async () => {
    try {
      const { data } = await axios.delete(`/api/v1/todos/${todoId}`);
      if (data.success) {
        toast.success('Todo deleted');
        window.history.back();
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete todo');
    }
  };

  if (loading) return <Loader />;
  if (!todo) return <EmptyState />;

  return (
    <div className="flex-1 bg-gray-dark text-secondary h-full overflow-scroll p-6">
      <div className="flex flex-col overflow-auto">
        <TodoHeader
          todo={todo}
          updatingStatus={updatingStatus}
          onStatusChange={(e) => updateTodoStatus(e.target.value)}
        />
        <div className="mt-6 bg-linear-to-br from-gray-800 via-gray-900 to-black border border-gray-700 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative">
          <TodoContent todo={todo} />
          <div className="flex justify-end gap-4 mt-8">
            <Button
              onClick={handleEdit}
              noDefault
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-400 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-md transition"
            >
              <Edit size={18} />
              Edit
            </Button>

            <Button
              noDefault
              onClick={handleDelete}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-md transition"
            >
              <Trash size={18} />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
