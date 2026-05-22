export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  deadline: string | null;
  priority: Priority | null;
  status: Status;
  createdAt: string;
  updatedAt: string;
  displayOrder: number | null;
}

export interface CreateTaskRequest {
  title: string;
  description: string | null;
  deadline: string | null;
  priority: Priority;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  deadline?: string | null;
  priority?: Priority;
}
