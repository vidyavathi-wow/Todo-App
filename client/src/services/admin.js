import axiosInstance from '../configs/axiosInstance';
import { API } from '../configs/api';

export const getAllUsers = async (page = 1, limit = 10) => {
  const { data } = await axiosInstance.get(
    `${API.admin.users}?page=${page}&limit=${limit}`
  );
  return data;
};

export const updateUser = async (id, updatedFields) => {
  const { data } = await axiosInstance.put(
    `${API.admin.users}/${id}`,
    updatedFields
  );
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await axiosInstance.delete(`${API.admin.users}/${id}`);
  return data;
};

export const getActivityLogs = async (page = 1, limit = 5) => {
  const { data } = await axiosInstance.get(
    `${API.admin.activityLogs}?page=${page}&limit=${limit}`
  );
  return data;
};
