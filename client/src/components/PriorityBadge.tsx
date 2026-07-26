import { PRIORITY_DOT } from '../utils/constants';
import { priorityValues, type TaskPriority } from '../types';

export default function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink">
      <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[priority]}`} />
      {priorityValues[priority]}
    </span>
  );
}
