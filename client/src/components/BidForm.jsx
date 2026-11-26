import { useState } from 'react';
import { bidsApi } from '../api/endpoints.js';
import { getErrorMessage, getFieldErrors } from '../api/errors.js';
import { useToast } from '../context/ToastContext.jsx';
import Field from './Field.jsx';

// Place a bid, or edit your pending one (existingBid prefills the form).
export default function BidForm({ task, existingBid, onDone }) {
  const toast = useToast();
  const [form, setForm] = useState({
    amount: existingBid?.amount ?? '',
    message: existingBid?.message ?? '',
    availability: existingBid?.availability ?? '',
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const isEdit = Boolean(existingBid);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await bidsApi.place(task.id, form);
      toast.success(isEdit ? 'Bid updated' : 'Bid placed. The poster has been shown your price.');
      onDone?.();
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel form" onSubmit={onSubmit} noValidate>
      <h2 className="panel__title">{isEdit ? 'Change your bid' : 'Bid on this task'}</h2>
      <Field label="Your price (₹)" htmlFor="amount" error={errors.amount} hint={`Poster's budget: ₹${task.budget}`}>
        <input id="amount" name="amount" type="number" min="1" step="1" inputMode="numeric" className="input"
          value={form.amount} onChange={onChange} required />
      </Field>
      <Field label="When can you do it?" htmlFor="availability" error={errors.availability}>
        <input id="availability" name="availability" className="input" placeholder="Today after 6 pm"
          value={form.availability} onChange={onChange} maxLength={100} />
      </Field>
      <Field label="A line about you" htmlFor="message" error={errors.message}>
        <textarea id="message" name="message" className="textarea" rows={3}
          placeholder="I have fixed two taps like this before…" value={form.message} onChange={onChange} maxLength={500} />
      </Field>
      <button className="btn btn--primary" disabled={busy}>
        {busy ? 'Sending…' : isEdit ? 'Update bid' : 'Place bid'}
      </button>
    </form>
  );
}
