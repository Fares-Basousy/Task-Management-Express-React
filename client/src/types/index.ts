export type TaskStatus = 1 | 2 | 3;
export type TaskPriority = 1 | 2 | 3;

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string; // ISO date string
}

/** Shape used while creating/editing a task in forms (dueDate as yyyy-mm-dd input value). */
export interface TaskFormValues {
  id?: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: number | string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Every backend response is wrapped as { message?, data? }; endpoints that
// return no payload (e.g. signup) resolve ApiEnvelope<void>.
export interface ApiEnvelope<T> {
  message?: string;
  data: T;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
}

export interface TaskFilters {
  search: string;
  status: TaskStatus | '';
  priority: TaskPriority | '';
}

export const filterValues: Record<TaskStatus, string> = {
  1: 'To Do',
  2: 'In Progress',
  3: 'Done',
};

export const priorityValues: Record<TaskPriority, string> = {
  1: 'Low',
  2: 'Medium',
  3: 'High',
};
