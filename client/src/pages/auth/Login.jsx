import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AppContext from '../../context/AppContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { loginUser } from '../../services/auth';

export default function Login() {
  const { navigate, setToken } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const data = await loginUser(formData);
      if (data.success) {
        setToken(data.accessToken);
        localStorage.setItem('token', data.accessToken);
        toast.success(data.message || 'Login successful!');
        reset();
        navigate('/');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      const res = error.response?.data;
      if (res?.errors?.length) {
        res.errors.forEach((err) => toast.error(err.msg));
      } else {
        toast.error(res?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-800 dark:bg-white p-8 rounded-2xl shadow-md border border-gray-700 dark:border-gray-300 transition-colors duration-300">
      <h2 className="text-2xl font-semibold text-center mb-6 text-primary">
        Welcome Back
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block mb-1 text-sm text-white dark:text-gray-900">
            Email Address
          </label>

          <Input
            type="email"
            placeholder="Enter your email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
            className="
              w-full p-3 rounded
              bg-gray-700 dark:bg-gray-200
              border border-gray-600 dark:border-gray-300
              focus:ring-2 focus:ring-primary
              text-gray-light dark:text-gray-900
            "
          />

          {errors.email && (
            <p className="text-red-400 dark:text-red-500 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1 text-sm text-white dark:text-gray-900">
            Password
          </label>

          <Input
            type="password"
            placeholder="Enter your password"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters long',
              },
            })}
            className="
              w-full p-3 rounded
              bg-gray-700 dark:bg-gray-200
              border border-gray-600 dark:border-gray-300
              focus:ring-2 focus:ring-primary
              text-gray-light dark:text-gray-900
            "
          />

          {errors.password && (
            <p className="text-red-400 dark:text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}

          <div className="text-right mt-2">
            <Link
              to="/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-md font-medium
            hover:bg-primary/80 transition disabled:opacity-50"
          noDefault
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <p className="text-sm text-center mt-6 text-gray-400 dark:text-gray-700">
        Don’t have an account?{' '}
        <Link to="/signup" className="text-primary hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
