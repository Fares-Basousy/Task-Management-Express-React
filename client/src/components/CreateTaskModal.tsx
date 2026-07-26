import { useEffect, useRef, useState } from 'react';
import { TASK_PRIORITIES, TASK_STATUSES } from '../utils/constants';
import { toUnixMillis } from '../utils/date';
import { filterValues, priorityValues, type TaskFormValues, type TaskPriority, type TaskStatus } from '../types';

const EMPTY_FORM: TaskFormValues = {
  name: '',
  description: '',
  status: 1,
  priority: 2,
  dueDate: '',
};

interface CreateTaskModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (values: TaskFormValues, files: File[]) => Promise<void>;
}

interface FormErrors {
  title?: string;
  dueDate?: string;
}

export default function CreateTaskModal({ open, onClose, onCreate }: CreateTaskModalProps) {
  const [form, setForm] = useState<TaskFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Reset the form each time the modal opens, and focus the first field.
  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setErrors({});
      setFormError('');
      setTimeout(() => firstFieldRef.current?.focus(), 0);
    }
  }, [open]);

  // Close on Escape for keyboard users.
  useEffect(() => {
    if (!open) return undefined;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }) as TaskFormValues);
  }

  function validate(): boolean {
    const next: FormErrors = {};
    if (!form.name.trim()) next.title = 'Title is required.';
    if (!form.dueDate) next.dueDate = 'Due date is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        priority: form.priority,
        status: form.status,
        dueDate: (typeof form.dueDate === "string"? toUnixMillis(form.dueDate):form.dueDate ),
      };

      await onCreate(payload, []);
      onClose();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Could not create the task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-task-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="card max-h-[90vh] w-full max-w-md overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="create-task-title" className="text-lg font-semibold text-ink">New task</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted hover:bg-canvas"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {formError && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-100 px-3 py-2 text-sm text-rose-500">
              {formError}
            </div>
          )}

          <div>
            <label className="label" htmlFor="title">Title</label>
            <input
              ref={firstFieldRef}
              id="name"
              name="name"
              className="input"
              value={form.name}
              onChange={handleChange}
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title && <p className="mt-1 text-xs text-rose-500">{errors.title}</p>}
          </div>

          <div>
            <label className="label" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="input resize-none"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                className="input"
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: Number(e.target.value) as TaskStatus }))}
              >
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status}>{filterValues[status]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label" htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                className="input"
                value={form.priority}
                onChange={(e) => setForm((prev) => ({ ...prev, priority: Number(e.target.value) as TaskPriority }))}
              >
                {TASK_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>{priorityValues[priority]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="dueDate">Due date</label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              className="input"
              value={form.dueDate}
              onChange={handleChange}
              aria-invalid={Boolean(errors.dueDate)}
            />
            {errors.dueDate && <p className="mt-1 text-xs text-rose-500">{errors.dueDate}</p>}
          </div>


          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
