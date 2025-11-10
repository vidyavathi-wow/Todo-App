import axiosInstance from '../configs/axiosInstance';
import { API } from '../configs/api';

export const getTodos = async () => {
  const { data } = await axiosInstance.get(API.todos.base);
  return data;
};

export const getTodoById = async (id) => {
  const { data } = await axiosInstance.get(API.todos.byId(id));
  return data;
};

export const updateTodo = async (id, updatedFields = {}) => {
  const { data } = await axiosInstance.put(API.todos.byId(id), updatedFields);
  return data;
};

export const updateTodoStatus = async (id, updatedFields = {}) => {
  const { data } = await axiosInstance.patch(
    API.todos.statusById(id),
    updatedFields
  );
  return data;
};

export const createTodo = async (todoData) => {
  const { data } = await axiosInstance.post(API.todos.base, todoData);
  return data;
};

export const deleteTodo = async (id) => {
  const { data } = await axiosInstance.delete(API.todos.byId(id));
  return data;
};

export const getDashboardData = async () => {
  const { data } = await axiosInstance.get(API.todos.dashboard);
  return data;
};
