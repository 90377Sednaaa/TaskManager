export interface User {
  id: number;
  name: string;
  email?: string;
  roles?: string[];
}

export type TaskStatus = 'pending' | 'in_progress' | 'halted' | 'completed';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  progress: number;
  created_by: number;
  users: User[];
  creator?: User;
  created_at: string;
  updated_at: string;
}

export interface TaskLog {
  id: number;
  task_id: number;
  user_id: number;
  note: string | null;
  progress_snapshot: number;
  status_snapshot: TaskStatus;
  created_at: string;
  user: User;
}

export interface AuthResponse {
  user: User;
  token: string;
}