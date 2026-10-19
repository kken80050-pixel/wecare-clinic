import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from './AuthContext';
import type { Branch } from './BranchesData';
import './Auth.css';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state as { from?: string; branch?: Branch } | null;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const result = login(email, password);
    if (result) {
      setError(result);
      return;
    }
    navigate(returnTo?.from ?? '/', { state: returnTo?.branch ? { branch: returnTo.branch } : undefined });
  };

  return <main className="wecare-auth">
      <Link className="auth-brand" to="/" aria-label="WeCare Clinic home">
        <span className="auth-logo" aria-hidden="true"><Plus size={25} strokeWidth={2.7} /></span>
        <span>WeCare Clinic</span>
      </Link>
      <section className="auth-card" aria-labelledby="login-title">
        <h1 id="login-title">Welcome back</h1>
        <p className="auth-subtitle">Log in to book an appointment and manage your visits.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Email Address<input type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@email.com" /></label>
          <label>Password<input type="password" required value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter your password" /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="primary-button auth-submit" type="submit">Log In</button>
        </form>
        <p className="auth-switch">Not yet registered? <Link to="/register" state={returnTo}>Register here</Link></p>
      </section>
    </main>;
}