import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from './AuthContext';
import type { Branch } from './BranchesData';
import './Auth.css';

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state as { from?: string; branch?: Branch } | null;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    const result = register(name, email, password);
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
      <section className="auth-card" aria-labelledby="register-title">
        <h1 id="register-title">Create your account</h1>
        <p className="auth-subtitle">Register to book appointments.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Full Name<input required value={name} onChange={event => setName(event.target.value)} placeholder="Your full name" /></label>
          <label>Email Address<input type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder="you@email.com" /></label>
          <label>Password<input type="password" required value={password} onChange={event => setPassword(event.target.value)} placeholder="At least 6 characters" /></label>
          <label>Confirm Password<input type="password" required value={confirm} onChange={event => setConfirm(event.target.value)} placeholder="Re-enter your password" /></label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="primary-button auth-submit" type="submit">Register</button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login" state={returnTo}>Log in</Link></p>
      </section>
    </main>;
}