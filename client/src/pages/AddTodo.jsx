import React, { useEffect, useState, useContext } from 'react';
import AppContext from '../context/AppContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Select from '../components/common/Select';

const AddTodo = () => {
  const { axios, editTodo, setEditTodo, fetchTodos } = useContext(AppContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    notes: '',
    date: '',
    category: 'Work',
    priority: 'Moderate',
    status: 'pending',
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editTodo) {
      setForm({
        title: editTodo.title || '',
        description: editTodo.description || '',
        notes: editTodo.notes || '',
        category: editTodo.category || 'Work',
        priority: editTodo.priority || 'Moderate',
        status: editTodo.status || 'pending',
        date: editTodo.date ? editTodo.date.split('T')[0] : '',
      });
    } else {
      clearForm();
    }
  }, [editTodo]);

  const clearForm = () => {
    setForm({
      title: '',
      description: '',
      notes: '',
      category: 'Work',
      priority: 'Moderate',
      status: 'pending',
      date: '',
    });
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return toast.error('Title is required');
    if (!form.description.trim()) return toast.error('Description is required');
    if (!form.date) return toast.error('Date is required');

    try {
      setIsSaving(true);
      const todoData = { ...form };

      const response = editTodo
        ? await axios.put(`/api/v1/todos/${editTodo.id}`, todoData)
        : await axios.post(`/api/v1/todos`, todoData);

      if (response.data.success) {
        toast.success(
          editTodo ? 'Todo updated successfully!' : 'Todo added successfully!'
        );
        clearForm();
        setEditTodo(null);
        await fetchTodos();
        navigate('/');
      } else {
        toast.error(response.data.message || 'Something went wrong');
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        error.response.data.errors.forEach((err) => toast.error(err.msg));
      } else {
        toast.error(error.message || 'Failed to save todo');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const onCancelHandler = () => {
    clearForm();
    setEditTodo(null);
    navigate('/');
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex-1 bg-gray-dark text-secondary h-full overflow-scroll p-4"
    >
      <div className="bg-gray-dark w-full max-w-3xl p-6 md:p-10 shadow rounded mx-auto border border-gray-light">
        <h2 className="text-2xl font-semibold text-primary mb-6">
          {editTodo ? 'Edit Todo' : 'Add New Todo'}
        </h2>

        {editTodo && (
          <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded text-blue-400 text-sm">
            ✏️ Editing: <strong>{editTodo.title}</strong>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={form.title}
            onChange={handleChange('title')}
            placeholder="Enter todo title"
          />
        </div>

        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium">
            Description <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={form.description}
            onChange={handleChange('description')}
            placeholder="Enter description"
          />
        </div>

        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium">
            Notes
          </label>
          <textarea
            value={form.notes}
            onChange={handleChange('notes')}
            placeholder="Enter notes"
            className="w-full p-2 border border-gray-300 rounded bg-gray-dark text-text min-h-[150px]"
          />
        </div>

        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium">
            Date <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={form.date}
            onChange={handleChange('date')}
          />
        </div>

        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium">
            Category
          </label>
          <Select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={[
              { label: 'Work', value: 'Work' },
              { label: 'Personal', value: 'Personal' },
              { label: 'Other', value: 'Other' },
            ]}
          />
        </div>

        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium">
            Priority
          </label>
          <Select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            options={[
              { label: 'Low', value: 'Low' },
              { label: 'Moderate', value: 'Moderate' },
              { label: 'High', value: 'High' },
            ]}
          />
        </div>

        <div className="mb-8">
          <label className="block text-secondary/90 mb-2 font-medium">
            Status
          </label>
          <Select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            options={[
              { label: 'Pending', value: 'pending' },
              { label: 'In Progress', value: 'inProgress' },
              { label: 'Completed', value: 'completed' },
            ]}
          />
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving
              ? editTodo
                ? 'Updating...'
                : 'Adding...'
              : editTodo
                ? 'Update Todo'
                : 'Add Todo'}
          </Button>
          {editTodo && (
            <Button type="button" onClick={onCancelHandler}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default AddTodo;
