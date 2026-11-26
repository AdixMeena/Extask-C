import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { tasksApi } from '../api/endpoints.js';
import EmptyState from '../components/EmptyState.jsx';
import { TaskCardSkeleton } from '../components/Skeleton.jsx';
import TaskCard from '../components/TaskCard.jsx';
import { useApi } from '../hooks/useApi.js';
import { useDebounced } from '../hooks/useDebounced.js';
import { CATEGORY_SUGGESTIONS } from '../utils/constants.js';

const EMPTY = { q: '', category: '', location: '', minBudget: '', maxBudget: '', status: 'open' };

// Filters live in the URL (?q=tap&location=Indore), so a search can be bookmarked or shared.
export default function BrowseTasks() {
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState(() => ({ ...EMPTY, ...Object.fromEntries(params) }));
  const debounced = useDebounced(filters);
  const page = Math.max(1, Number(params.get('page')) || 1);

  // Push debounced filters into the URL; any filter change goes back to page 1.
  useEffect(() => {
    const next = {};
    for (const [k, v] of Object.entries(debounced)) if (v && !(k === 'status' && v === 'open')) next[k] = v;
    if (JSON.stringify(next) !== JSON.stringify(Object.fromEntries([...params].filter(([k]) => k !== 'page')))) {
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const query = Object.fromEntries(params);
  const { data, loading, error } = useApi(() => tasksApi.list({ ...query, limit: 12 }), [params.toString()]);
  const tasks = data?.tasks ?? [];

  const onChange = (e) => setFilters((f) => ({ ...f, [e.target.name]: e.target.value }));
  const goTo = (p) => setParams({ ...query, page: String(p) });

  return (
    <div className="container browse">
      <aside className="filters" aria-label="Filter tasks">
        <h1>Browse tasks</h1>
        <label htmlFor="q">Search</label>
        <input id="q" name="q" className="input" placeholder="tap, tutor, sofa…" value={filters.q} onChange={onChange} />
        <label htmlFor="category">Category</label>
        <input id="category" name="category" className="input" list="cats" placeholder="Any" value={filters.category} onChange={onChange} />
        <datalist id="cats">{CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}</datalist>
        <label htmlFor="location">Location</label>
        <input id="location" name="location" className="input" placeholder="Indore" value={filters.location} onChange={onChange} />
        <div className="form__row">
          <div>
            <label htmlFor="minBudget">Min ₹</label>
            <input id="minBudget" name="minBudget" type="number" min="0" className="input" value={filters.minBudget} onChange={onChange} />
          </div>
          <div>
            <label htmlFor="maxBudget">Max ₹</label>
            <input id="maxBudget" name="maxBudget" type="number" min="0" className="input" value={filters.maxBudget} onChange={onChange} />
          </div>
        </div>
        <label htmlFor="status">Status</label>
        <select id="status" name="status" className="select" value={filters.status} onChange={onChange}>
          <option value="open">Open for bids</option>
          <option value="assigned">Hired</option>
          <option value="completed">Completed</option>
          <option value="all">All</option>
        </select>
        <button className="btn btn--ghost btn--sm" onClick={() => { setFilters(EMPTY); setParams({}); }}>Clear filters</button>
      </aside>

      <section aria-live="polite">
        {loading && <div className="board board--2">{[0, 1, 2, 3].map((i) => <TaskCardSkeleton key={i} />)}</div>}
        {error && <p className="alert">Could not load tasks. Please try again.</p>}
        {!loading && !error && tasks.length === 0 && (
          <EmptyState title="Nothing matches that" text="Try fewer filters, or pin the task yourself."
            action={<Link to="/post" className="btn btn--primary">Post a task</Link>} />
        )}
        {tasks.length > 0 && (
          <>
            <p className="muted results-count">{data.total} task{data.total === 1 ? '' : 's'}</p>
            <div className="board board--2">
              {tasks.map((task, i) => <TaskCard key={task.id} task={task} index={i} />)}
            </div>
            {data.totalPages > 1 && (
              <nav className="pager" aria-label="Pages">
                <button className="btn btn--sm" disabled={page <= 1} onClick={() => goTo(page - 1)}>Previous</button>
                <span>Page {page} of {data.totalPages}</span>
                <button className="btn btn--sm" disabled={page >= data.totalPages} onClick={() => goTo(page + 1)}>Next</button>
              </nav>
            )}
          </>
        )}
      </section>
    </div>
  );
}
