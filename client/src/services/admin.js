import axiosInstance from '../configs/axiosInstance';
import { API } from '../configs/api';

// Get paginated users
export const getAllUsers = async (page = 1, limit = 10) => {
  const { data } = await axiosInstance.get(
    `${API.admin.users}?page=${page}&limit=${limit}`
  );
  return data;
};

// Deactivate user
export const deactivateUser = async (id) => {
  const { data } = await axiosInstance.delete(`${API.admin.users}/${id}`);
  return data;
};

// Activate user
export const activateUser = async (id) => {
  const { data } = await axiosInstance.patch(API.admin.restore(id));
  return data;
};

// Promote
export const promoteUser = async (id) => {
  const { data } = await axiosInstance.put(API.admin.promote(id));
  return data;
};

// Demote
export const demoteUser = async (id) => {
  const { data } = await axiosInstance.put(API.admin.demote(id));
  return data;
};

// Fetch user drawer details
export const getUserDetails = async (id) => {
  const { data } = await axiosInstance.get(API.admin.userDetails(id));
  return data;
};
