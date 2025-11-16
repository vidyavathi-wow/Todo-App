import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { registerUser } from '../../services/auth';

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      const data = await registerUser(formData);

      if (data.success) {
        toast.success(data.message || 'Account created successfully!');
        reset();
        navigate('/login');
      } else {
        toast.error(data.message || 'Signup failed');
      }
    } catch (error) {
      const res = error.response?.data;
      if (res?.errors?.length) {
        res.errors.forEach((err) => toast.error(err.msg));
      } else {
        toast.error(res?.message || 'Signup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full max-w-md 
      bg-gray-800 dark:bg-white 
      p-8 rounded-2xl shadow-md 
      border border-gray-700 dark:border-gray-300
      transition-colors duration-300"
    >
      <h2 className="text-2xl font-semibold text-center mb-6 text-primary">
        Create an Account
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block mb-1 text-sm text-white dark:text-gray-800">
            Full Name
          </label>
          <Input
            type="text"
            placeholder="Enter your name"
            className="w-full p-3 rounded 
              bg-gray-700 dark:bg-gray-200 
              border border-gray-600 dark:border-gray-400
              focus:ring-2 focus:ring-primary outline-none"
            {...register('name', {
              required: 'Name is required',
              minLength: {
                value: 2,
                message: 'Name must be at least 2 characters',
              },
            })}
          />
          {errors.name && (
            <p className="text-red-400 dark:text-red-600 text-sm mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 text-sm text-white dark:text-gray-800">
            Email Address
          </label>
          <Input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 rounded 
              bg-gray-700 dark:bg-gray-200 
              border border-gray-600 dark:border-gray-400
              focus:ring-2 focus:ring-primary outline-none"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email address',
              },
            })}
          />
          {errors.email && (
            <p className="text-red-400 dark:text-red-600 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1 text-sm text-white dark:text-gray-800">
            Password
          </label>
          <Input
            type="password"
            placeholder="Enter your password"
            className="w-full p-3 rounded 
              bg-gray-700 dark:bg-gray-200 
              border border-gray-600 dark:border-gray-400
              focus:ring-2 focus:ring-primary outline-none"
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters long',
              },
            })}
          />
          {errors.password && (
            <p className="text-red-400 dark:text-red-600 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading}
          noDefault
          className="w-full bg-primary text-white py-3 rounded-md font-medium 
            hover:bg-primary/80 transition disabled:opacity-50"
        >
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Button>
      </form>

      <p className="text-sm text-center mt-6 text-white dark:text-gray-800">
        Already have an account?{' '}
        <Link to="/login" className="text-primary hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}
