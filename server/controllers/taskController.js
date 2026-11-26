import { supabaseAdmin } from '../config/supabase.js';
import { assertValid } from '../middleware/validate.js';
import { POSTER_EMBED, getTaskOrThrow, withBidCounts } from '../services/taskService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { unwrap } from '../utils/db.js';
import { HttpError, conflict, forbidden, notFound } from '../utils/httpError.js';
import { PROFILE_EMBED } from '../utils/serializers.js';
import { parseTaskFilters, validateTask } from '../utils/validators.js';

export const createTask = asyncHandler(async (req, res) => {
  const input = assertValid(validateTask(req.body));
  const task = unwrap(
    await supabaseAdmin
      .from('tasks')
      .insert({ ...input, poster_id: req.user.id })
      .select(`*, ${POSTER_EMBED}`)
      .single()
  );
  res.status(201).json({ task: { ...task, bid_count: 0 } });
});

export const listTasks = asyncHandler(async (req, res) => {
  const f = parseTaskFilters(req.query);

  let query = supabaseAdmin.from('tasks').select(`*, ${POSTER_EMBED}`, { count: 'exact' });
  if (f.status !== 'all') query = query.eq('status', f.status);
  // f.q is sanitised by parseTaskFilters, so it cannot break out of the filter string.
  if (f.q) query = query.or(`title.ilike.%${f.q}%,description.ilike.%${f.q}%`);
  if (f.category) query = query.ilike('category', f.category);
  if (f.location) query = query.ilike('location', `%${f.location}%`);
  if (f.minBudget !== null) query = query.gte('budget', f.minBudget);
  if (f.maxBudget !== null) query = query.lte('budget', f.maxBudget);

  const from = (f.page - 1) * f.limit;
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range(from, from + f.limit - 1);

  // PGRST103 = asked for a page past the end. That is just an empty page, not a failure.
  const rows = error?.code === 'PGRST103' ? [] : unwrap({ data, error });
  const total = count ?? 0;

  res.json({
    tasks: await withBidCounts(rows),
    page: f.page,
    limit: f.limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / f.limit)),
  });
});

export const myTasks = asyncHandler(async (req, res) => {
  const rows = unwrap(
    await supabaseAdmin
      .from('tasks')
      .select(`*, ${POSTER_EMBED}`)
      .eq('poster_id', req.user.id)
      .order('created_at', { ascending: false })
  );
  res.json({ tasks: await withBidCounts(rows) });
});

// Task page: the task, who posted it, who was hired, the viewer's own bid and the reviews.
export const getTask = asyncHandler(async (req, res) => {
  const task = await getTaskOrThrow(req.params.id);
  const [withCount] = await withBidCounts([task]);
  const payload = { ...withCount, doer: null, agreed_amount: null, my_bid: null, reviews: [], my_review: null };

  if (task.selected_bid_id) {
    const bid = unwrap(
      await supabaseAdmin
        .from('bids')
        .select(`id, amount, bidder:profiles!bidder_id(${PROFILE_EMBED})`)
        .eq('id', task.selected_bid_id)
        .maybeSingle()
    );
    payload.doer = bid?.bidder ?? null;
    payload.agreed_amount = bid?.amount ?? null;
  }

  if (req.user) {
    payload.my_bid = unwrap(
      await supabaseAdmin
        .from('bids')
        .select('*')
        .eq('task_id', task.id)
        .eq('bidder_id', req.user.id)
        .maybeSingle()
    );
  }

  if (task.status === 'completed') {
    payload.reviews = unwrap(
      await supabaseAdmin
        .from('reviews')
        .select('id, rating, comment, reviewer_id, reviewee_id, created_at, reviewer:profiles!reviewer_id(id, name, username)')
        .eq('task_id', task.id)
        .order('created_at', { ascending: true })
    );
    if (req.user) payload.my_review = payload.reviews.find((r) => r.reviewer_id === req.user.id) ?? null;
  }

  res.json({ task: payload });
});

export const cancelTask = asyncHandler(async (req, res) => {
  const task = await getTaskOrThrow(req.params.id);
  if (task.poster_id !== req.user.id) throw forbidden('Only the poster can cancel this task');
  if (task.status !== 'open') throw conflict('Only open tasks can be cancelled');

  // The extra .eq('status','open') makes this safe even if someone is hired at the same moment.
  const updated = unwrap(
    await supabaseAdmin
      .from('tasks')
      .update({ status: 'cancelled' })
      .eq('id', task.id)
      .eq('status', 'open')
      .select()
      .maybeSingle()
  );
  if (!updated) throw conflict('This task is no longer open');

  unwrap(
    await supabaseAdmin.from('bids').update({ status: 'rejected' }).eq('task_id', task.id).eq('status', 'pending')
  );
  res.json({ task: updated });
});

// select_bid(): one Postgres function does everything in a single transaction.
// Its error codes (EX403/EX404/EX409) are mapped back to HTTP statuses here.
const RPC_ERRORS = { EX403: forbidden, EX404: notFound, EX409: conflict };

export const selectBid = asyncHandler(async (req, res) => {
  const { data, error } = await supabaseAdmin.rpc('select_bid', {
    p_task_id: req.params.id,
    p_bid_id: req.params.bidId,
    p_poster_id: req.user.id,
  });
  if (error) {
    const make = RPC_ERRORS[error.code];
    if (make) throw make(error.message);
    console.error('[rpc select_bid]', error);
    throw new HttpError(500, 'Could not select this bidder');
  }
  res.json({ task: data });
});

export const completeTask = asyncHandler(async (req, res) => {
  const task = await getTaskOrThrow(req.params.id);
  if (task.poster_id !== req.user.id) throw forbidden('Only the poster can mark this task completed');
  if (task.status !== 'assigned') throw conflict('Only a task with a hired bidder can be completed');

  const updated = unwrap(
    await supabaseAdmin
      .from('tasks')
      .update({ status: 'completed' })
      .eq('id', task.id)
      .eq('status', 'assigned')
      .select()
      .maybeSingle()
  );
  if (!updated) throw conflict('This task was already updated');
  res.json({ task: updated });
});
