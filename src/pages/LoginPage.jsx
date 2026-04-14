import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [mode, setMode]       = useState('login');
  const [email, setEmail]     = useState('');
  const [password, setPass]   = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register }   = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') await login(email, password);
      else await register(email, password);
      // Firebase onAuthStateChanged will fire → ProtectedRoute allows access → navigate
      navigate('/', { replace: true });
    } catch (err) {
      const msgs = {
        'auth/user-not-found':       'No account with this email.',
        'auth/wrong-password':       'Incorrect password.',
        'auth/invalid-credential':   'Incorrect email or password.',
        'auth/email-already-in-use': 'Email already registered.',
        'auth/weak-password':        'Password must be at least 6 characters.',
        'auth/invalid-email':        'Invalid email address.',
        'auth/too-many-requests':    'Too many attempts. Try again later.',
        'auth/network-request-failed': 'Network error. Check your connection.',
      };
      setError(msgs[err.code] || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,107,26,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 380, position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 52, marginBottom: 10, lineHeight: 1 }}>🔥</div>
          <div style={{
            fontFamily: 'var(--font-sans)', fontWeight: 800, fontSize: 26,
            letterSpacing: '-0.5px', marginBottom: 4,
          }}>
            Pothli<span style={{ color: 'var(--accent)' }}> & Cashback</span>
          </div>
          <div style={{
            fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)',
            letterSpacing: 2, textTransform: 'uppercase',
          }}>
            Claimer Pro — v1.0
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ border: '1px solid var(--border-lit)' }}>

          {/* Toggle */}
          <div style={{
            display: 'flex', background: 'var(--bg-raised)',
            borderRadius: 'var(--radius-sm)', padding: 3, marginBottom: 22,
          }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); }} style={{
                flex: 1, padding: '7px 0', border: 'none', cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
                background: mode === m ? 'var(--bg-hover)' : 'transparent',
                color: mode === m ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
                letterSpacing: 1, textTransform: 'uppercase',
                transition: 'all 0.15s',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.4)' : 'none',
              }}>
                {m}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="input" type="email" required
                autoComplete="email"
                placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="input" type="password" required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••"
                value={password} onChange={e => setPass(e.target.value)} />
            </div>

            {error && (
              <div style={{
                padding: '8px 12px', marginBottom: 14,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: 'var(--radius-sm)', color: 'var(--danger)',
                fontFamily: 'var(--font-mono)', fontSize: 11,
              }}>{error}</div>
            )}

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? (
                <span style={{
                  display: 'inline-block', width: 13, height: 13,
                  border: '2px solid #050508', borderTopColor: 'transparent',
                  borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                }} />
              ) : (
                mode === 'login' ? '🔥 SIGN IN' : '→ CREATE ACCOUNT'
              )}
            </button>
          </form>
        </div>

        <p style={{
          textAlign: 'center', marginTop: 20,
          fontFamily: 'var(--font-mono)', fontSize: 9,
          color: 'var(--text-muted)', letterSpacing: 1,
        }}>
          CLAIMER PRO v1.0 — SECURE SESSION
        </p>
      </div>
    </div>
  );
}
