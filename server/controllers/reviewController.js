import { supabaseAdmin } from '../config/supabase.js';
import { assertValid } from '../middleware/validate.js';
import { getTaskOrThrow } from '../services/taskService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isUniqueViolation, unwrap } from '../utils/db.js';
import { conflict, forbidden } from '../utils/httpError.js';
import { validateReview } from '../utils/validators.js';

// The poster rates the hired doer and the doer rates the poster, once each, after completion.
// The reviewee's rating_avg / rating_count are refreshed by a Postgres trigger.
export const createReview = asyncHandler(async (req, res) => {
  const task = await getTaskOrThrow(req.params.id);
  if (task.status !== 'completed') throw conflict('You can rate only after the task is completed');

  const bid = unwrap(
    await supabaseAdmin.from('bids').select('bidder_id').eq('id', task.selected_bid_id).maybeSingle()
  );
  const doerId = bid?.bidder_id;
  if (!doerId) throw conflict('This task has no hired doer to rate');

  const me = req.user.id;
  if (me !== task.poster_id && me !== doerId) {
    throw forbidden('Only the poster and the hired doer can rate each other');
  }
  const revieweeId = me === task.poster_id ? doerId : task.poster_id;
  const { rating, comment } = assertValid(validateReview(req.body));

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .insert({ task_id: task.id, reviewer_id: me, reviewee_id: revieweeId, rating, comment })
    .select()
    .single();
  if (isUniqueViolation(error)) throw conflict('You have already rated this task');
  res.status(201).json({ review: unwrap({ data, error }) });
});

export const listUserReviews = asyncHandler(async (req, res) => {
  const reviews = unwrap(
    await supabaseAdmin
      .from('reviews')
      .select(
        'id, rating, comment, created_at, reviewer:profiles!reviewer_id(id, name, username), task:tasks!task_id(id, title)'
      )
      .eq('reviewee_id', req.params.id)
      .order('created_at', { ascending: false })
      .limit(30)
  );
  res.json({ reviews });
});
