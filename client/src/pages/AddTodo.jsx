import { useEffect, useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppContext from '../context/AppContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import { createTodo, updateTodo } from '../services/todos';

const getLocalDateTimeMin = () => {
  const now = new Date();
  now.setSeconds(0);
  now.setMilliseconds(0);
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

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

  const [minDateTime, setMinDateTime] = useState(getLocalDateTimeMin());

  useEffect(() => {
    const interval = setInterval(() => {
      setMinDateTime(getLocalDateTimeMin());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (editTodo) {
      Object.entries(editTodo).forEach(([key, value]) => {
        if (key === 'date' && value) {
          const d = new Date(value);
          const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
          setValue('date', local);
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
      className="flex-1 bg-gray-dark text-secondary h-full overflow-scroll p-4 dark:bg-gray-50 dark:text-gray-900"
    >
      <div className="bg-gray-dark w-full max-w-3xl p-6 md:p-10 shadow-lg rounded-lg mx-auto border border-gray-light dark:bg-white dark:border-gray-300">
        <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2 dark:text-gray-900 dark:border-gray-300">
          {editTodo ? 'Edit Todo' : 'Add New Todo'}
        </h2>

        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium dark:text-gray-700">
            Title <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Enter todo title"
            className="dark:bg-gray-100 dark:text-gray-900 dark:border-gray-300"
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium dark:text-gray-700">
            Description <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Enter description"
            className="dark:bg-gray-100 dark:text-gray-900 dark:border-gray-300"
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

        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium dark:text-gray-700">
            Notes
          </label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded bg-gray-dark text-text min-h-[150px] dark:bg-gray-100 dark:text-gray-900 dark:border-gray-300"
            placeholder="Enter notes"
            {...register('notes')}
          />
        </div>

        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium dark:text-gray-700">
            Date & Time <span className="text-red-500">*</span>
          </label>
          <Input
            type="datetime-local"
            min={minDateTime}
            onClick={(e) => e.target.showPicker()}
            onChange={(e) => e.target.blur()}
            className="cursor-pointer w-full dark:bg-gray-100 dark:text-gray-900 dark:border-gray-300 hover:border-primary hover:ring-1 hover:ring-primary focus:ring-primary focus:border-primary"
            {...register('date', {
              required: 'Date & time are required',
              validate: (value) => {
                const selected = new Date(value).getTime();
                const now = new Date().getTime();
                if (selected < now) return 'Cannot select a past time';
                return true;
              },
            })}
          />
          {errors.date && (
            <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium dark:text-gray-700">
            Remind Me Before
          </label>
          <Select
            className="dark:bg-gray-100 dark:text-gray-900 dark:border-gray-300"
            {...register('reminderBeforeMinutes')}
            options={[
              { label: '10 minutes', value: 10 },
              { label: '30 minutes', value: 30 },
              { label: '1 hour', value: 60 },
              { label: '1 day', value: 1440 },
            ]}
          />
        </div>

        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-secondary/90 mb-2 font-medium dark:text-gray-700">
              Category
            </label>
            <Select
              {...register('category')}
              className="dark:bg-gray-100 dark:text-gray-900 dark:border-gray-300"
              options={[
                { label: 'Work', value: 'Work' },
                { label: 'Personal', value: 'Personal' },
                { label: 'Other', value: 'Other' },
              ]}
            />
          </div>

          <div>
            <label className="block text-secondary/90 mb-2 font-medium dark:text-gray-700">
              Priority
            </label>
            <Select
              {...register('priority')}
              className="dark:bg-gray-100 dark:text-gray-900 dark:border-gray-300"
              options={[
                { label: 'Low', value: 'Low' },
                { label: 'Moderate', value: 'Moderate' },
                { label: 'High', value: 'High' },
              ]}
            />
          </div>

          <div>
            <label className="block text-secondary/90 mb-2 font-medium dark:text-gray-700">
              Status
            </label>
            <Select
              {...register('status')}
              className="dark:bg-gray-100 dark:text-gray-900 dark:border-gray-300"
              options={[
                { label: 'Pending', value: 'pending' },
                { label: 'In Progress', value: 'inProgress' },
                { label: 'Completed', value: 'completed' },
              ]}
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-secondary/90 mb-2 font-medium dark:text-gray-700">
            Assigned To
          </label>
          <Select
            className="dark:bg-gray-100 dark:text-gray-900 dark:border-gray-300"
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

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : editTodo ? 'Update Todo' : 'Add Todo'}
          </Button>

          {editTodo && (
            <Button
              type="button"
              onClick={onCancelHandler}
              className="bg-gray-700 dark:bg-gray-400 dark:text-gray-900"
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
