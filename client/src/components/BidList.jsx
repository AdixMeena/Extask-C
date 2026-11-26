import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatINR, initialOf, timeAgo } from '../utils/format.js';
import RatingStars from './RatingStars.jsx';
import VerifiedBadge from './VerifiedBadge.jsx';

function HiredStamp() {
  return (
    <motion.span
      className="hired-stamp"
      initial={{ scale: 3, rotate: -30, opacity: 0 }}
      animate={{ scale: 1, rotate: -10, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1.3, 0.36, 1] }}
    >
      HIRED
    </motion.span>
  );
}

// Poster's view of all bids. New bids slide in; once someone is hired they get a HIRED
// stamp and everyone else fades to grey.
export default function BidList({ bids, task, onSelect, busyId }) {
  const [confirmId, setConfirmId] = useState(null);
  const canSelect = task.status === 'open';

  if (bids.length === 0) {
    return <p className="muted">No bids yet. Bids appear here by themselves as people send them.</p>;
  }

  return (
    <ul className="bid-list">
      <AnimatePresence initial={false}>
        {bids.map((bid) => {
          const hired = bid.status === 'accepted';
          const dimmed = bid.status === 'rejected' && task.status !== 'open';
          return (
            <motion.li
              key={bid.id}
              className={`bid ${hired ? 'bid--hired' : ''}`}
              initial={{ opacity: 0, x: -28 }}
              animate={{ opacity: dimmed ? 0.5 : 1, x: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {hired && <HiredStamp />}
              <div className="bid__top">
                <span className="avatar" aria-hidden="true">{initialOf(bid.bidder.name)}</span>
                <div className="bid__who">
                  <Link to={`/profile/${bid.bidder.id}`} className="bid__name">{bid.bidder.name}</Link>
                  <span className="bid__rating">
                    <RatingStars value={bid.bidder.rating_avg} size={14} />
                    <small>({bid.bidder.rating_count})</small>
                    {bid.bidder.id_verified && <VerifiedBadge small />}
                  </span>
                </div>
                <strong className="bid__amount">{formatINR(bid.amount)}</strong>
              </div>
              {bid.message && <p className="bid__msg">{bid.message}</p>}
              <div className="bid__foot">
                <span className="muted">
                  {bid.availability ? `${bid.availability} · ` : ''}
                  {timeAgo(bid.created_at)}
                </span>
                {canSelect &&
                  (confirmId === bid.id ? (
                    <span className="bid__confirm">
                      <button className="btn btn--teal btn--sm" disabled={busyId === bid.id}
                        onClick={() => { setConfirmId(null); onSelect(bid.id); }}>
                        Yes, hire {bid.bidder.name.split(' ')[0]}
                      </button>
                      <button className="btn btn--ghost btn--sm" onClick={() => setConfirmId(null)}>Cancel</button>
                    </span>
                  ) : (
                    <button className="btn btn--sm" onClick={() => setConfirmId(bid.id)}>Hire</button>
                  ))}
              </div>
            </motion.li>
          );
        })}
      </AnimatePresence>
    </ul>
  );
}
