import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { GameProvider }          from './hooks/useGame';
import LoginPage                 from './pages/LoginPage';
import DashboardPage             from './pages/DashboardPage';
import ProfilePage               from './pages/ProfilePage';

export const USER_PROFILE = 'Profile_1';

// ── ProtectedRoute — uses Firebase auth state, NOT localStorage ──────────────
// The original used localStorage._claimer_token which was never set → login
// appeared to succeed but RequireAuth always redirected back to /login.
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Still initializing Firebase auth state — show nothing to avoid flash
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#050508',
        color: '#00ff88', fontFamily: 'monospace', fontSize: 13, letterSpacing: 2,
      }}>
        INITIALIZING...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

// ── AuthRoute — redirect already-logged-in users away from /login ─────────────
function AuthRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/profile/:profileName" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </GameProvider>
    </AuthProvider>
  );
}
