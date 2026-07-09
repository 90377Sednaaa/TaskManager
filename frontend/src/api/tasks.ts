import api from './client';
import type { Task, TaskLog, User } from '../types';

export const getUsers = async (): Promise<User[]> => {
  const res = await api.get('/users');
  return res.data;
};

export const getTasks = async (): Promise<Task[]> => {
  const res = await api.get('/tasks');
  return res.data;
};

export const createTask = async (data: {
  title: string;
  description?: string;
  created_by: number;
  user_ids: number[];
}): Promise<Task> => {
  const res = await api.post('/tasks', data);
  return res.data;
};

export const getMyTasks = async (userId: number): Promise<Task[]> => {
  const res = await api.get(`/my-tasks/${userId}`);
  return res.data;
};

export const updateTaskStatus = async (
  taskId: number,
  data: { user_id: number; status?: string; progress?: number; note?: string }
): Promise<Task> => {
  const res = await api.patch(`/tasks/${taskId}/status`, data);
  return res.data;
};

export const getTaskLogs = async (taskId: number): Promise<TaskLog[]> => {
  const res = await api.get(`/tasks/${taskId}/logs`);
  return res.data;
};

export const updateTask = async (
  taskId: number,
  data: { title: string; description?: string; user_ids: number[] }
): Promise<Task> => {
  const res = await api.put(`/tasks/${taskId}`, data);
  return res.data;
};

export const deleteTask = async (taskId: number): Promise<void> => {
  await api.delete(`/tasks/${taskId}`);
};