import { useState } from 'react';
import { TASK_PRIORITIES, TASK_STATUSES } from '../utils/constants';
import { formatDate, toDateInputValue, toUnixMillis } from '../utils/date';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import { filterValues, priorityValues, type Task, type TaskFormValues, type TaskPriority, type TaskStatus } from '../types';

interface TaskRowProps {
  task: Task;
  onSave: (id: string, values: TaskFormValues) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function toDraft(task: Task): TaskFormValues {
  return {
    id: task.id,
    name: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: toDateInputValue(task.dueDate),
  };
}

export default function TaskRow({ task, onSave, onDelete }: TaskRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<TaskFormValues>(() => toDraft(task));
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false)
  function startEdit() {
    setDraft(toDraft(task));
    setError('');
    setIsEditing(true);
  }

  function cancelEdit() {
    setIsEditing(false);
    setError('');
    setDraft(toDraft(task));
  }

  async function handleSave() {
    if (!draft.name.trim()) {
      setError('Title cannot be empty.');
      return;
    }
    if (!draft.dueDate) {
      setError('Due date is required.');
      return;
    }

    setIsSaving(true);
    setError('');
    try {
      await onSave(task.id, {
        ...draft,
        dueDate: typeof draft.dueDate === 'string' ? toUnixMillis(draft.dueDate) : draft.dueDate,
      });
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await onDelete(task.id);
    } catch {
      setIsDeleting(false);
      setError('Could not delete this task. Please try again.');
    }
  }


 
  if (isEditing) {
    return (
      <tr className="bg-brand-50/40 align-top">
        <td data-label="Task" className="px-4 py-3">
          <input
            className="input"
            value={draft.name}
            onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
            aria-label="Title"
          />
          <textarea
            className="input mt-2 resize-none"
            rows={2}
            value={draft.description || ''}
            onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
            aria-label="Description"
            placeholder="Description"
          />
          {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}

        </td>
        <td data-label="Status" className="px-4 py-3">
          <select
            className="input"
            value={draft.status}
            onChange={(e) => setDraft((prev) => ({ ...prev, status: Number(e.target.value) as TaskStatus }))}
            aria-label="Status"
          >
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>{filterValues[status]}</option>
            ))}
          </select>
        </td>
        <td data-label="Priority" className="px-4 py-3">
          <select
            className="input"
            value={draft.priority}
            onChange={(e) => setDraft((prev) => ({ ...prev, priority: Number(e.target.value) as TaskPriority }))}
            aria-label="Priority"
          >
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>{priorityValues[priority]}</option>
            ))}
          </select>
        </td>
        <td data-label="Due date" className="px-4 py-3">
          <input
            type="date"
            className="input"
            value={draft.dueDate}
            onChange={(e) => setDraft((prev) => ({ ...prev, dueDate: e.target.value }))}
            aria-label="Due date"
          />
        </td>
        <td data-label="" className="px-4 py-3">
          <div className="flex justify-end gap-2 md:justify-end">
            <button type="button" className="btn-secondary" onClick={cancelEdit} disabled={isSaving}>
              Cancel
            </button>
            <button type="button" className="btn-primary" onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-line last:border-0 hover:bg-canvas/60">
      <td data-label="Task" className="px-4 py-3">
        <p className="font-medium text-ink">{task.title}</p>
        {task.description && (
          <p className="mt-0.5 line-clamp-1 text-sm text-muted">{task.description}</p>
        )}
  
      </td>
      <td data-label="Status" className="px-4 py-3"><StatusBadge status={task.status} /></td>
      <td data-label="Priority" className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>
      <td data-label="Due date" className="px-4 py-3 text-sm text-muted">{formatDate(task.dueDate)}</td>
      <td data-label="" className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <button type="button" className="btn-secondary" onClick={startEdit}>
            Edit
          </button>
          <button type="button" className="btn-danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? 'Removing…' : 'Remove'}
          </button>
        </div>
      </td>
    </tr>
  );
}
