import axiosInstance from './axiosInstance';

export const getAttachmentsByTask = (taskId) => axiosInstance.get(`/attachments/task/${taskId}`);
export const createAttachment = (data) => axiosInstance.post('/attachments', data);
export const deleteAttachment = (id) => axiosInstance.delete(`/attachments/${id}`);
