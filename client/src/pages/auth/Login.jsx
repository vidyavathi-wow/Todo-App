import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AppContext from '../../context/AppContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { loginUser } from '../../services/auth';

export default function Login() {
  const navigate = useNavigate();
  const { setToken } = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ defaultValues: { email: '', password: '' } });

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const data = await loginUser(formData);

      if (data.success) {
        localStorage.setItem('accessToken', data.accessToken);
        setToken(data.accessToken);

        toast.success(data.message || 'Login successful');
        reset();
        navigate('/', { replace: true });
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Login failed');
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
                message: 'Enter a valid email',
              },
            })}
            className="w-full p-3 rounded bg-gray-700 dark:bg-gray-200 border border-gray-600 dark:border-gray-300 focus:ring-2 focus:ring-primary text-white dark:text-gray-900"
          />
          {errors.email && (
            <p className="text-red-400 dark:text-red-500 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 text-sm text-white dark:text-gray-900">
            Password
          </label>
          <Input
            type="password"
            placeholder="Enter your password"
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Minimum 6 chars' },
            })}
            className="w-full p-3 rounded bg-gray-700 dark:bg-gray-200 border border-gray-600 dark:border-gray-300 focus:ring-2 focus:ring-primary text-white dark:text-gray-900"
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
        <Button
          type="submit"
          disabled={loading}
          noDefault
          className="w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-primary/80 transition disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </form>

      <p className="text-sm text-center mt-6 text-gray-400 dark:text-gray-700">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}
