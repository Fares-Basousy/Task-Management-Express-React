import { TASK_PRIORITIES, TASK_STATUSES } from '../utils/constants';
import { filterValues, priorityValues, type TaskFilters, type TaskPriority, type TaskStatus } from '../types';

interface FilterBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
  onCreateClick: () => void;
  view: 'table' | 'board';
  onViewChange: (view: 'table' | 'board') => void;
}

export default function FilterBar({ filters, onChange, onCreateClick, view, onViewChange }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-1 sm:items-center sm:gap-3">
          <input
            type="search"
            placeholder="Search by title…"
            className="input sm:max-w-xs"
            value={filters.search}
            onChange={(e) => onChange({ ...filters, search: e.target.value })}
            aria-label="Search tasks by title"
          />

          <select
            className="input sm:w-40"
            value={filters.status}
            onChange={(e) => onChange({ ...filters, status: e.target.value === '' ? '' : (Number(e.target.value) as TaskStatus) })}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>{filterValues[status]}</option>
            ))}
          </select>

          <select
            className="input sm:w-40"
            value={filters.priority}
            onChange={(e) => onChange({ ...filters, priority: e.target.value === '' ? '' : (Number(e.target.value) as TaskPriority) })}
            aria-label="Filter by priority"
          >
            <option value="">All priorities</option>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>{priorityValues[priority]}</option>
            ))}
          </select>
        </div>

        <button type="button" className="btn-primary shrink-0" onClick={onCreateClick}>
          + New task
        </button>
      </div>

      <div className="inline-flex w-fit self-start rounded-lg border border-line bg-white p-0.5">
        <button
          type="button"
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            view === 'table' ? 'bg-brand-500 text-white' : 'text-muted hover:bg-canvas'
          }`}
          onClick={() => onViewChange('table')}
          aria-pressed={view === 'table'}
        >
          Table
        </button>
        <button
          type="button"
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            view === 'board' ? 'bg-brand-500 text-white' : 'text-muted hover:bg-canvas'
          }`}
          onClick={() => onViewChange('board')}
          aria-pressed={view === 'board'}
        >
          Board
        </button>
      </div>
    </div>
  );
}
