// Central place that decides which profile columns are safe to show to whom.
// `auth_email` (the internal Supabase login email) is never exposed.
export const PUBLIC_PROFILE_COLUMNS =
  'id, name, username, location, bio, id_verified, rating_avg, rating_count, created_at';

// Only the owner sees contact details and ID notes.
export const PRIVATE_PROFILE_COLUMNS = `${PUBLIC_PROFILE_COLUMNS}, email, phone, id_details`;

// Small profile snapshot embedded inside tasks / bids / reviews.
export const PROFILE_EMBED = 'id, name, username, location, id_verified, rating_avg, rating_count';
