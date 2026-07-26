import { STATUS_STYLES } from '../utils/constants';
import { filterValues, type TaskStatus } from '../types';

export default function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {filterValues[status]}
    </span>
  );
}
