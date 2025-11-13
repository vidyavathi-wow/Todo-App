import axiosInstance from '../configs/axiosInstance';
import { API } from '../configs/api';

export const getAllUsers = async (page = 1, limit = 10) => {
  const { data } = await axiosInstance.get(
    `${API.admin.users}?page=${page}&limit=${limit}`
  );
  return data;
};

export const deleteUser = async (id) => {
  const { data } = await axiosInstance.delete(`${API.admin.users}/${id}`);
  return data;
};

export const promoteUser = async (id) => {
  const { data } = await axiosInstance.put(API.admin.promote(id));
  return data;
};

export const demoteUser = async (id) => {
  const { data } = await axiosInstance.put(API.admin.demote(id));
  return data;
};

export const restoreUser = async (id) => {
  const { data } = await axiosInstance.get(API.admin.restore(id));
  return data;
};

export const getActivityLogs = async (page = 1, limit = 5) => {
  const { data } = await axiosInstance.get(
    `${API.admin.activityLogs}?page=${page}&limit=${limit}`
  );
  return data;
};
