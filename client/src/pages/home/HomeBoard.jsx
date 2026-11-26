import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { tasksApi } from '../../api/endpoints.js';
import EmptyState from '../../components/EmptyState.jsx';
import Reveal from '../../components/motion/Reveal.jsx';
import { TaskCardSkeleton } from '../../components/Skeleton.jsx';
import TaskCard from '../../components/TaskCard.jsx';
import { useApi } from '../../hooks/useApi.js';

export default function HomeBoard() {
  const { data, loading, error } = useApi(() => tasksApi.list({ limit: 6 }));
  const tasks = data?.tasks ?? [];

  return (
    <section className="section container">
      <Reveal className="section__head">
        <h2>Fresh on the board</h2>
        <Link to="/tasks" className="link-arrow">All tasks <ArrowRight size={16} aria-hidden="true" /></Link>
      </Reveal>

      {loading && <div className="board">{[0, 1, 2].map((i) => <TaskCardSkeleton key={i} />)}</div>}
      {error && <p className="muted">Could not load tasks right now. Is the server running?</p>}
      {!loading && !error && tasks.length === 0 && (
        <EmptyState title="The board is empty" text="Be the first to pin a task." action={<Link to="/post" className="btn btn--primary">Post a task</Link>} />
      )}
      {tasks.length > 0 && (
        <div className="board">
          {tasks.map((task, i) => <TaskCard key={task.id} task={task} index={i} />)}
        </div>
      )}
    </section>
  );
}
