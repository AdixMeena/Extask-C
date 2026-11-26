// All backend calls in one place. Components never write URLs themselves,
// so if an endpoint changes, this is the only file to edit.
import api from './client.js';

const data = (promise) => promise.then((res) => res.data);

export const authApi = {
  register: (body) => data(api.post('/auth/register', body)),
  login: (body) => data(api.post('/auth/login', body)),
  me: () => data(api.get('/auth/me')),
};

export const usersApi = {
  get: (id) => data(api.get(`/users/${id}`)),
  update: (body) => data(api.put('/users/me', body)),
  reviews: (id) => data(api.get(`/users/${id}/reviews`)),
};

export const tasksApi = {
  list: (params) => data(api.get('/tasks', { params })),
  mine: () => data(api.get('/tasks/mine')),
  get: (id) => data(api.get(`/tasks/${id}`)),
  create: (body) => data(api.post('/tasks', body)),
  cancel: (id) => data(api.put(`/tasks/${id}/cancel`)),
  select: (id, bidId) => data(api.put(`/tasks/${id}/select/${bidId}`)),
  complete: (id) => data(api.put(`/tasks/${id}/complete`)),
};

export const bidsApi = {
  place: (taskId, body) => data(api.post(`/tasks/${taskId}/bids`, body)),
  forTask: (taskId) => data(api.get(`/tasks/${taskId}/bids`)),
  mine: () => data(api.get('/bids/mine')),
};

export const reviewsApi = {
  create: (taskId, body) => data(api.post(`/tasks/${taskId}/reviews`, body)),
};
