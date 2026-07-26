import TaskRow from './TaskRow';
import type { Task, TaskFormValues } from '../types';

interface TaskTableProps {
  tasks: Task[];
  isLoading: boolean;
  error: string;
  hasFilters: boolean;
  onSave: (id: string, values: TaskFormValues) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TaskTable({
  tasks,
  isLoading,
  error,
  hasFilters,
  onSave,
  onDelete
}: TaskTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="responsive-table w-full min-w-0 table-auto text-left text-sm md:min-w-[720px]">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <th className="px-4 py-3 font-medium">Task</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Priority</th>
            <th className="px-4 py-3 font-medium">Due date</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted">
                Loading tasks…
              </td>
            </tr>
          )}

          {!isLoading && error && (
            <tr>
              <td colSpan={5} className="px-4 py-10 text-center text-sm text-rose-500">
                {error}
              </td>
            </tr>
          )}

          {!isLoading && !error && tasks.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-14 text-center">
                <p className="font-medium text-ink">
                  {hasFilters ? 'No tasks match your filters' : 'No tasks yet'}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {hasFilters
                    ? 'Try a different search term or clear your filters.'
                    : 'Create your first task to get started.'}
                </p>
              </td>
            </tr>
          )}

          {!isLoading &&
            !error &&
            tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onSave={onSave}
                onDelete={onDelete}
              />
            ))}
        </tbody>
      </table>
    </div>
  );
}
