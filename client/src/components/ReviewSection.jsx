import { useState } from 'react';
import { reviewsApi } from '../api/endpoints.js';
import { getErrorMessage, getFieldErrors } from '../api/errors.js';
import { useToast } from '../context/ToastContext.jsx';
import Field from './Field.jsx';
import RatingStars from './RatingStars.jsx';

// Shows the reviews on a completed task, plus a rating form for whoever has not rated yet.
export default function ReviewSection({ task, canReview, revieweeName, onDone }) {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await reviewsApi.create(task.id, { rating, comment });
      toast.success('Thanks, your rating is saved');
      onDone?.();
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="reviews">
      {task.reviews.length > 0 && (
        <ul className="review-list">
          {task.reviews.map((r) => (
            <li key={r.id}>
              <RatingStars value={r.rating} size={16} />
              <p>{r.comment || <span className="muted">No comment</span>}</p>
              <small className="muted">{r.reviewer.name}</small>
            </li>
          ))}
        </ul>
      )}

      {canReview && (
        <form className="form" onSubmit={onSubmit} noValidate>
          <h3 className="panel__title">Rate {revieweeName}</h3>
          <Field label="Your rating" error={errors.rating}>
            <RatingStars value={rating} onChange={setRating} label={`Rate ${revieweeName}`} />
          </Field>
          <Field label="Comment (optional)" htmlFor="comment" error={errors.comment}>
            <textarea id="comment" className="textarea" rows={3} value={comment}
              onChange={(e) => setComment(e.target.value)} maxLength={500} />
          </Field>
          <button className="btn btn--primary" disabled={busy || rating === 0}>
            {busy ? 'Saving…' : 'Submit rating'}
          </button>
        </form>
      )}
    </div>
  );
}
