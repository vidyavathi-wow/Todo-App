import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { sendForgotPasswordLink } from '../../services/auth';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Enter your email');
    setLoading(true);

    try {
      const data = await sendForgotPasswordLink(email);

      if (data.success) {
        toast.success('Reset link sent to your email');
        setEmail('');
      } else {
        toast.error(data.message || 'Failed to send reset link');
      }
    } catch (error) {
      const res = error.response?.data;
      if (res?.errors?.length) {
        res.errors.forEach((err) => toast.error(err.msg));
      } else {
        toast.error(res?.message || 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-dark text-gray-light px-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-md border border-gray-light">
        <h2 className="text-2xl font-semibold text-center text-primary mb-6">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm text-text">
              Email Address
            </label>
            <Input
              type="email"
              name="email"
              value={email}
              placeholder="Enter your registered email"
              onChange={(e) => setEmail(e.target.value)}
              required
              noDefault
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full h-11 mt-2">
            {loading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <p className="text-sm text-center mt-6 text-secondary/70">
          <Link to="/login" className="text-primary hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
