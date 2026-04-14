import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth }   from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import { useGame }   from '../hooks/useGame';
import { LayoutDashboard, Bot, LogOut, Wifi, WifiOff, ChevronRight, ChevronDown } from 'lucide-react';

const PROFILE = 'Profile_1';

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `${r},${g},${b}`;
}

export default function Layout({ children, title }) {
  const { user, logout }          = useAuth();
  const navigate                  = useNavigate();
  const location                  = useLocation();
  const { connected }             = useSocket();
  const { game, games, setGame }  = useGame();
  const [dropdownOpen, setDropdown] = useState(false);

  const handleLogout = async () => { await logout(); navigate('/login', { replace: true }); };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard',              path: '/' },
    { icon: Bot,             label: PROFILE.replace('_', ' '), path: `/profile/${PROFILE}` },
  ];

  const rgb = hexToRgb(game.color);

  return (
    <div className="layout-root">
      <aside className="sidebar">
        {/* Brand */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 24 }}>{game.emoji}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: game.color }}>{game.label}</div>
            <div style={{ fontSize: 8, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
              Pothli & Cashback
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '14px 8px', overflowY: 'auto' }}>
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '6px 12px 8px' }}>
            Navigation
          </div>

          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} className={`nav-item ${isActive ? 'active' : ''}`}>
                <item.icon size={14} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {isActive && <ChevronRight size={11} />}
              </Link>
            );
          })}

          {/* Game selector */}
          <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '14px 12px 6px' }}>
            Game Server
          </div>

          <div onClick={() => setDropdown(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
            border: `1px solid rgba(${rgb},0.35)`, background: `rgba(${rgb},0.08)`,
            transition: 'all 0.12s', marginBottom: 2,
          }}>
            <span style={{ fontSize: 14 }}>{game.emoji}</span>
            <span style={{ flex: 1, fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {game.label}
            </span>
            <ChevronDown size={12} style={{ color: 'var(--text-muted)', transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
          </div>

          {dropdownOpen && (
            <div style={{ margin: '2px 0 6px', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden', background: 'var(--bg-raised)' }}>
              {games.map(g => {
                const gr     = hexToRgb(g.color);
                const active = g.id === game.id;
                return (
                  <div key={g.id} onClick={() => { setGame(g.id); setDropdown(false); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 12px', cursor: 'pointer',
                      borderLeft: `2px solid ${active ? g.color : 'transparent'}`,
                      background: active ? `rgba(${gr},0.10)` : 'transparent',
                    }}>
                    <span style={{ fontSize: 13 }}>{g.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: active ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: active ? 700 : 400 }}>
                        {g.label}
                      </div>
                      {/* Feature badges */}
                      <div style={{ display: 'flex', gap: 3, marginTop: 2, flexWrap: 'wrap' }}>
                        {g.supportsPothli && (
                          <span style={{ fontSize: 7, fontFamily: 'var(--font-mono)', color: '#a78bfa', background: 'rgba(167,139,250,0.12)', padding: '1px 4px', borderRadius: 3 }}>
                            POTHLI
                          </span>
                        )}
                        {g.supportsCashback && (
                          <span style={{ fontSize: 7, fontFamily: 'var(--font-mono)', color: '#34d399', background: 'rgba(52,211,153,0.12)', padding: '1px 4px', borderRadius: 3 }}>
                            CASHBACK
                          </span>
                        )}
                      </div>
                    </div>
                    {active && (
                      <span style={{ fontSize: 8, fontFamily: 'var(--font-mono)', color: g.color, letterSpacing: 1 }}>ACTIVE</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px', marginBottom: 4, fontFamily: 'var(--font-mono)', fontSize: 9, color: connected ? 'var(--success)' : 'var(--text-muted)' }}>
            {connected ? <Wifi size={11} /> : <WifiOff size={11} />}
            {connected ? 'LIVE' : 'OFFLINE'}
          </div>
          {user && (
            <div style={{ padding: '6px 12px', marginBottom: 4 }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
          )}
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '7px 12px', borderRadius: 6, cursor: 'pointer', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: 12 }}>
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {title && (
          <div style={{ padding: '16px 24px 0', marginBottom: 4 }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{title}</h1>
          </div>
        )}
        <div style={{ padding: '16px 24px' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
