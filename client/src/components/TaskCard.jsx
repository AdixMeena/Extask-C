import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { formatINR, timeAgo, tiltFor } from '../utils/format.js';
import BudgetStamp from './BudgetStamp.jsx';
import Pin from './Pin.jsx';
import StatusBadge from './StatusBadge.jsx';

// A paper notice pinned to the board: slightly tilted, straightens and lifts on hover.
export default function TaskCard({ task, index = 0 }) {
  const tilt = tiltFor(task.id);
  return (
    <motion.article
      className="task-card"
      initial={{ opacity: 0, y: 24, rotate: tilt }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: (index % 3) * 0.07 }}
      whileHover="hover"
      variants={{ hover: { rotate: 0, y: -6, transition: { duration: 0.18, ease: 'easeOut' } } }}
    >
      <motion.span
        className="task-card__pin"
        variants={{ hover: { rotate: [0, -16, 12, -6, 0], transition: { duration: 0.45, ease: 'easeOut' } } }}
      >
        <Pin />
      </motion.span>
      <div className="task-card__stamp">
        <BudgetStamp amount={task.budget} />
      </div>

      <h3 className="task-card__title">
        <Link to={`/tasks/${task.id}`} className="stretched-link">
          {task.title}
        </Link>
      </h3>
      <p className="task-card__desc">{task.description}</p>

      <div className="task-card__meta">
        {task.location && (
          <span>
            <MapPin size={14} aria-hidden="true" /> {task.location}
          </span>
        )}
        {task.category && <span className="chip">{task.category}</span>}
      </div>
      <div className="task-card__foot">
        <span>
          {task.bid_count ?? 0} bid{task.bid_count === 1 ? '' : 's'} · {timeAgo(task.created_at)}
        </span>
        {task.status !== 'open' && <StatusBadge status={task.status} />}
      </div>
      <span className="sr-only">Budget {formatINR(task.budget)}</span>
    </motion.article>
  );
}
