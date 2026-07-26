import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FilterBar from '../components/FilterBar';
import TaskTable from '../components/TaskTable';
import KanbanBoard from '../components/KanbanBoard';
import Pagination from '../components/Pagination';
import CreateTaskModal from '../components/CreateTaskModal';
import { createTask, deleteTask, getTasks, updateTask, filter, search} from '../api/taskService';
import type { Task, TaskFilters, TaskFormValues } from '../types';

const INITIAL_FILTERS: TaskFilters = { search: '', status: '', priority: '' };

export default function Tasks() {
  const [filters, setFilters] = useState<TaskFilters>(INITIAL_FILTERS);
  const [view, setView] = useState<'table' | 'board'>('table');

  // Page lives in the URL (?page=) rather than component state, so pagination
  // survives a refresh/share/back-button and isn't lost on remount.
  // `page` is the 1-based number shown in the URL/UI ("/tasks" == page 1);
  // `pageIndex` is the 0-based value the backend's paging API expects.
  const [searchParams, setSearchParams] = useSearchParams();
  const rawPage = Number(searchParams.get('page'));
  const page = Number.isNaN(rawPage) || rawPage < 1 ? 1 : rawPage;
  const pageIndex = page - 1;

  const setPage = useCallback(
    (value: number | ((prev: number) => number)) => {
      const nextPage = Math.max(1, typeof value === 'function' ? value(page) : value);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (nextPage > 1) next.set('page', String(nextPage));
          else next.delete('page');
          return next;
        },
        { replace: true }
      );
    },
    [page, setSearchParams]
  );

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const hasFilters = Boolean(filters.search || filters.status || filters.priority);

  // Every change to search, status, priority, page, or view re-queries the
  // backend directly rather than filtering an already-loaded list in memory.
  const load = useCallback(async () => {
  setIsLoading(true);
  setError("");

  try {
    let data: Task[];

    if (filters.search) {
      data = await search(filters.search, pageIndex);
    } else if (filters.status || filters.priority) {
      const priority = typeof filters.priority === 'number' ? filters.priority : 0;
      const status = typeof filters.status === 'number' ? filters.status : 0;

      data = await filter(pageIndex, priority, status);
    } else {
      data = await getTasks(pageIndex);
    }

    setTasks(data ?? []);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Could not load tasks."
    );
  } finally {
    setIsLoading(false);
  }
}, [filters, pageIndex]);

  // Debounce so search-as-you-type doesn't fire a request per keystroke.
  useEffect(() => {
    const timeout = setTimeout(load, filters.search ? 350 : 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pageIndex, view]);

  function handleFiltersChange(nextFilters: TaskFilters) {
    setFilters(nextFilters);
    setPage(1); // Reset to first page whenever filters change.
  }

  async function handleCreate(values: TaskFormValues) {
    await createTask(values);
    setPage(1);
    await load();
  }

  async function handleSave(id: string, values: Partial<TaskFormValues>) {
    const updated = await updateTask(values);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  }

  async function handleDelete(id: string) {
    await deleteTask(id);
    // If this was the last task on the page, step back a page after reload.
    const wasLastOnPage = tasks.length === 1 && page > 1;
    if (wasLastOnPage) {
      setPage((p) => p - 1);
    } else {
      await load();
    }
  }



  return (
    <div className="min-h-screen bg-canvas">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <FilterBar
            filters={filters}
            onChange={handleFiltersChange}
            onCreateClick={() => setIsModalOpen(true)}
            view={view}
            onViewChange={setView}
          />
        </div>

        {view === 'table' ? (
          <div className="card overflow-hidden">
            <TaskTable
              tasks={tasks}
              isLoading={isLoading}
              error={error}
              hasFilters={hasFilters}
              onSave={handleSave}
              onDelete={handleDelete}
            />
            <Pagination page={page}  onPageChange={setPage} productsCount={tasks.length} />
          </div>
        ) : (
          <KanbanBoard
            tasks={tasks}
            isLoading={isLoading}
            error={error}
            onStatusChange={handleSave}
            />
        )}
      </main>

      <CreateTaskModal open={isModalOpen} onClose={() => setIsModalOpen(false)} onCreate={handleCreate} />
    </div>
  );
}
