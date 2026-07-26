import { http } from './http';
import type { ApiEnvelope, Task, TaskFormValues } from '../types';

// Raw shape of a task document as Mongoose/Express send it over the wire.
interface RawTask {
  _id: string;
  name: string;
  description: string;
  status: number;
  priority: number;
  dueDate: number;
}

// The backend uses Mongo's _id/name and a unix-millisecond dueDate; the UI's
// Task type uses id/title and an ISO date string. This is the one place that
// translates between the two.
function mapTask(raw: RawTask): Task {
  return {
    id: raw._id,
    title: raw.name,
    description: raw.description,
    status: raw.status as Task['status'],
    priority: raw.priority as Task['priority'],
    dueDate: raw.dueDate ? new Date(raw.dueDate).toISOString() : '',
  };
}

export async function createTask(payload: TaskFormValues): Promise<Task> {
  const { data } = await http.post<ApiEnvelope<RawTask>>('/tasks/create', payload);
  return mapTask(data);
}

export async function updateTask(payload: Partial<TaskFormValues>): Promise<Task> {
  const { data } = await http.post<ApiEnvelope<RawTask>>('/tasks/update', payload);
  return mapTask(data);
}

export async function getTasks(pageIndex: number): Promise<Task[]> {
  const { data } = await http.get<ApiEnvelope<RawTask[]>>(`/tasks/get/${pageIndex}`);
  return (data ?? []).map(mapTask);
}

export async function search(text: string, pageIndex: number): Promise<Task[]> {
  const { data } = await http.get<ApiEnvelope<RawTask[]>>(`/tasks/search/${pageIndex}/${encodeURIComponent(text)}`);
  return (data ?? []).map(mapTask);
}

// priority/status are optional filters — 0 means "no filter" and the backend
// ignores it, so it's always safe to include both positions in the path.
export async function filter(pageIndex: number, priority: number, status: number): Promise<Task[]> {
  const { data } = await http.get<ApiEnvelope<RawTask[]>>(`/tasks/filter/${pageIndex}/${priority}/${status}`);
  return (data ?? []).map(mapTask);
}

export async function deleteTask(id: string): Promise<{ id: string }> {
  const { data } = await http.get<ApiEnvelope<{ id: string }>>(`/tasks/delete/${id}`);
  return data;
}

