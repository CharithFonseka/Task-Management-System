import axiosInstance from './axiosInstance';

export const getCommentsByTask = (taskId) => axiosInstance.get(`/comments/task/${taskId}`);
export const createComment = (data) => axiosInstance.post('/comments', data);
export const deleteComment = (id) => axiosInstance.delete(`/comments/${id}`);
