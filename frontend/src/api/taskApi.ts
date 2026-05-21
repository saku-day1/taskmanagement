import axios from 'axios';
import type { CreateTaskRequest, UpdateTaskRequest, Task, Status } from '../types/task';


const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await apiClient.get<Task[]>('/api/tasks');
  return response.data;
};

export const createTask = async (data: CreateTaskRequest): Promise<Task> => {
  const response = await apiClient.post<Task>('/api/tasks', data);
  return response.data;
};

export const updateTask = async (id: number, data: UpdateTaskRequest): Promise<Task> => {
  const response = await apiClient.patch<Task>(`/api/tasks/${id}`, data);
  return response.data;
};

export const updateTaskStatus = async (id: number, status: Status): Promise<Task> => {
  const response = await apiClient.patch<Task>(`/api/tasks/${id}/status`, { status });
  return response.data;
};

export const reorderTasks = async (status: Status, orderedIds: number[]): Promise<Task[]> => {
  const response = await apiClient.patch<Task[]>('/api/tasks/reorder', { status, orderedIds });
  return response.data;
};
