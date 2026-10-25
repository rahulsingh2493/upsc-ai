import { useCallback, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthContext';
import GoogleButton from '../components/GoogleButton';
import Logo from '../components/Logo';

const spokes = Array.from({ length: 24 }, (_, i) => {
  const a = (i * 15 * Math.PI) / 180;
  return { x1: 100 + 12 * Math.cos(a), y1: 100 + 12 * Math.sin(a), x2: 100 + 80 * Math.cos(a), y2: 100 + 80 * Math.sin(a) };
});

export default function LoginPage() {
  const { login, register, loginWithGoogle } = useAuth();
  const [signup, setSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const run = useCallback(async (fn: () => Promise<void>) => {
    setBusy(true); setError('');
    try { await fn(); } catch (e) { setError((e as Error).message); } finally { setBusy(false); }
  }, []);

  const onGoogle = useCallback((credential: string) => run(() => loginWithGoogle(credential)), [run, loginWithGoogle]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (signup && !name.trim()) return setError('Enter your name.');
    void run(() => signup ? register(name.trim(), email.trim(), password) : login(email.trim(), password));
  };

  return (
    <main className="login">
      <section className="brand">
        <Logo />
        <div>
          <h1>Prepare for UPSC with a tutor that knows the syllabus.</h1>
          <p>Ask about Polity, History, Geography, Economy, Ethics and Current Affairs. Get answers shaped for Prelims and Mains.</p>
        </div>
        <ul>{['Prelims', 'Mains', 'Essay', 'Optional', 'Interview'].map((t) => <li key={t}>{t}</li>)}</ul>
        <svg className="chakra" viewBox="0 0 200 200" fill="none" stroke="#fff" strokeWidth="1.5" aria-hidden="true">
          <circle cx="100" cy="100" r="92" /><circle cx="100" cy="100" r="80" /><circle cx="100" cy="100" r="10" />
          {spokes.map((s, i) => <line key={i} {...s} />)}
        </svg>
      </section>

      <section className="formside">
        <div className="card">
          <h2>{signup ? 'Create your account' : 'Welcome'}</h2>
          <p className="sub">{signup ? 'Start preparing with a UPSC-focused tutor.' : 'Sign in to continue your preparation.'}</p>
          {/* <GoogleButton onCredential={onGoogle} onError={setError} />
          <div className="divider">or use email</div> */}
          <form onSubmit={submit} noValidate>
            {signup && (<><label htmlFor="name">Full name</label>
              <input id="name" className="field" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></>)}
            <label htmlFor="email">Email</label>
            <input id="email" className="field" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <label htmlFor="password">Password</label>
            <input id="password" className="field" type="password" autoComplete={signup ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="btn primary" type="submit" disabled={busy}>{busy ? 'Please wait' : signup ? 'Create account' : 'Sign in'}</button>
            <div className="err" role="alert">{error}</div>
          </form>
           <div className="divider">or</div>
          <GoogleButton onCredential={onGoogle} onError={setError} />
          <p className="swap">{signup ? 'Already registered?' : 'New here?'}{' '}
            <button type="button" onClick={() => { setSignup(!signup); setError(''); }}>{signup ? 'Sign in' : 'Create an account'}</button></p>
        </div>
      </section>
    </main>
  );
}
