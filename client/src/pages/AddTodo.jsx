import { useEffect, useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppContext from '../context/AppContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import { createTodo, updateTodo } from '../services/todos';

const AddTodo = () => {
  const { editTodo, setEditTodo, fetchTodos, users, user } =
    useContext(AppContext);
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
      assignedToUserId: '',
      reminderBeforeMinutes: 10,
    },
  });

  const [minDateTime, setMinDateTime] = useState(
    new Date().toISOString().slice(0, 16)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMinDateTime(new Date().toISOString().slice(0, 16));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (editTodo) {
      Object.entries(editTodo).forEach(([key, value]) => {
        if (key === 'date' && value) {
          const formatted = new Date(value).toISOString().slice(0, 16);
          setValue('date', formatted);
        } else if (key === 'assignee' && value) {
          setValue('assignedToUserId', value.id);
        } else if (value !== undefined) {
          setValue(key, value);
        }
      });
    } else {
      reset();
    }
  }, [editTodo, setValue, reset]);

  const onSubmitHandler = async (formData) => {
    try {
      const payload = {
        ...formData,
        userId: user.id,
        assignedToUserId: formData.assignedToUserId || null,
        reminded: false,
        date: new Date(formData.date).toISOString(),
      };

      const response = editTodo
        ? await updateTodo(editTodo.id, payload)
        : await createTodo(payload);

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

        {/* Date & Time */}
        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium">
            Date & Time <span className="text-red-500">*</span>
          </label>
          <Input
            type="datetime-local"
            min={minDateTime}
            {...register('date', { required: 'Date & time are required' })}
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>

        {/* Reminder Before */}
        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium">
            Remind Me Before
          </label>
          <Select
            {...register('reminderBeforeMinutes')}
            options={[
              { label: '10 minutes', value: 10 },
              { label: '30 minutes', value: 30 },
              { label: '1 hour', value: 60 },
              { label: '1 day', value: 1440 },
            ]}
          />
        </div>

        {/* Dropdowns */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            {...register('category')}
            label="Category"
            options={[
              { label: 'Work', value: 'Work' },
              { label: 'Personal', value: 'Personal' },
              { label: 'Other', value: 'Other' },
            ]}
          />
          <Select
            {...register('priority')}
            label="Priority"
            options={[
              { label: 'Low', value: 'Low' },
              { label: 'Moderate', value: 'Moderate' },
              { label: 'High', value: 'High' },
            ]}
          />
          <Select
            {...register('status')}
            label="Status"
            options={[
              { label: 'Pending', value: 'pending' },
              { label: 'In Progress', value: 'inProgress' },
              { label: 'Completed', value: 'completed' },
            ]}
          />
        </div>

        {/* Assigned To */}
        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium">
            Assigned To
          </label>
          <Select
            {...register('assignedToUserId')}
            options={[
              { label: 'Unassigned', value: '' },
              ...(users || []).map((u) => ({
                label: `${u.name} (${u.email})`,
                value: String(u.id),
              })),
            ]}
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : editTodo ? 'Update Todo' : 'Add Todo'}
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
