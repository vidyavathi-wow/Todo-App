import { useState, useEffect, useContext } from 'react';
import AppContext from '../../context/AppContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const Profile = () => {
  const { axios } = useContext(AppContext);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    profilePic: '',
  });
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError('');
        const res = await axios.get('/api/v1/profile');
        console.log('Profile response:', res.data);

        setProfile({
          name: res.data.user.name || '',
          email: res.data.user.email || '',
          profilePic: res.data.user.profilePic || '',
        });
        setPreview(res.data.user.profilePic || '/default-avatar.png');
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      }
    };
    fetchProfile();
  }, [axios]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile({ ...profile, profilePic: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);

      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('email', profile.email);

      // Only append file if it's a File object (new upload), not a string (existing URL)
      if (profile.profilePic instanceof File) {
        formData.append('profilePic', profile.profilePic);
      }

      const res = await axios.put('/api/v1/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Update response:', res.data);
      alert('Profile updated successfully!');

      // Update preview with new URL from response
      setPreview(res.data.user.profilePic);
      setProfile({
        name: res.data.user.name,
        email: res.data.user.email,
        profilePic: res.data.user.profilePic,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Error updating profile');
      alert(error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-gray-900 text-white px-6 md:px-12 py-10 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">
        Account Information
      </h2>

      {error && (
        <div className="bg-red-900/30 border border-red-600 text-red-300 p-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
        <div className="relative">
          <img
            src={preview || '/default-avatar.png'}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-primary"
          />
          <label className="absolute bottom-0 right-0 bg-primary text-white px-2 py-1 rounded cursor-pointer text-xs hover:bg-primary/80">
            Change
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
        <div>
          <h3 className="text-lg font-semibold">{profile.name}</h3>
          <p className="text-gray-400">{profile.email}</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-700 w-full md:w-2/3"
      >
        <div className="mb-4">
          <label className="block mb-1 text-gray-400">Name</label>
          <Input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-900 border border-gray-600 focus:border-primary outline-none"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-gray-400">Email Address</label>
          <Input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-900 border border-gray-600 focus:border-primary outline-none"
          />
        </div>

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
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
