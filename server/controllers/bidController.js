import { supabaseAdmin } from '../config/supabase.js';
import { assertValid } from '../middleware/validate.js';
import { getTaskOrThrow } from '../services/taskService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { isUniqueViolation, unwrap } from '../utils/db.js';
import { conflict, forbidden } from '../utils/httpError.js';
import { PROFILE_EMBED } from '../utils/serializers.js';
import { validateBid } from '../utils/validators.js';

// Place a bid, or update your existing pending bid on the same task.
export const placeBid = asyncHandler(async (req, res) => {
  const task = await getTaskOrThrow(req.params.id);
  if (task.poster_id === req.user.id) throw forbidden('You cannot bid on your own task');
  if (task.status !== 'open') throw conflict('This task is no longer taking bids');

  const input = assertValid(validateBid(req.body));

  const existing = unwrap(
    await supabaseAdmin
      .from('bids')
      .select('id, status')
      .eq('task_id', task.id)
      .eq('bidder_id', req.user.id)
      .maybeSingle()
  );

  if (existing) {
    if (existing.status !== 'pending') throw conflict('Your bid on this task can no longer be changed');
    const bid = unwrap(await supabaseAdmin.from('bids').update(input).eq('id', existing.id).select().single());
    return res.json({ bid, updated: true });
  }

  const { data, error } = await supabaseAdmin
    .from('bids')
    .insert({ ...input, task_id: task.id, bidder_id: req.user.id })
    .select()
    .single();
  // Two quick double-clicks can race past the check above; the unique index still protects us.
  if (isUniqueViolation(error)) throw conflict('You have already bid on this task');
  return res.status(201).json({ bid: unwrap({ data, error }), updated: false });
});

// Poster only. Cheapest first, so the best price is at the top.
export const getTaskBids = asyncHandler(async (req, res) => {
  const task = await getTaskOrThrow(req.params.id);
  if (task.poster_id !== req.user.id) throw forbidden('Only the poster can see the bids on this task');

  const bids = unwrap(
    await supabaseAdmin
      .from('bids')
      .select(`*, bidder:profiles!bidder_id(${PROFILE_EMBED})`)
      .eq('task_id', task.id)
      .order('amount', { ascending: true })
  );
  res.json({ bids });
});

export const myBids = asyncHandler(async (req, res) => {
  const bids = unwrap(
    await supabaseAdmin
      .from('bids')
      .select('*, task:tasks!task_id(id, title, budget, status, location, poster_id)')
      .eq('bidder_id', req.user.id)
      .order('created_at', { ascending: false })
  );
  res.json({ bids });
});
