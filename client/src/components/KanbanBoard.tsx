import { useState } from 'react';
import TaskCard from './TaskCard';
import { TASK_STATUSES } from '../utils/constants';
import { filterValues, type Task, type TaskFormValues, type TaskStatus } from '../types';

interface KanbanBoardProps {
  tasks: Task[];
  isLoading: boolean;
  error: string;
  onStatusChange: (id: string, updates: Partial<TaskFormValues>) => Promise<void>;
}

export default function KanbanBoard({ tasks, isLoading, error, onStatusChange }: KanbanBoardProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<TaskStatus | null>(null);
  const [moveError, setMoveError] = useState('');

  function handleDragStart(e: React.DragEvent<HTMLDivElement>, taskId: string) {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedId(taskId);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>, status: TaskStatus) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStatus !== status) setDragOverStatus(status);
  }

  function handleDragLeave(status: TaskStatus) {
    setDragOverStatus((current) => (current === status ? null : current));
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>, status: TaskStatus) {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedId;
    setDragOverStatus(null);
    setDraggedId(null);
    if (!taskId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === status) return;

    setMoveError('');
    try {
      await onStatusChange(task.id, { id: task.id, status });
    } catch (err) {
      setMoveError(err instanceof Error ? err.message : 'Could not move the task. Please try again.');
    }
  }

  if (isLoading) {
    return <div className="card px-4 py-10 text-center text-sm text-muted">Loading tasks…</div>;
  }

  if (error) {
    return <div className="card px-4 py-10 text-center text-sm text-rose-500">{error}</div>;
  }

  return (
    <div>
      {moveError && (
        <div className="mb-3 rounded-lg border border-rose-500/30 bg-rose-100 px-3 py-2 text-sm text-rose-500">
          {moveError}
        </div>
      )}
      <div className="kanban-scroll flex gap-4 overflow-x-auto pb-2">
        {TASK_STATUSES.map((status) => {
          const columnTasks = tasks.filter((t) => t.status === status);
          const isDropActive = dragOverStatus === status;

          return (
            <div
              key={status}
              className={`kanban-column card flex w-72 shrink-0 flex-col p-3 transition-shadow ${
                isDropActive ? 'kanban-drop-active' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={() => handleDragLeave(status)}
              onDrop={(e) => handleDrop(e, status)}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-ink">{filterValues[status]}</h3>
                <span className="rounded-full bg-canvas px-2 py-0.5 text-xs text-muted">
                  {columnTasks.length}
                </span>
              </div>

              <div className="flex min-h-[120px] flex-col gap-2">
                {columnTasks.length === 0 && (
                  <p className="rounded-lg border border-dashed border-line px-3 py-6 text-center text-xs text-muted">
                    Drop a task here
                  </p>
                )}
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDragStart={handleDragStart}
                    isDragging={draggedId === task.id}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
