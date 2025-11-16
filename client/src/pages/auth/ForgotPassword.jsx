import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { sendForgotPasswordLink } from '../../services/auth';

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    defaultValues: { email: '' },
  });

  const onSubmit = async ({ email }) => {
    try {
      const data = await sendForgotPasswordLink(email);

      if (data.success) {
        toast.success('Reset link sent to your email');
        reset();
      } else {
        toast.error(data.message || 'Failed to send reset link');
      }
    } catch (error) {
      const res = error.response?.data;
      toast.error(res?.message || 'Something went wrong');
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-800 dark:bg-white p-8 rounded-2xl shadow-md border border-gray-700 dark:border-gray-300 transition-colors duration-300">
      <h2 className="text-2xl font-semibold text-center text-primary mb-6">
        Forgot Password
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block mb-1 text-sm text-white dark:text-gray-900">
            Email Address
          </label>

          <Input
            type="email"
            placeholder="Enter your registered email"
            className="
              w-full p-3 rounded
              bg-gray-700 dark:bg-gray-200
              border border-gray-600 dark:border-gray-300
              focus:ring-2 focus:ring-primary outline-none
              text-gray-light dark:text-gray-900
            "
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Enter a valid email',
              },
            })}
          />

          {errors.email && (
            <p className="text-red-400 dark:text-red-500 text-sm mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="
            w-full h-11 mt-2
            bg-primary text-white dark:text-white
            rounded-md font-medium
            hover:bg-primary/80 transition
            disabled:opacity-50
          "
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>

      <p className="text-sm text-center mt-6 text-gray-400 dark:text-gray-600">
        <Link to="/login" className="text-primary hover:underline">
          Back to Login
        </Link>
      </p>
    </div>
  );
}
