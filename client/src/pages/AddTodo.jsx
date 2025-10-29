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

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('Work');
  const [priority, setPriority] = useState('Moderate');
  const [status, setStatus] = useState('pending');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editTodo) {
      setTitle(editTodo.title || '');
      setDescription(editTodo.description || '');
      setNotes(editTodo.notes || '');
      setCategory(editTodo.category || 'Work');
      setPriority(editTodo.priority || 'Moderate');
      setStatus(editTodo.status || 'pending');
      setDate(editTodo.date ? editTodo.date.split('T')[0] : '');
    } else {
      clearForm();
    }
  }, [editTodo]);

  const clearForm = () => {
    setTitle('');
    setDescription('');
    setNotes('');
    setCategory('Work');
    setPriority('Moderate');
    setStatus('pending');
    setDate('');
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error('Title is required');
    if (!description.trim()) return toast.error('Description is required');
    if (!date) return toast.error('Date is required');

    try {
      setIsSaving(true);
      const todoData = {
        title,
        description,
        notes,
        date,
        category,
        priority,
        status,
      };

      let response;
      if (editTodo) {
        response = await axios.put(`/api/v1/todos/${editTodo.id}`, todoData);
      } else {
        response = await axios.post(`/api/v1/todos`, todoData);
      }

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
      toast.error(error.response?.data?.message || 'Failed to save todo');
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter todo title"
          />
        </div>

        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium">
            Description <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter description"
          />
        </div>

        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
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
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium">
            Category
          </label>
          <Select
            value={category}
            onChange={setCategory}
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
            value={priority}
            onChange={setPriority}
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
            value={status}
            onChange={setStatus}
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
