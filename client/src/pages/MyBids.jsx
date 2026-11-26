import { Link } from 'react-router-dom';
import { bidsApi } from '../api/endpoints.js';
import EmptyState from '../components/EmptyState.jsx';
import Reveal from '../components/motion/Reveal.jsx';
import { Skeleton } from '../components/Skeleton.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { useApi } from '../hooks/useApi.js';
import { formatINR, timeAgo } from '../utils/format.js';

export default function MyBids() {
  const { data, loading, error } = useApi(() => bidsApi.mine());
  const bids = data?.bids ?? [];

  return (
    <div className="container section">
      <div className="section__head">
        <h1>My bids</h1>
        <Link to="/tasks" className="btn btn--sm">Find tasks</Link>
      </div>
      {loading && <Skeleton height={80} />}
      {error && <p className="alert">Could not load your bids.</p>}
      {!loading && !error && bids.length === 0 && (
        <EmptyState title="You have not bid yet" text="Find a task near you and send your price."
          action={<Link to="/tasks" className="btn btn--primary">Browse tasks</Link>} />
      )}
      <ul className="rows">
        {bids.map((b, i) => (
          <Reveal as="li" key={b.id} delay={(i % 5) * 0.05} className={`row ${b.status === 'accepted' ? 'row--won' : ''}`}>
            <div>
              <Link to={`/tasks/${b.task.id}`} className="row__title">{b.task.title}</Link>
              <p className="muted">
                Your bid {formatINR(b.amount)} on a {formatINR(b.task.budget)} task · {timeAgo(b.created_at)}
              </p>
              {b.status === 'accepted' && <p className="won">You are hired for this one.</p>}
            </div>
            <div className="row__side">
              <StatusBadge status={b.status} />
              {b.task.status !== 'open' && <span className="muted">task {b.task.status}</span>}
            </div>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
