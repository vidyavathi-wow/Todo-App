import React, { useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppContext from '../context/AppContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import { createTodo, updateTodo } from '../services/todos';

const AddTodo = () => {
  const { editTodo, setEditTodo, fetchTodos } = useContext(AppContext);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      notes: '',
      date: '',
      category: 'Work',
      priority: 'Moderate',
      status: 'pending',
    },
  });

  // 🧠 Handle editing mode (convert backend ISO datetime to "YYYY-MM-DDTHH:mm")
  useEffect(() => {
    if (editTodo) {
      Object.entries(editTodo).forEach(([key, value]) => {
        if (key === 'date' && value) {
          const localDate = new Date(value);
          const formatted = localDate.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
          setValue('date', formatted);
        } else if (value !== undefined) {
          setValue(key, value);
        }
      });
    } else {
      reset();
    }
  }, [editTodo, setValue, reset]);

  // 🧩 Form submit handler
  const onSubmitHandler = async (formData) => {
    try {
      // Convert local datetime to UTC before sending (optional but good for reminders)
      const utcDate = new Date(formData.date);
      const todoData = { ...formData, date: utcDate.toISOString() };

      let response;
      if (editTodo) {
        response = await updateTodo(editTodo.id, todoData);
      } else {
        response = await createTodo(todoData);
      }

      if (response.success) {
        toast.success(
          editTodo ? 'Todo updated successfully!' : 'Todo added successfully!'
        );
        setEditTodo(null);
        await fetchTodos();
        navigate('/');
      } else {
        toast.error(response.message || 'Something went wrong');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save todo');
    }
  };

  const onCancelHandler = () => {
    reset();
    setEditTodo(null);
    navigate('/');
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmitHandler)}
      className="flex-1 bg-gray-dark text-secondary h-full overflow-scroll p-4"
    >
      <div className="bg-gray-dark w-full max-w-3xl p-6 md:p-10 shadow-lg rounded-lg mx-auto border border-gray-light">
        <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">
          {editTodo ? 'Edit Todo' : 'Add New Todo'}
        </h2>

        {/* Title */}
        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Enter todo title"
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium">
            Description <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Enter description"
            {...register('description', {
              required: 'Description is required',
            })}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium">
            Notes
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded bg-gray-dark text-text min-h-[150px]"
            placeholder="Enter notes"
            {...register('notes')}
          />
        </div>

        {/* Date-Time Picker */}
        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium">
            Date & Time <span className="text-red-500">*</span>
          </label>
          <Input
            type="datetime-local"
            {...register('date', { required: 'Date and time are required' })}
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>

        {/* Dropdowns */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-secondary/90 mb-2 font-medium">
              Category
            </label>
            <Select
              {...register('category')}
              options={[
                { label: 'Work', value: 'Work' },
                { label: 'Personal', value: 'Personal' },
                { label: 'Other', value: 'Other' },
              ]}
            />
          </div>

          <div>
            <label className="block text-secondary/90 mb-2 font-medium">
              Priority
            </label>
            <Select
              {...register('priority')}
              options={[
                { label: 'Low', value: 'Low' },
                { label: 'Moderate', value: 'Moderate' },
                { label: 'High', value: 'High' },
              ]}
            />
          </div>

          <div>
            <label className="block text-secondary/90 mb-2 font-medium">
              Status
            </label>
            <Select
              {...register('status')}
              options={[
                { label: 'Pending', value: 'pending' },
                { label: 'In Progress', value: 'inProgress' },
                { label: 'Completed', value: 'completed' },
              ]}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? editTodo
                ? 'Updating...'
                : 'Adding...'
              : editTodo
                ? 'Update Todo'
                : 'Add Todo'}
          </Button>

          {editTodo && (
            <Button
              type="button"
              onClick={onCancelHandler}
              className="bg-gray-700"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default AddTodo;
