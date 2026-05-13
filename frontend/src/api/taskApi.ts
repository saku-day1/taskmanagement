import axios from 'axios';
import type { Task } from '../types/task';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

export const fetchTasks = async (): Promise<Task[]> => {
  const response = await apiClient.get<Task[]>('/api/tasks');
  return response.data;
};
