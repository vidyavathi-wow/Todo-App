import { useEffect, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import { updateProfile } from '../../services/profile';
import AppContext from '../../context/AppContext';

const Profile = () => {
  const { user, fetchUserProfile } = useContext(AppContext);

  const [preview, setPreview] = useState('/default-avatar.png');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      profilePic: null,
    },
  });

  const profilePic = watch('profilePic');

  // Preview selected image
  useEffect(() => {
    if (profilePic && profilePic.length > 0) {
      setPreview(URL.createObjectURL(profilePic[0]));
    }
  }, [profilePic]);

  // Load fresh profile from context (context always loads it FIRST)
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
      });
      setPreview(user.profilePic || '/default-avatar.png');
    }
  }, [user, reset]);

  const onSubmit = async (formValues) => {
    try {
      setLoading(true);
      setServerError('');

      const formData = new FormData();
      formData.append('name', formValues.name);
      formData.append('email', formValues.email);

      if (formValues.profilePic && formValues.profilePic.length > 0) {
        formData.append('profilePic', formValues.profilePic[0]);
      }

      const data = await updateProfile(formData);
      toast.success('Profile updated successfully!');

      // Update preview instantly for UI
      setPreview(data.user.profilePic || preview);

      // Re-fetch fresh profile from backend (no cache)
      await fetchUserProfile();

      reset({
        name: data.user.name,
        email: data.user.email,
        profilePic: null,
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Error updating profile';
      setServerError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-6 md:px-12 py-10 overflow-y-auto transition-colors duration-300">
      <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 dark:border-gray-300 pb-2">
        Account Information
      </h2>

      {serverError && (
        <div className="bg-red-900/30 dark:bg-red-100 border border-red-600 dark:border-red-400 text-red-300 dark:text-red-700 p-3 rounded mb-6">
          {serverError}
        </div>
      )}

      {/* Avatar */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <div className="relative">
          <img
            src={preview}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-primary"
          />
          <label className="absolute bottom-0 right-0 bg-primary text-white px-2 py-1 rounded cursor-pointer text-xs hover:bg-primary/80 transition">
            Change
            <input
              type="file"
              accept="image/*"
              {...register('profilePic')}
              className="hidden"
            />
          </label>
        </div>
        <div>
          <h3 className="text-lg font-semibold">{watch('name')}</h3>
          <p className="text-gray-400 dark:text-gray-700">{watch('email')}</p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gray-800 dark:bg-white p-6 rounded-2xl shadow-md border border-gray-700 dark:border-gray-300 w-full md:w-2/3 transition-colors duration-300"
      >
        <div className="mb-4">
          <label className="block mb-1 text-gray-400 dark:text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Enter your name"
            {...register('name', { required: 'Name is required' })}
            className="w-full p-2 rounded bg-gray-900 dark:bg-gray-100 border border-gray-600 dark:border-gray-300 text-white dark:text-gray-900 focus:border-primary outline-none transition-colors duration-300"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-400 dark:text-gray-700">
            Email Address <span className="text-red-500">*</span>
          </label>
          <Input
            type="email"
            placeholder="Enter your email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                message: 'Enter a valid email address',
              },
            })}
            className="w-full p-2 rounded bg-gray-900 dark:bg-gray-100 border border-gray-600 dark:border-gray-300 text-white dark:text-gray-900 focus:border-primary outline-none transition-colors duration-300"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            onClick={() => window.history.back()}
            className="px-5 py-2 rounded bg-gray-700 dark:bg-gray-600 text-white dark:text-gray-900 hover:bg-gray-600 dark:hover:bg-gray-500 transition"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded bg-primary text-white hover:bg-primary/80 disabled:opacity-60 transition"
          >
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
