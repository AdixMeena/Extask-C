import { CalendarDays, MapPin } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { bidsApi, tasksApi } from '../api/endpoints.js';
import { getErrorMessage } from '../api/errors.js';
import BidForm from '../components/BidForm.jsx';
import BidList from '../components/BidList.jsx';
import BudgetStamp from '../components/BudgetStamp.jsx';
import EmptyState from '../components/EmptyState.jsx';
import CheckDraw from '../components/motion/CheckDraw.jsx';
import RatingStars from '../components/RatingStars.jsx';
import ReviewSection from '../components/ReviewSection.jsx';
import { Skeleton } from '../components/Skeleton.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import VerifiedBadge from '../components/VerifiedBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { formatDate, formatINR, initialOf, timeAgo } from '../utils/format.js';

export default function TaskDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [busy, setBusy] = useState('');

  const taskReq = useApi(() => tasksApi.get(id).then((r) => r.task), [id, user?.id]);
  const task = taskReq.data;
  const isPoster = Boolean(user && task && user.id === task.poster_id);
  const isDoer = Boolean(user && task?.doer && user.id === task.doer.id);

  // Only the poster can see bids. While the task is open we poll, so new bids slide in by themselves.
  const bidsReq = useApi(() => bidsApi.forTask(id).then((r) => r.bids), [id, task?.status], {
    enabled: isPoster,
    pollMs: isPoster && task?.status === 'open' ? 20000 : 0,
  });

  if (taskReq.loading) {
    return <div className="container section"><Skeleton height={40} width="60%" /><Skeleton height={160} /></div>;
  }
  if (taskReq.error || !task) {
    return <div className="container section"><EmptyState title="Task not found" text="It may have been removed." /></div>;
  }

  const refresh = () => Promise.all([taskReq.reload(), isPoster ? bidsReq.reload() : null]);

  // Runs an action, shows a toast and refreshes. Keeps the three buttons below short.
  async function act(key, fn, success) {
    setBusy(key);
    try {
      await fn();
      toast.success(success);
      await refresh();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy('');
    }
  }

  const reviewee = isPoster ? task.doer : task.poster;
  const canReview = (isPoster || isDoer) && task.status === 'completed' && !task.my_review;

  const side = () => {
    if (!user) {
      return (
        <div className="panel">
          <h2 className="panel__title">Want to bid?</h2>
          <p className="muted">Log in to send your price on this task.</p>
          <Link to="/login" state={{ from: { pathname: `/tasks/${task.id}` } }} className="btn btn--primary">Log in to bid</Link>
        </div>
      );
    }

    if (isPoster) {
      return (
        <>
          {task.status === 'completed' && (
            <div className="panel done">
              <CheckDraw />
              <h2>Task completed</h2>
              <p className="muted">{task.doer?.name} did the work for {formatINR(task.agreed_amount)}.</p>
            </div>
          )}
          <div className="panel">
            <h2 className="panel__title">Bids ({bidsReq.data?.length ?? task.bid_count})</h2>
            {bidsReq.loading ? <Skeleton height={90} /> : (
              <BidList bids={bidsReq.data ?? []} task={task} busyId={busy.startsWith('select:') ? busy.slice(7) : null}
                onSelect={(bidId) => act(`select:${bidId}`, () => tasksApi.select(task.id, bidId), 'Bidder hired. The other bids were closed.')} />
            )}
            {task.status === 'open' && (
              <button className="btn btn--ghost btn--danger btn--sm" disabled={busy === 'cancel'}
                onClick={() => window.confirm('Cancel this task? Pending bids will be rejected.') && act('cancel', () => tasksApi.cancel(task.id), 'Task cancelled')}>
                Cancel this task
              </button>
            )}
            {task.status === 'assigned' && (
              <button className="btn btn--teal" disabled={busy === 'complete'}
                onClick={() => act('complete', () => tasksApi.complete(task.id), 'Marked as completed')}>
                {busy === 'complete' ? 'Saving…' : 'Mark as completed'}
              </button>
            )}
          </div>
          {task.status === 'completed' && (
            <div className="panel">
              <ReviewSection task={task} canReview={canReview} revieweeName={reviewee?.name} onDone={refresh} />
            </div>
          )}
        </>
      );
    }

    // A logged-in user who is not the poster.
    if (task.status === 'open') {
      return task.my_bid && task.my_bid.status !== 'pending' ? null : (
        <BidForm key={task.my_bid?.id || 'new'} task={task} existingBid={task.my_bid} onDone={refresh} />
      );
    }
    return (
      <>
        {isDoer && task.status === 'assigned' && (
          <div className="panel panel--won">
            <h2 className="panel__title">You are hired</h2>
            <p>The poster picked your bid of {formatINR(task.agreed_amount)}. They will mark the task complete when it is done.</p>
          </div>
        )}
        {task.status === 'completed' && (isDoer || task.reviews.length > 0) && (
          <div className="panel">
            {isDoer && <div className="done"><CheckDraw size={56} /><h2>Task completed</h2></div>}
            <ReviewSection task={task} canReview={canReview} revieweeName={reviewee?.name} onDone={refresh} />
          </div>
        )}
        {!isDoer && (
          <div className="panel">
            <p className="muted">This task is no longer taking bids.</p>
            {task.my_bid && <p>Your bid of {formatINR(task.my_bid.amount)}: <StatusBadge status={task.my_bid.status} /></p>}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="container detail">
      <article className="detail__main">
        <div className="detail__head">
          <div>
            <StatusBadge status={task.status} />
            <h1>{task.title}</h1>
          </div>
          <BudgetStamp amount={task.budget} size="lg" />
        </div>
        <ul className="meta">
          {task.location && <li><MapPin size={16} aria-hidden="true" /> {task.location}</li>}
          {task.deadline && <li><CalendarDays size={16} aria-hidden="true" /> Needed by {formatDate(task.deadline)}</li>}
          {task.category && <li><span className="chip">{task.category}</span></li>}
          <li className="muted">Posted {timeAgo(task.created_at)}</li>
        </ul>
        <p className="detail__desc">{task.description}</p>

        <div className="poster-card">
          <span className="avatar" aria-hidden="true">{initialOf(task.poster.name)}</span>
          <div>
            <p className="muted">Posted by</p>
            <Link to={`/profile/${task.poster.id}`} className="bid__name">{task.poster.name}</Link>
            <div className="bid__rating">
              <RatingStars value={task.poster.rating_avg} size={14} />
              <small>({task.poster.rating_count})</small>
              {task.poster.id_verified && <VerifiedBadge small />}
            </div>
          </div>
        </div>
      </article>
      <aside className="detail__side">{side()}</aside>
    </div>
  );
}
