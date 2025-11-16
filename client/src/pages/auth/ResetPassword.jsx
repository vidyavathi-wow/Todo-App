import React from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { resetPassword } from '../../services/auth';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { password: '' },
  });

  const onSubmit = async ({ password }) => {
    if (!token) return toast.error('Invalid or missing reset token');

    try {
      const data = await resetPassword(token, password);

      if (data.success) {
        toast.success('Password reset successfully');
        navigate('/login');
      } else {
        toast.error(data.message || 'Reset failed');
      }
    } catch (error) {
      const res = error.response?.data;
      toast.error(res?.message || 'Failed to reset password');
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md bg-gray-800 dark:bg-white p-8 rounded-2xl shadow-md border border-gray-700 dark:border-gray-300 transition-colors text-center">
        <p className="mb-4 text-white dark:text-gray-800">
          Invalid or expired reset link
        </p>
        <Link to="/login" className="text-primary hover:underline">
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-gray-800 dark:bg-white p-8 rounded-2xl shadow-md border border-gray-700 dark:border-gray-300 transition-colors">
      <h2 className="text-2xl font-semibold text-center mb-6 text-primary">
        Reset Password
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block mb-1 text-sm text-white dark:text-gray-900">
            New Password
          </label>

          <Input
            type="password"
            placeholder="Enter new password"
            className="
              w-full p-3 rounded 
              bg-gray-700 dark:bg-gray-200
              border border-gray-600 dark:border-gray-300
              focus:ring-2 focus:ring-primary outline-none
              text-gray-light dark:text-gray-900
            "
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters',
              },
            })}
          />

          {errors.password && (
            <p className="text-red-400 dark:text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          noDefault
          className="
            w-full bg-primary text-white py-3 rounded-md font-medium 
            hover:bg-primary/80 transition
          "
        >
          Reset Password
        </Button>
      </form>

      <p className="text-sm text-center mt-6 text-white dark:text-gray-700">
        <Link to="/login" className="text-primary hover:underline">
          Back to Login
        </Link>
      </p>
    </div>
  );
}
