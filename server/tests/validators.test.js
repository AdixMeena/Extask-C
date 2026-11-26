import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  normalizePhone,
  parseTaskFilters,
  sanitizeSearch,
  validateBid,
  validateRegister,
  validateReview,
  validateTask,
} from '../utils/validators.js';

test('normalizePhone accepts common Indian formats', () => {
  assert.equal(normalizePhone('9876543210'), '9876543210');
  assert.equal(normalizePhone('+91 98765 43210'), '9876543210');
  assert.equal(normalizePhone('09876543210'), '9876543210');
  assert.equal(normalizePhone('1234567890'), null);
  assert.equal(normalizePhone('98765'), null);
});

test('validateRegister needs email or phone, a good username and password', () => {
  const bad = validateRegister({ name: 'A', username: '1x', password: 'short' });
  assert.ok(bad.errors.name && bad.errors.username && bad.errors.contact && bad.errors.password);

  const ok = validateRegister({ name: 'Asha Rao', username: 'Asha_R', phone: '98765 43210', password: 'longenough1' });
  assert.deepEqual(ok.errors, {});
  assert.equal(ok.value.username, 'asha_r');
  assert.equal(ok.value.phone, '9876543210');
  assert.equal(ok.value.email, null);
});

test('validateTask checks budget and deadline', () => {
  const bad = validateTask({ title: 'Fix tap', description: 'too short', budget: -5, deadline: '2000-01-01' });
  assert.ok(bad.errors.description && bad.errors.budget && bad.errors.deadline);

  const ok = validateTask({ title: 'Fix a leaking tap', description: 'Kitchen tap drips all night', budget: '400' });
  assert.deepEqual(ok.errors, {});
  assert.equal(ok.value.budget, 400);
  assert.equal(ok.value.category, null);
});

test('validateBid and validateReview enforce ranges', () => {
  assert.ok(validateBid({ amount: 0 }).errors.amount);
  assert.deepEqual(validateBid({ amount: '350.5', message: ' hi ' }).value, {
    amount: 350.5,
    message: 'hi',
    availability: null,
  });
  assert.ok(validateReview({ rating: 6 }).errors.rating);
  assert.ok(validateReview({ rating: 2.5 }).errors.rating);
  assert.deepEqual(validateReview({ rating: 5 }).errors, {});
});

test('sanitizeSearch removes filter-breaking characters', () => {
  assert.equal(sanitizeSearch('tap,(x)%*'), 'tap x');
});

test('parseTaskFilters applies safe defaults', () => {
  const f = parseTaskFilters({ page: '-3', limit: '500', status: 'nonsense', minBudget: 'abc' });
  assert.equal(f.page, 1);
  assert.equal(f.limit, 50);
  assert.equal(f.status, 'open');
  assert.equal(f.minBudget, null);
  assert.equal(parseTaskFilters({ status: 'all' }).status, 'all');
});
