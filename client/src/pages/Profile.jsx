import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { authApi, usersApi } from '../api/endpoints.js';
import { getErrorMessage, getFieldErrors } from '../api/errors.js';
import EmptyState from '../components/EmptyState.jsx';
import Field from '../components/Field.jsx';
import RatingStars from '../components/RatingStars.jsx';
import { Skeleton } from '../components/Skeleton.jsx';
import VerifiedBadge from '../components/VerifiedBadge.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { formatDate, initialOf } from '../utils/format.js';

export default function Profile() {
  const { id } = useParams();
  const { user, setUser } = useAuth();
  const toast = useToast();
  const isOwn = user?.id === id;

  // Own profile comes from /auth/me, which includes private fields (email, phone, ID notes).
  const profileReq = useApi(() => (isOwn ? authApi.me() : usersApi.get(id)).then((r) => r.user), [id, isOwn]);
  const reviewsReq = useApi(() => usersApi.reviews(id).then((r) => r.reviews), [id]);
  const profile = profileReq.data;

  // All hooks stay above the early returns below (rules of hooks).
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (profileReq.loading) return <div className="container section"><Skeleton height={140} /></div>;
  if (profileReq.error || !profile) {
    return <div className="container section"><EmptyState title="Profile not found" text="This person may have left the board." /></div>;
  }

  const startEdit = () => {
    setForm({ name: profile.name, bio: profile.bio || '', location: profile.location || '', id_details: profile.id_details || '' });
    setErrors({});
    setEditing(true);
  };
  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSave(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      const { user: updated } = await usersApi.update(form);
      setUser(updated);
      await profileReq.reload();
      setEditing(false);
      toast.success('Profile saved');
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const reviews = reviewsReq.data ?? [];

  return (
    <div className="container profile">
      <section className="profile__head">
        <span className="avatar avatar--lg" aria-hidden="true">{initialOf(profile.name)}</span>
        <div>
          <h1>{profile.name}</h1>
          <p className="muted">@{profile.username}{profile.location ? ` · ${profile.location}` : ''}</p>
          <div className="profile__rating">
            <RatingStars value={profile.rating_avg} size={20} />
            <span>{profile.rating_count > 0 ? `${Number(profile.rating_avg).toFixed(1)} from ${profile.rating_count} rating${profile.rating_count === 1 ? '' : 's'}` : 'No ratings yet'}</span>
            {profile.id_verified && <VerifiedBadge />}
          </div>
          <p className="muted">Member since {formatDate(profile.created_at)}</p>
        </div>
        {isOwn && !editing && <button className="btn btn--sm" onClick={startEdit}>Edit profile</button>}
      </section>

      {profile.bio && !editing && <p className="profile__bio">{profile.bio}</p>}

      {isOwn && !editing && (
        <section className="panel">
          <h2 className="panel__title">Your details (only you see this)</h2>
          <p>{profile.email || 'No email'} · {profile.phone || 'No phone'}</p>
          <p className="muted">
            {profile.id_verified
              ? 'Your ID details were checked. The Verified badge shows on your profile.'
              : profile.id_details
                ? 'ID details submitted. The Verified badge is added after they are checked.'
                : 'Add ID details (for example the last digits of your Aadhaar) to get a Verified badge.'}
          </p>
        </section>
      )}

      {editing && (
        <form className="panel form" onSubmit={onSave} noValidate>
          <h2 className="panel__title">Edit profile</h2>
          <Field label="Name" htmlFor="name" error={errors.name}>
            <input id="name" name="name" className="input" value={form.name} onChange={onChange} />
          </Field>
          <Field label="Location" htmlFor="location" error={errors.location}>
            <input id="location" name="location" className="input" value={form.location} onChange={onChange} />
          </Field>
          <Field label="About you" htmlFor="bio" error={errors.bio}>
            <textarea id="bio" name="bio" className="textarea" rows={3} value={form.bio} onChange={onChange} maxLength={300} />
          </Field>
          <Field label="ID details" htmlFor="id_details" error={errors.id_details} hint="Shown only to you. We check these by hand before adding the Verified badge.">
            <input id="id_details" name="id_details" className="input" placeholder="Aadhaar ending 1234" value={form.id_details} onChange={onChange} />
          </Field>
          <div className="form__actions">
            <button className="btn btn--primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
            <button type="button" className="btn btn--ghost" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      )}

      <section>
        <h2>What people say</h2>
        {reviewsReq.loading && <Skeleton height={60} />}
        {!reviewsReq.loading && reviews.length === 0 && <p className="muted">No reviews yet.</p>}
        <ul className="review-list">
          {reviews.map((r) => (
            <li key={r.id}>
              <RatingStars value={r.rating} size={16} />
              <p>{r.comment || <span className="muted">No comment</span>}</p>
              <small className="muted">{r.reviewer.name} · {r.task?.title}</small>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
