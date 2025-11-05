import { NavLink } from 'react-router-dom';

const Header = () => {
  return (
    <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-3">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      <div className="flex gap-3">
        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            `px-4 py-2 rounded-md text-sm font-medium ${
              isActive
                ? 'bg-primary text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`
          }
        >
          Users
        </NavLink>
        <NavLink
          to="/admin/activitylogs"
          className={({ isActive }) =>
            `px-4 py-2 rounded-md text-sm font-medium ${
              isActive
                ? 'bg-primary text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`
          }
        >
          Activity Logs
        </NavLink>
      </div>
    </div>
  );
};

export default Header;
