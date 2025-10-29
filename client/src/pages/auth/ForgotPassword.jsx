import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AppContext from '../../context/AppContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export default function ForgotPassword() {
  const { axios } = useContext(AppContext);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error('Enter your email');
    setLoading(true);

    try {
      const { data } = await axios.post('/api/v1/auth/forgot-password', {
        email,
      });
      if (data.success) {
        toast.success('Reset link sent to your email');
      } else toast.error(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
      setEmail('');
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
            <label className="block mb-1 text-sm text-secondary/80">
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
