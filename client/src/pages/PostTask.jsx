import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksApi } from '../api/endpoints.js';
import { getErrorMessage, getFieldErrors } from '../api/errors.js';
import Field from '../components/Field.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { CATEGORY_SUGGESTIONS } from '../utils/constants.js';

export default function PostTask() {
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ title: '', description: '', category: '', budget: '', location: '', deadline: '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const { task } = await tasksApi.create(form);
      toast.success('Your task is on the board');
      navigate(`/tasks/${task.id}`);
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container auth auth--wide">
      <form className="panel form auth__form" onSubmit={onSubmit} noValidate>
        <h1>Post a task</h1>
        <Field label="What do you need done?" htmlFor="title" error={errors.title} hint="Short and specific, like “Fix a leaking tap in Indore”">
          <input id="title" name="title" className="input" value={form.title} onChange={onChange} maxLength={100} required />
        </Field>
        <Field label="Details" htmlFor="description" error={errors.description} hint="What, where, any tools or parts you already have">
          <textarea id="description" name="description" className="textarea" rows={5} value={form.description} onChange={onChange} maxLength={2000} required />
        </Field>
        <div className="form__row">
          <Field label="Budget (₹)" htmlFor="budget" error={errors.budget}>
            <input id="budget" name="budget" type="number" min="1" inputMode="numeric" className="input" value={form.budget} onChange={onChange} required />
          </Field>
          <Field label="Category (optional)" htmlFor="category" error={errors.category}>
            <input id="category" name="category" className="input" list="cats" value={form.category} onChange={onChange} />
            <datalist id="cats">{CATEGORY_SUGGESTIONS.map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
        </div>
        <div className="form__row">
          <Field label="Location" htmlFor="location" error={errors.location}>
            <input id="location" name="location" className="input" placeholder="Indore" value={form.location} onChange={onChange} />
          </Field>
          <Field label="Needed by (optional)" htmlFor="deadline" error={errors.deadline}>
            <input id="deadline" name="deadline" type="date" min={today} className="input" value={form.deadline} onChange={onChange} />
          </Field>
        </div>
        <button className="btn btn--primary" disabled={busy}>{busy ? 'Pinning…' : 'Pin it to the board'}</button>
      </form>
      <aside className="note" aria-hidden="true">
        <p className="note__title">A good notice has four things</p>
        <p>What needs doing, where, by when, and what you can pay.</p>
        <p className="note__example">“Fix a leaking tap in Indore, ₹400”</p>
        <p>That is already enough for people to bid.</p>
      </aside>
    </div>
  );
}
