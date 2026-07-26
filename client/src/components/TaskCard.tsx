import PriorityBadge from './PriorityBadge';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  isDragging: boolean;
}

function formatDate(value: string): string {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function TaskCard({ task, onDragStart, isDragging }: TaskCardProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      className={`cursor-grab rounded-lg border border-line bg-white p-3 shadow-sm transition-opacity active:cursor-grabbing ${
        isDragging ? 'opacity-40' : 'opacity-100'
      }`}
    >
      <p className="text-sm font-medium text-ink">{task.title}</p>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted">{task.description}</p>
      )}
      <div className="mt-2 flex items-center justify-between">
        <PriorityBadge priority={task.priority} />
        <span className="text-xs text-muted">{formatDate(task.dueDate)}</span>
      </div>
    </div>
  );
}
