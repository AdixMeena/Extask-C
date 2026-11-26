import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../api/errors.js';
import Field from '../components/Field.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const { user, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, from, navigate]);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const me = await login(form.identifier, form.password);
      toast.success(`Welcome back, ${me.name.split(' ')[0]}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container auth">
      <form className="panel form auth__form" onSubmit={onSubmit} noValidate>
        <h1>Log in</h1>
        {error && <p className="alert" role="alert">{error}</p>}
        <Field label="Username, email or phone" htmlFor="identifier">
          <input id="identifier" name="identifier" className="input" autoComplete="username"
            value={form.identifier} onChange={onChange} required />
        </Field>
        <Field label="Password" htmlFor="password">
          <input id="password" name="password" type="password" className="input" autoComplete="current-password"
            value={form.password} onChange={onChange} required />
        </Field>
        <button className="btn btn--primary" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
        <p className="muted">New here? <Link to="/register">Create an account</Link></p>
      </form>
      <aside className="note" aria-hidden="true">
        <p className="note__title">Same account, two hats</p>
        <p>Post a task today, bid on someone else's tomorrow. You do not need separate accounts.</p>
      </aside>
    </div>
  );
}
