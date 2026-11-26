// Pure validation functions: no database, no Express. That makes them easy to unit test.
// Each returns { value, errors }. `value` is cleaned data; `errors` maps field -> message.

export const USERNAME_RE = /^[a-z][a-z0-9_]{2,19}$/;
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const TASK_STATUSES = ['open', 'assigned', 'completed', 'cancelled'];

const str = (v) => (typeof v === 'string' ? v.trim() : '');
const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

// Accepts 9876543210, +91 98765 43210, 09876543210 ... returns 10 digits or null.
export function normalizePhone(input) {
  if (input === undefined || input === null) return null;
  let digits = String(input).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

// Strips characters that have a special meaning inside a PostgREST `.or()` filter string.
export function sanitizeSearch(input) {
  return str(input).replace(/[,()%*\\"]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);
}

export function validateRegister(body = {}) {
  const errors = {};
  const name = str(body.name);
  const username = str(body.username).toLowerCase();
  const email = str(body.email).toLowerCase();
  const phoneRaw = str(body.phone);
  const password = typeof body.password === 'string' ? body.password : '';

  if (name.length < 2 || name.length > 60) errors.name = 'Enter your name (2 to 60 characters)';
  if (!USERNAME_RE.test(username)) {
    errors.username = 'Username must be 3 to 20 characters: letters, numbers or underscore, starting with a letter';
  }
  if (!email && !phoneRaw) errors.contact = 'Give at least an email or a phone number';
  if (email && !EMAIL_RE.test(email)) errors.email = 'That email does not look right';
  const phone = phoneRaw ? normalizePhone(phoneRaw) : null;
  if (phoneRaw && !phone) errors.phone = 'Enter a valid 10-digit Indian mobile number';
  if (password.length < 8 || password.length > 72) errors.password = 'Password must be 8 to 72 characters';

  return { value: { name, username, email: email || null, phone, password }, errors };
}

export function validateTask(body = {}) {
  const errors = {};
  const title = str(body.title);
  const description = str(body.description);
  const category = str(body.category);
  const location = str(body.location);
  const deadline = str(body.deadline) || null;
  const budget = Number(body.budget);

  if (title.length < 5 || title.length > 100) errors.title = 'Title must be 5 to 100 characters';
  if (description.length < 10 || description.length > 2000) {
    errors.description = 'Describe the task in 10 to 2000 characters';
  }
  if (!Number.isFinite(budget) || budget <= 0 || budget > 1_000_000) {
    errors.budget = 'Budget must be between ₹1 and ₹10,00,000';
  }
  if (category.length > 40) errors.category = 'Category must be 40 characters or fewer';
  if (location.length > 80) errors.location = 'Location must be 80 characters or fewer';
  if (deadline) {
    const looksRight = /^\d{4}-\d{2}-\d{2}$/.test(deadline) && !Number.isNaN(Date.parse(deadline));
    if (!looksRight) errors.deadline = 'Pick a valid date';
    else if (deadline < new Date().toISOString().slice(0, 10)) errors.deadline = 'Deadline cannot be in the past';
  }

  return {
    value: {
      title,
      description,
      category: category || null,
      budget: Math.round(budget * 100) / 100,
      location: location || null,
      deadline,
    },
    errors,
  };
}

export function validateBid(body = {}) {
  const errors = {};
  const amount = Number(body.amount);
  const message = str(body.message);
  const availability = str(body.availability);

  if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) {
    errors.amount = 'Enter your price in rupees (more than ₹0)';
  }
  if (message.length > 500) errors.message = 'Message must be 500 characters or fewer';
  if (availability.length > 100) errors.availability = 'Availability must be 100 characters or fewer';

  return {
    value: {
      amount: Math.round(amount * 100) / 100,
      message: message || null,
      availability: availability || null,
    },
    errors,
  };
}

export function validateReview(body = {}) {
  const errors = {};
  const rating = Number(body.rating);
  const comment = str(body.comment);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.rating = 'Rating must be a whole number from 1 to 5';
  if (comment.length > 500) errors.comment = 'Comment must be 500 characters or fewer';

  return { value: { rating, comment: comment || null }, errors };
}

// Only the fields that were actually sent are validated and updated.
export function validateProfileUpdate(body = {}) {
  const errors = {};
  const value = {};
  const limits = { name: [2, 60], bio: [0, 300], location: [0, 80], id_details: [0, 200] };

  for (const [field, [min, max]] of Object.entries(limits)) {
    if (!hasOwn(body, field)) continue;
    const text = str(body[field]);
    if (text.length < min || text.length > max) {
      errors[field] = min > 0 ? `Must be ${min} to ${max} characters` : `Must be ${max} characters or fewer`;
    }
    value[field] = field === 'name' ? text : text || null;
  }
  return { value, errors };
}

const toPositiveNumber = (v) => {
  if (v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

export function parseTaskFilters(query = {}) {
  const status = str(query.status).toLowerCase();
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 12));
  return {
    q: sanitizeSearch(query.q),
    category: sanitizeSearch(query.category),
    location: sanitizeSearch(query.location),
    minBudget: toPositiveNumber(query.minBudget),
    maxBudget: toPositiveNumber(query.maxBudget),
    status: status === 'all' || TASK_STATUSES.includes(status) ? status : 'open',
    page,
    limit,
  };
}
