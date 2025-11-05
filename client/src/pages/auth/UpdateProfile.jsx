import { useEffect, useState, useContext } from 'react';
import { useForm } from 'react-hook-form';
import AppContext from '../../context/AppContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const Profile = () => {
  const { axios } = useContext(AppContext);
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

  // Preview image when file selected
  useEffect(() => {
    if (profilePic && profilePic.length > 0) {
      const file = profilePic[0];
      setPreview(URL.createObjectURL(file));
    }
  }, [profilePic]);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setServerError('');
        const res = await axios.get('/api/v1/profile');

        reset({
          name: res.data.user.name || '',
          email: res.data.user.email || '',
        });

        setPreview(res.data.user.profilePic || '/default-avatar.png');
      } catch (error) {
        console.error('Error fetching profile:', error);
        setServerError('Failed to load profile');
      }
    };
    fetchProfile();
  }, [axios, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setServerError('');

      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);

      if (data.profilePic && data.profilePic.length > 0) {
        formData.append('profilePic', data.profilePic[0]);
      }

      const res = await axios.put('/api/v1/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Profile updated successfully!');
      setPreview(res.data.user.profilePic || preview);
      reset({
        name: res.data.user.name,
        email: res.data.user.email,
        profilePic: null,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setServerError(error.response?.data?.message || 'Error updating profile');
      toast.error(error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-900 text-white px-6 md:px-12 py-10 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">
        Account Information
      </h2>

      {serverError && (
        <div className="bg-red-900/30 border border-red-600 text-red-300 p-3 rounded mb-6">
          {serverError}
        </div>
      )}

      {/* Profile Image */}
      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <div className="relative">
          <img
            src={preview}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-primary"
          />
          <label className="absolute bottom-0 right-0 bg-primary text-white px-2 py-1 rounded cursor-pointer text-xs hover:bg-primary/80">
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
          <p className="text-gray-400">{watch('email')}</p>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-700 w-full md:w-2/3"
      >
        {/* Name */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            placeholder="Enter your name"
            {...register('name', { required: 'Name is required' })}
            className="w-full p-2 rounded bg-gray-900 border border-gray-600 focus:border-primary outline-none"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">
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
            className="w-full p-2 rounded bg-gray-900 border border-gray-600 focus:border-primary outline-none"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            className="px-5 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="px-6 py-2 rounded bg-primary text-white hover:bg-primary/80 disabled:opacity-60"
          >
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
