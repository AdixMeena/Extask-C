export const formatINR = (n) =>
  `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export function timeAgo(iso) {
  const seconds = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  const steps = [
    [60, 'second'], [60, 'minute'], [24, 'hour'], [7, 'day'], [4.345, 'week'], [12, 'month'], [Infinity, 'year'],
  ];
  let value = seconds;
  for (const [limit, unit] of steps) {
    if (value < limit) {
      const n = Math.max(1, Math.floor(value));
      return unit === 'second' ? 'just now' : `${n} ${unit}${n > 1 ? 's' : ''} ago`;
    }
    value /= limit;
  }
  return '';
}

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

// A stable "random" tilt between -2 and 2 degrees, derived from the id so a card never changes angle on re-render.
export function tiltFor(id = '') {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return ((Math.abs(hash) % 41) - 20) / 10;
}

export const initialOf = (name = '?') => name.trim().charAt(0).toUpperCase() || '?';
