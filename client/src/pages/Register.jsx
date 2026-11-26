import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getErrorMessage, getFieldErrors } from '../api/errors.js';
import Field from '../components/Field.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Register() {
  const { user, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setError('');
    try {
      const me = await register(form);
      toast.success(`Welcome to ExTask, ${me.name.split(' ')[0]}`);
    } catch (err) {
      setErrors(getFieldErrors(err));
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container auth">
      <form className="panel form auth__form" onSubmit={onSubmit} noValidate>
        <h1>Join ExTask</h1>
        {error && <p className="alert" role="alert">{error}</p>}
        <Field label="Full name" htmlFor="name" error={errors.name}>
          <input id="name" name="name" className="input" autoComplete="name" value={form.name} onChange={onChange} required />
        </Field>
        <Field label="Username" htmlFor="username" error={errors.username} hint="Letters, numbers, underscore. You can log in with it.">
          <input id="username" name="username" className="input" autoComplete="username" value={form.username} onChange={onChange} required />
        </Field>
        <div className="form__row">
          <Field label="Email" htmlFor="email" error={errors.email || errors.contact}>
            <input id="email" name="email" type="email" className="input" autoComplete="email" value={form.email} onChange={onChange} />
          </Field>
          <Field label="Phone" htmlFor="phone" error={errors.phone} hint="Email or phone, at least one">
            <input id="phone" name="phone" type="tel" inputMode="numeric" className="input" autoComplete="tel" value={form.phone} onChange={onChange} />
          </Field>
        </div>
        <Field label="Password" htmlFor="password" error={errors.password} hint="At least 8 characters">
          <input id="password" name="password" type="password" className="input" autoComplete="new-password" value={form.password} onChange={onChange} required />
        </Field>
        <button className="btn btn--primary" disabled={busy}>{busy ? 'Creating…' : 'Create account'}</button>
        <p className="muted">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
      <aside className="note" aria-hidden="true">
        <p className="note__title">No OTP, no waiting</p>
        <p>Sign up with just a phone number if you like. You can log in later with your username, email or phone.</p>
      </aside>
    </div>
  );
}
