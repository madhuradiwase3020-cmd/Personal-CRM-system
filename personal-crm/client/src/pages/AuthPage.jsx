import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, Waypoints } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthPage({ mode }) {
  const registering = mode === 'register';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const { user, authenticate } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  if (user) return <Navigate to="/" replace />;
  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    try {
      const result = registering ? await api.register(form) : await api.login(form);
      authenticate(result);
      navigate('/', { replace: true });
    } catch (error) {
      toast(error.message, 'error');
    } finally { setBusy(false); }
  };
  return <div className="auth-screen">
    <section className="auth-art">
      <div className="auth-brand"><span className="brand-mark"><Waypoints size={21} /></span> kindred<span className="brand-dot">.</span></div>
      <div className="auth-art-content"><span className="eyebrow light-eyebrow">A MORE THOUGHTFUL CRM</span><h1>Good relationships<br />are built <em>one moment</em><br />at a time.</h1><p>A gentle space to remember people, nurture connections, and show up when it matters.</p><div className="art-quote"><span>“</span><div><p>The smallest act of kindness is worth more than the grandest intention.</p><small>— Oscar Wilde</small></div></div></div>
      <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-footnote">YOUR PEOPLE. YOUR STORY. YOUR KIND OF CRM.</div>
    </section>
    <section className="auth-form-side"><div className="auth-form-wrap"><div className="auth-mobile-brand"><span className="brand-mark"><Waypoints size={20} /></span> kindred<span className="brand-dot">.</span></div><span className="eyebrow">{registering ? 'LET’S GET STARTED' : 'WELCOME BACK'}</span><h2>{registering ? 'Create your account' : 'Good to see you again'}</h2><p className="auth-subtitle">{registering ? 'Your thoughtful approach to relationships starts here.' : 'Pick up right where your relationships left off.'}</p>
      <form className="auth-form" onSubmit={submit}>
        {registering && <label className="field"><span>Your name</span><input autoComplete="name" required value={form.name} placeholder="Alex Morgan" onChange={event => setForm({ ...form, name: event.target.value })} /></label>}
        <label className="field"><span>Email address</span><input type="email" autoComplete="email" required value={form.email} placeholder="you@example.com" onChange={event => setForm({ ...form, email: event.target.value })} /></label>
        <label className="field"><span>Password</span><input type="password" autoComplete={registering ? 'new-password' : 'current-password'} minLength={registering ? 8 : undefined} required value={form.password} placeholder={registering ? 'At least 8 characters' : 'Enter your password'} onChange={event => setForm({ ...form, password: event.target.value })} />{registering && <small>Use at least 8 characters.</small>}</label>
        <button className="button button-primary auth-submit" disabled={busy}>{busy ? 'Please wait…' : registering ? 'Create account' : 'Sign in'} <ArrowRight size={17} /></button>
      </form><div className="auth-switch">{registering ? 'Already have an account?' : 'New to Kindred?'} <Link to={registering ? '/login' : '/register'}>{registering ? 'Sign in' : 'Create an account'}</Link></div><div className="auth-secure"><span>✦</span> Your contacts are private and only visible to you.</div></div></section>
  </div>;
}
