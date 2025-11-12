import axiosInstance from '../configs/axiosInstance';
import { API } from '../configs/api';

export const getUsers = async () => {
  const { data } = await axiosInstance.get(API.users.base);
  return data;
};
