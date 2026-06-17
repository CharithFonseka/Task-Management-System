import axiosInstance from './axiosInstance';

export const getAllTasks = (params) => axiosInstance.get('/tasks', { params });
export const getTaskById = (id) => axiosInstance.get(`/tasks/${id}`);
export const createTask = (data) => axiosInstance.post('/tasks', data);
export const updateTask = (id, data) => axiosInstance.put(`/tasks/${id}`, data);
export const updateTaskStatus = (id, status) =>
  axiosInstance.patch(`/tasks/${id}/status`, { status });
export const deleteTask = (id) => axiosInstance.delete(`/tasks/${id}`);
