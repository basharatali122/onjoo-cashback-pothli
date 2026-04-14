import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { processingAPI } from '../services/api';
import { useAuth }   from '../hooks/useAuth';
import Layout        from '../components/Layout';
import { useGame }   from '../hooks/useGame';
import { Bot, Gift, Coins, TrendingUp, ArrowRight, Activity } from 'lucide-react';

export const USER_PROFILE = 'Profile_1';

export default function DashboardPage() {
  const navigate        = useNavigate();
  const { user }        = useAuth();
  const { game }        = useGame();
  const [status, setStatus] = useState({ running: false });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await processingAPI.status(USER_PROFILE);
      setStatus(r.data || { running: false });
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  const running    = status.running;
  const stats      = status.stats || {};
  const claimMode  = status.claimMode;
  const modeLabel  = claimMode === 'cashback' ? 'Cashback' : 'Pothli';
  const modeColor  = claimMode === 'cashback' ? '#34d399' : '#a78bfa';
  const modeEmoji  = claimMode === 'cashback' ? '💰' : '🎁';

  const statCards = [
    { label: 'Bot Status',       value: running ? 'ACTIVE' : 'IDLE',                icon: Bot,       accent: running },
    { label: 'Claims Made',      value: (stats.pothliClaimed || stats.cashbackClaimed || 0).toLocaleString(), icon: Gift,      accent: true },
    { label: 'Total Won',        value: (stats.totalScoreWon || stats.totalCashbackAmount || 0).toLocaleString(), icon: Coins,     accent: true },
    { label: 'Success Rate',     value: stats.successCount > 0 ? `${Math.round(stats.successCount/(stats.successCount+stats.failCount)*100)}%` : '—', icon: TrendingUp, accent: false },
  ];

  return (
    <Layout title="Dashboard">
      <div style={{ maxWidth: 860 }}>

        {/* Session banner */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-secondary)', minWidth: 200 }}>
            <Activity size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />
            <span>Session: <strong style={{ color: 'var(--text-primary)' }}>{user?.email}</strong></span>
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, color: running ? 'var(--accent)' : 'var(--text-muted)' }}>
              {running ? '● running' : '○ idle'}
            </span>
          </div>

          <div style={{ background: 'var(--bg-surface)', border: `1px solid ${game.color}40`, borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <span style={{ fontSize: 14 }}>{game.emoji}</span>
            <span style={{ color: 'var(--text-secondary)' }}>Game:</span>
            <span style={{ color: game.color, fontWeight: 700 }}>{game.label}</span>
          </div>

          {running && (
            <div style={{ background: 'var(--bg-surface)', border: `1px solid ${modeColor}40`, borderRadius: 8, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
              <span style={{ fontSize: 14 }}>{modeEmoji}</span>
              <span style={{ color: modeColor, fontWeight: 700 }}>{modeLabel} Mode</span>
            </div>
          )}
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, marginBottom: 24 }}>
          {statCards.map(card => (
            <div key={card.label} className="card" style={{ textAlign: 'center', padding: '20px 16px' }}>
              <card.icon size={20} style={{ color: 'var(--accent)', margin: '0 auto 8px' }} />
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 800, color: card.accent ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                {loading ? '—' : card.value}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
                {card.label}
              </div>
            </div>
          ))}
        </div>

        {/* Quick nav */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 16 }}>
            <span className="card-title">Quick Actions</span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => navigate(`/profile/${USER_PROFILE}`)}>
              <Bot size={14} />
              {running ? 'View Running Bot' : 'Start Bot'}
              <ArrowRight size={13} />
            </button>
          </div>

          {/* Feature support for active game */}
          <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg-raised)', borderRadius: 6 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
              {game.label} Supported Features
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 12, background: game.supportsPothli ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)', color: game.supportsPothli ? '#a78bfa' : 'var(--text-muted)', border: `1px solid ${game.supportsPothli ? 'rgba(167,139,250,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                {game.supportsPothli ? '✓' : '✗'} Pothli / Theli
              </span>
              <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 12, background: game.supportsCashback ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.04)', color: game.supportsCashback ? '#34d399' : 'var(--text-muted)', border: `1px solid ${game.supportsCashback ? 'rgba(52,211,153,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                {game.supportsCashback ? '✓' : '✗'} Cashback
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
