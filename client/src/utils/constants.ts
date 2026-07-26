import type { TaskPriority, TaskStatus } from '../types';

export const TASK_STATUSES: TaskStatus[] = [1, 2, 3];

export const TASK_PRIORITIES: TaskPriority[] = [1, 2, 3];

export const STATUS_STYLES: Record<TaskStatus, string> = {
  1: 'bg-slate-100 text-slate-700 border-slate-300',
  2: 'bg-amber-100 text-amber-700 border-amber-300',
  3: 'bg-brand-50 text-brand-700 border-brand-300',
};

export const PRIORITY_DOT: Record<TaskPriority, string> = {
  1: 'bg-slate-400',
  2: 'bg-amber-500',
  3: 'bg-rose-500',
};

export const PAGE_SIZE = 8;

export const AUTH_TOKEN_KEY = 'tm_access_token';
export const AUTH_USER_KEY = 'tm_user';
