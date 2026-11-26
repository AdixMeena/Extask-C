// Queries shared by several controllers live here so each rule exists in one place.
import { supabaseAdmin } from '../config/supabase.js';
import { unwrap } from '../utils/db.js';
import { notFound } from '../utils/httpError.js';
import { PROFILE_EMBED } from '../utils/serializers.js';

// `!poster_id` tells PostgREST which foreign key to follow (tasks <-> bids has two links).
export const POSTER_EMBED = `poster:profiles!poster_id(${PROFILE_EMBED})`;

export async function getTaskOrThrow(id) {
  const task = unwrap(
    await supabaseAdmin.from('tasks').select(`*, ${POSTER_EMBED}`).eq('id', id).maybeSingle()
  );
  if (!task) throw notFound('Task not found');
  return task;
}

// One extra query for the whole page instead of one per task.
// (Supabase returns at most 1000 rows per request, plenty for a page of <= 50 tasks.)
export async function withBidCounts(tasks) {
  if (tasks.length === 0) return tasks;
  const rows = unwrap(
    await supabaseAdmin.from('bids').select('task_id').in('task_id', tasks.map((t) => t.id))
  );
  const counts = {};
  for (const row of rows) counts[row.task_id] = (counts[row.task_id] || 0) + 1;
  return tasks.map((task) => ({ ...task, bid_count: counts[task.id] || 0 }));
}
