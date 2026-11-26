import { useState } from 'react';
import { Link } from 'react-router-dom';
import { tasksApi } from '../api/endpoints.js';
import EmptyState from '../components/EmptyState.jsx';
import Reveal from '../components/motion/Reveal.jsx';
import { Skeleton } from '../components/Skeleton.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useApi } from '../hooks/useApi.js';
import { formatINR, timeAgo } from '../utils/format.js';

const TABS = ['all', 'open', 'assigned', 'completed', 'cancelled'];
const TAB_LABEL = { all: 'All', open: 'Open', assigned: 'Hired', completed: 'Done', cancelled: 'Cancelled' };

export default function MyTasks() {
  const { data, loading, error } = useApi(() => tasksApi.mine());
  const [tab, setTab] = useState('all');
  const tasks = (data?.tasks ?? []).filter((t) => tab === 'all' || t.status === tab);

  return (
    <div className="container section">
      <div className="section__head">
        <h1>My tasks</h1>
        <Link to="/post" className="btn btn--primary btn--sm">Post a task</Link>
      </div>
      <div className="tabs" role="tablist">
        {TABS.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={`tab ${tab === t ? 'is-active' : ''}`} onClick={() => setTab(t)}>
            {TAB_LABEL[t]}
          </button>
        ))}
      </div>
      {loading && <Skeleton height={80} />}
      {error && <p className="alert">Could not load your tasks.</p>}
      {!loading && !error && tasks.length === 0 && (
        <EmptyState title="Nothing here yet" text="Tasks you post show up here with their bids." />
      )}
      <ul className="rows">
        {tasks.map((t, i) => (
          <Reveal as="li" key={t.id} delay={(i % 5) * 0.05} className="row">
            <div>
              <Link to={`/tasks/${t.id}`} className="row__title">{t.title}</Link>
              <p className="muted">{t.location || 'Anywhere'} · posted {timeAgo(t.created_at)}</p>
            </div>
            <div className="row__side">
              <strong>{formatINR(t.budget)}</strong>
              <span className="muted">{t.bid_count} bid{t.bid_count === 1 ? '' : 's'}</span>
              <StatusBadge status={t.status} />
            </div>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
