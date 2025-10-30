import React, { useState, useContext } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppContext from '../../context/AppContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function ResetPassword() {
  const { axios } = useContext(AppContext);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return toast.error('Enter a new password');
    if (!token) return toast.error('Invalid or missing reset token');

    setLoading(true);
    try {
      const { data } = await axios.post(
        `/api/v1/auth/reset-password?token=${token}`, // ← Query param format
        { password }
      );
      if (data.success) {
        toast.success('Password reset successfully');
        navigate('/login');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        const messages = error.response.data.errors.map((err) => err.msg);
        messages.forEach((msg) => toast.error(msg));
      } else {
        toast.error(
          error.response?.data?.message || 'Failed to reset password'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-dark text-gray-light">
        <div className="text-center">
          <p className="mb-4">Invalid reset link</p>
          <Link to="/login" className="text-primary hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-dark text-gray-light px-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6 text-primary">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-1 text-sm">New Password</label>
            <Input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              noDefault
              placeholder="Enter new password"
              className="w-full p-3 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            noDefault
            className="w-full bg-primary text-white py-3 rounded-md font-medium hover:bg-primary/80 transition disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>

        <p className="text-sm text-center mt-6">
          <Link to="/login" className="text-primary hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
