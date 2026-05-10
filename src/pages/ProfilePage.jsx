// import { useState, useEffect, useRef, useCallback, memo } from 'react';
// import { useParams } from 'react-router-dom';
// import Layout from '../components/Layout';
// import { useBotEvents } from '../hooks/useSocket';
// import { accountsAPI, processingAPI, proxyAPI } from '../services/api';
// import { useGame } from '../hooks/useGame';
// import { Play, Square, Upload, Trash2, RefreshCw, Shield, Terminal, Users, Plus, BarChart3 } from 'lucide-react';

// // ── Terminal ───────────────────────────────────────────────────────────────────
// const BotTerminal = memo(function BotTerminal({ logs }) {
//   const endRef       = useRef(null);
//   const containerRef = useRef(null);
//   const [autoScroll, setAutoScroll] = useState(true);

//   useEffect(() => {
//     if (autoScroll) endRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [logs, autoScroll]);

//   const handleScroll = () => {
//     const el = containerRef.current;
//     if (!el) return;
//     setAutoScroll(el.scrollHeight - el.scrollTop - el.clientHeight < 50);
//   };

//   const colorMap = {
//     success: 'terminal-success', error: 'terminal-error',
//     warning: 'terminal-warning', debug: 'terminal-debug', info: 'terminal-info',
//   };

//   return (
//     <div className="terminal" ref={containerRef} onScroll={handleScroll}>
//       {logs.length === 0 && (
//         <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
//           Waiting for bot output...
//         </div>
//       )}
//       {logs.map((log, i) => (
//         <div key={i} className="terminal-line">
//           <span className="terminal-time">
//             {new Date(log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
//           </span>
//           <span className={colorMap[log.type] || 'terminal-info'}>{log.message}</span>
//         </div>
//       ))}
//       <div ref={endRef} />
//     </div>
//   );
// });

// // ── Claim Mode Selector ────────────────────────────────────────────────────────
// function ClaimModeSelector({ value, onChange, disabled, game }) {
//   const modes = [
//     {
//       id:    'pothli',
//       emoji: '🎁',
//       title: 'Pothli / Theli',
//       sub:   'Gift Bag Claim',
//       desc:  'Claims the daily Pothli / Theli gift bag for each account. Fast single-step claim.',
//       pills: ['subID:29', 'Response:145', 'Daily Gift'],
//       color: '#a78bfa',
//       locked: !game?.supportsPothli,
//     },
//     {
//       id:    'cashback',
//       emoji: '💰',
//       title: 'Cashback',
//       sub:   'Cashback Reward',
//       desc:  game?.supportsCashback
//         ? 'Claims accumulated cashback reward. Checks availability then claims.'
//         : `${game?.label} does not support cashback.`,
//       pills: game?.supportsCashback
//         ? ['subID:28', 'Response:144', 'Check→Claim']
//         : ['Not Available'],
//       color: '#34d399',
//       locked: !game?.supportsCashback,
//     },
//   ];

//   return (
//     <div>
//       <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
//         Select Claim Mode
//       </div>
//       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
//         {modes.map(mode => {
//           const selected   = value === mode.id;
//           const isLocked   = mode.locked;
//           const isDisabled = disabled || isLocked;
//           return (
//             <div key={mode.id}
//               onClick={() => !isDisabled && onChange(mode.id)}
//               style={{
//                 position: 'relative', padding: '14px 12px', borderRadius: 8, cursor: isDisabled ? 'not-allowed' : 'pointer',
//                 opacity: isLocked ? 0.45 : 1,
//                 border: `2px solid ${selected && !isLocked ? mode.color : 'var(--border)'}`,
//                 background: selected && !isLocked ? `${mode.color}10` : 'var(--bg-raised)',
//                 transition: 'all 0.15s', textAlign: 'center',
//               }}>
//               <div style={{ fontSize: 24, marginBottom: 6 }}>{mode.emoji}</div>
//               <div style={{ fontSize: 13, fontWeight: 700, color: selected && !isLocked ? mode.color : 'var(--text-primary)', marginBottom: 2 }}>
//                 {mode.title}
//               </div>
//               <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>{mode.sub}</div>
//               <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>{mode.desc}</div>
//               <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
//                 {mode.pills.map(p => (
//                   <span key={p} style={{ fontSize: 8, fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: 3, background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
//                     {p}
//                   </span>
//                 ))}
//               </div>
//               {selected && !isLocked && (
//                 <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: mode.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#050508', fontWeight: 800 }}>✓</div>
//               )}
//               {isLocked && (
//                 <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, color: 'var(--text-muted)' }}>🔒</div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// // ── Proxy Panel ────────────────────────────────────────────────────────────────
// function ProxyPanel({ profile }) {
//   const [config, setConfig]     = useState({ enabled: false, proxyList: [] });
//   const [proxyText, setText]    = useState('');
//   const [status, setStatus]     = useState('');
//   const [statusOk, setStatusOk] = useState(true);
//   const [testing, setTesting]   = useState(false);
//   const [saving, setSaving]     = useState(false);
//   const [norming, setNorming]   = useState(false);

//   useEffect(() => {
//     proxyAPI.get(profile).then(r => {
//       const cfg  = r.data.config || {};
//       setConfig(cfg);
//       setText(Array.isArray(cfg.proxyList) ? cfg.proxyList.join('\n') : '');
//     }).catch(() => {});
//   }, [profile]);

//   const showSt = (msg, ok = true) => { setStatus(msg); setStatusOk(ok); };

//   const handleNormalize = async () => {
//     setNorming(true);
//     try {
//       const r = await proxyAPI.normalize(profile, proxyText);
//       if (r.data.success) { setText(r.data.normalized.join('\n')); showSt(`✅ ${r.data.count} proxies normalized`); }
//     } catch { showSt('❌ Normalize failed', false); }
//     setNorming(false);
//   };

//   const handleTest = async () => {
//     const first = proxyText.split('\n').map(l => l.trim()).find(Boolean);
//     if (!first) { showSt('⚠️ No proxy to test', false); return; }
//     setTesting(true); showSt('⏳ Testing live connection...');
//     try {
//       const r = await proxyAPI.test(profile, first);
//       showSt(r.data.message, r.data.success);
//     } catch { showSt('❌ Test failed', false); }
//     setTesting(false);
//   };

//   const handleSave = async () => {
//     setSaving(true);
//     try {
//       const r = await proxyAPI.save(profile, { ...config, proxyList: proxyText.split('\n').filter(Boolean) });
//       showSt(`✅ Saved ${r.data.saved} proxies`);
//     } catch { showSt('❌ Save failed', false); }
//     setSaving(false);
//   };

//   return (
//     <div>
//       <label className="checkbox-label" style={{ marginBottom: 16 }}>
//         <input type="checkbox" checked={config.enabled}
//           onChange={e => setConfig(c => ({ ...c, enabled: e.target.checked }))} />
//         Enable proxy for this profile
//       </label>

//       {config.enabled && (
//         <>
//           <div className="form-group">
//             <label className="form-label">
//               Proxy List
//               <span style={{ marginLeft: 6, color: 'var(--text-muted)', fontWeight: 400, fontSize: 10 }}>
//                 — all formats accepted, one per line
//               </span>
//             </label>
//             <div style={{ background: 'var(--bg-raised)', borderRadius: 4, padding: '8px 10px', marginBottom: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.7 }}>
//               <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 3 }}>Accepted formats:</div>
//               <div>socks5h://user:pass@host:port</div>
//               <div>socks5://user:pass@host:port</div>
//               <div>http://user:pass@host:port</div>
//               <div>user:pass@host:port <span style={{ color: 'var(--accent)', fontSize: 9 }}>← auto → socks5h</span></div>
//               <div>host:port:user:pass <span style={{ color: 'var(--accent)', fontSize: 9 }}>← auto → socks5h</span></div>
//             </div>
//             <textarea className="textarea" rows={7}
//               placeholder={'socks5h://user:pass@45.39.25.184:5619\nuser:pass@gw.dataimpulse.com:10037\n45.39.25.184:5619:user:pass'}
//               value={proxyText} onChange={e => setText(e.target.value)}
//               style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} />
//           </div>
//           <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
//             <button className="btn btn-warning btn-sm" onClick={handleNormalize} disabled={norming}>{norming ? '...' : '⇄ Normalize'}</button>
//             <button className="btn btn-ghost btn-sm"   onClick={handleTest}      disabled={testing}>{testing ? '...' : '⚡ Test First'}</button>
//             <button className="btn btn-primary btn-sm" onClick={handleSave}      disabled={saving}>{saving ? '...' : '↑ Save'}</button>
//           </div>
//         </>
//       )}

//       <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
//         <div style={{ width: 7, height: 7, borderRadius: '50%', background: config.enabled ? 'var(--success)' : 'var(--text-muted)' }} />
//         <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
//           {config.enabled ? `Proxy active — ${Array.isArray(config.proxyList) ? config.proxyList.length : 0} proxies` : 'No proxy — direct connection'}
//         </span>
//       </div>

//       {status && (
//         <div style={{ marginTop: 10, padding: '7px 10px', borderRadius: 4, background: 'var(--bg-raised)', fontFamily: 'var(--font-mono)', fontSize: 11, color: statusOk ? 'var(--success)' : 'var(--danger)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
//           {status}
//         </div>
//       )}
//     </div>
//   );
// }

// // ── Accounts Table ─────────────────────────────────────────────────────────────
// function AccountsTable({ profile }) {
//   const [accounts, setAccounts]     = useState([]);
//   const [loading, setLoading]       = useState(true);
//   const [showImport, setShowImport] = useState(false);
//   const [showGen, setShowGen]       = useState(false);
//   const [importText, setImportText] = useState('');
//   const [status, setStatus]         = useState('');
//   const [statusType, setStatusType] = useState('info');

//   const [genUser, setGenUser]   = useState('');
//   const [genStart, setGenStart] = useState(1);
//   const [genEnd, setGenEnd]     = useState(100);
//   const [genPass, setGenPass]   = useState('');
//   const [generating, setGen]    = useState(false);

//   const setMsg = (m, t = 'info') => { setStatus(m); setStatusType(t); };

//   const load = useCallback(async () => {
//     setLoading(true);
//     try { const r = await accountsAPI.getAll(profile); setAccounts(r.data.accounts || []); }
//     catch { setMsg('Failed to load', 'error'); }
//     setLoading(false);
//   }, [profile]);

//   useEffect(() => { load(); }, [load]);

//   const handleImport = async () => {
//     const parsed = importText.trim().split('\n').map(l => {
//       const [u, pw] = l.trim().split(':');
//       return u && pw ? { username: u.trim(), password: pw.trim() } : null;
//     }).filter(Boolean);
//     if (!parsed.length) { setMsg('⚠️ No valid lines (format: user:pass)', 'error'); return; }
//     try {
//       const r = await accountsAPI.bulkImport(profile, parsed);
//       setImportText(''); setShowImport(false);
//       setMsg(`✅ Added ${r.data.added} | Skipped ${r.data.duplicates} duplicates`, 'success');
//       await load();
//     } catch { setMsg('❌ Import failed', 'error'); }
//   };

//   const handleGenerate = async () => {
//     if (!genUser.trim()) { setMsg('⚠️ Username prefix required', 'error'); return; }
//     if (genStart > genEnd) { setMsg('⚠️ Start must be ≤ End', 'error'); return; }
//     setGen(true); setMsg(`Generating ${genEnd - genStart + 1} accounts...`);
//     try {
//       const r = await accountsAPI.generate(profile, { username: genUser.trim(), startRange: genStart, endRange: genEnd, password: genPass.trim() || 'password123' });
//       setMsg(`✅ Generated ${r.data.generated || 0} | Added ${r.data.added} | Skipped ${r.data.duplicates}`, 'success');
//       setShowGen(false); await load();
//     } catch (e) { setMsg(`❌ ${e.message}`, 'error'); }
//     setGen(false);
//   };

//   const handleClearAll = async () => {
//     if (!confirm(`Clear ALL ${accounts.length} accounts? Cannot be undone.`)) return;
//     try { await accountsAPI.clearAll(profile); setMsg('✅ All cleared', 'success'); await load(); }
//     catch { setMsg('❌ Clear failed', 'error'); }
//   };

//   return (
//     <div>
//       {/* Toolbar */}
//       <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
//         <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
//           {accounts.length.toLocaleString()} accounts
//         </span>
//         <div style={{ flex: 1 }} />
//         <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}><RefreshCw size={11} className={loading ? 'spin' : ''} /></button>
//         <button className="btn btn-ghost btn-sm"    onClick={() => setShowImport(v => !v)}><Upload size={11} /> Import</button>
//         <button className="btn btn-primary btn-sm"  onClick={() => setShowGen(v => !v)}><Plus size={11} /> Generate</button>
//         {accounts.length > 0 && <button className="btn btn-danger btn-sm" onClick={handleClearAll}><Trash2 size={11} /> Clear All</button>}
//       </div>

//       {status && (
//         <div style={{ padding: '6px 10px', marginBottom: 10, borderRadius: 4, background: 'var(--bg-raised)', fontFamily: 'var(--font-mono)', fontSize: 11, color: statusType === 'success' ? 'var(--success)' : statusType === 'error' ? 'var(--danger)' : 'var(--text-secondary)' }}>
//           {status}
//         </div>
//       )}

//       {/* Import panel */}
//       {showImport && (
//         <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 6, padding: 12, marginBottom: 12 }}>
//           <div className="form-label" style={{ marginBottom: 6 }}>Import accounts (user:pass per line)</div>
//           <textarea className="textarea" rows={5} placeholder="zaib111:password123&#10;zaib112:password123"
//             value={importText} onChange={e => setImportText(e.target.value)}
//             style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} />
//           <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={handleImport}>Import</button>
//         </div>
//       )}

//       {/* Generate panel */}
//       {showGen && (
//         <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 6, padding: 12, marginBottom: 12 }}>
//           <div className="form-label" style={{ marginBottom: 8 }}>Generate accounts</div>
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: 8, marginBottom: 8 }}>
//             <div>
//               <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>Username prefix</div>
//               <input className="input" value={genUser} onChange={e => setGenUser(e.target.value)} placeholder="zaib" />
//             </div>
//             <div>
//               <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>Start</div>
//               <input className="input" type="number" value={genStart} onChange={e => setGenStart(+e.target.value)} />
//             </div>
//             <div>
//               <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>End</div>
//               <input className="input" type="number" value={genEnd} onChange={e => setGenEnd(+e.target.value)} />
//             </div>
//           </div>
//           <div style={{ marginBottom: 8 }}>
//             <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>Password</div>
//             <input className="input" value={genPass} onChange={e => setGenPass(e.target.value)} placeholder="password123" />
//           </div>
//           {genUser && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>Preview: {genUser}{String(genStart).padStart(String(genEnd).length,'0')} … {genUser}{genEnd} ({genEnd-genStart+1} accounts)</div>}
//           <button className="btn btn-primary btn-sm" onClick={handleGenerate} disabled={generating}>{generating ? 'Generating...' : 'Generate'}</button>
//         </div>
//       )}

//       {/* Accounts list */}
//       <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 6 }}>
//         {accounts.length === 0 ? (
//           <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
//             No accounts yet. Import or generate above.
//           </div>
//         ) : (
//           <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
//             <thead>
//               <tr style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)' }}>
//                 {['#', 'Username', 'Score', 'Last Processed'].map(h => (
//                   <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 10 }}>{h}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {accounts.map((acc, i) => (
//                 <tr key={acc.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
//                   <td style={{ padding: '5px 10px', color: 'var(--text-muted)' }}>{i + 1}</td>
//                   <td style={{ padding: '5px 10px', color: 'var(--text-primary)' }}>{acc.username}</td>
//                   <td style={{ padding: '5px 10px', color: 'var(--accent)' }}>{acc.score || 0}</td>
//                   <td style={{ padding: '5px 10px', color: 'var(--text-muted)' }}>{acc.last_processed ? new Date(acc.last_processed).toLocaleString() : '—'}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </div>
//     </div>
//   );
// }

// // ── Stats Panel ────────────────────────────────────────────────────────────────
// function StatsPanel({ liveStats, claimMode }) {
//   if (!liveStats) return (
//     <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '20px 0' }}>
//       No live stats yet. Start the bot to see real-time data.
//     </div>
//   );

//   const isPothli   = claimMode !== 'cashback';
//   const claimedKey = isPothli ? 'pothliClaimed' : 'cashbackClaimed';
//   const amountKey  = isPothli ? 'totalScoreWon'  : 'totalCashbackAmount';

//   const items = [
//     { label: 'Success',       value: liveStats.successCount   || 0 },
//     { label: 'Failed',        value: liveStats.failCount       || 0 },
//     { label: 'Claimed',       value: liveStats[claimedKey]     || 0 },
//     { label: isPothli ? 'Already Claimed' : 'No Cashback',
//       value: isPothli ? (liveStats.alreadyClaimed || 0) : (liveStats.noCashback || 0) },
//     { label: isPothli ? 'Score Won' : 'Amount Won',
//       value: liveStats[amountKey] || 0, color: 'var(--accent)' },
//     { label: 'IP Ban Skipped',value: liveStats.ipBannedSkipped || 0, color: 'var(--danger)' },
//     { label: 'Wrong Pass',    value: liveStats.wrongPassSkipped|| 0, color: 'var(--warning)' },
//     { label: 'Active Workers',value: liveStats.activeWorkers   || 0 },
//   ];

//   return (
//     <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 8 }}>
//       {items.map(item => (
//         <div key={item.label} style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', textAlign: 'center' }}>
//           <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, color: item.color || 'var(--text-primary)' }}>
//             {item.value}
//           </div>
//           <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.8 }}>
//             {item.label}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }







// // ── Main ProfilePage ───────────────────────────────────────────────────────────
// export default function ProfilePage() {
//   const { profileName } = useParams();
//   const { game }        = useGame();

//   const [tab,         setTab]         = useState('terminal');
//   const [logs,        setLogs]        = useState([]);
//   const [botStatus,   setBotStatus]   = useState({ running: false });
//   const [liveStats,   setLiveStats]   = useState(null);
//   const [starting,    setStarting]    = useState(false);
//   const [repetitions, setReps]        = useState(1);

//   // Claim mode — persisted per-profile
//   const modeKey = `_claimer_mode_${profileName}`;
//   const [claimMode, setClaimMode] = useState(
//     () => localStorage.getItem(modeKey) || 'pothli'
//   );

//   const handleModeChange = (mode) => {
//     if (botStatus.running) return;
//     // Auto-switch if locked for this game
//     if (mode === 'cashback' && !game.supportsCashback) return;
//     if (mode === 'pothli'   && !game.supportsPothli)   return;
//     setClaimMode(mode);
//     localStorage.setItem(modeKey, mode);
//   };

//   // Auto-correct mode if game doesn't support it
//   useEffect(() => {
//     if (claimMode === 'cashback' && !game.supportsCashback) {
//       setClaimMode('pothli'); localStorage.setItem(modeKey, 'pothli');
//     }
//     if (claimMode === 'pothli' && !game.supportsPothli) {
//       setClaimMode('cashback'); localStorage.setItem(modeKey, 'cashback');
//     }
//   }, [game]);

//   // Socket events
//   const handleEvent = useCallback((event, data) => {
//     if (event === 'bot:terminal') {
//       setLogs(prev => [...prev.slice(-600), data]);
//     } else if (event === 'bot:status') {
//       setBotStatus(data);
//       if (data.running) setLiveStats(prev => ({ ...prev, ...data, ...data.stats }));
//     } else if (event === 'bot:completed') {
//       setBotStatus(s => ({ ...s, running: false }));
//     } else if (event === 'bot:progress') {
//       setLiveStats(data.stats || null);
//     } else if (event === 'bot:cycleUpdate') {
//       setBotStatus(s => ({ ...s, currentCycle: data.cyclesCompleted, totalCycles: data.totalCycles }));
//       setLiveStats(prev => ({ ...prev, ...data }));
//     }
//   }, []);

//   useBotEvents(profileName, handleEvent);

//   // Poll status
//   useEffect(() => {
//     const poll = async () => {
//       try {
//         const r = await processingAPI.status(profileName);
//         setBotStatus(r.data);
//         if (r.data.claimMode) {
//           setClaimMode(r.data.claimMode);
//           localStorage.setItem(modeKey, r.data.claimMode);
//         }
//         if (r.data.stats) setLiveStats(r.data.stats);
//       } catch (_) {}
//     };
//     poll();
//     const iv = setInterval(poll, 10000);
//     return () => clearInterval(iv);
//   }, [profileName]);

//   const running = botStatus.running;

//   const handleStart = async () => {
//     setStarting(true);
//     try {
//       await processingAPI.start(profileName, {
//         claimMode,
//         repetitions,
//         gameConfig: {
//           LOGIN_WS_URL: game.LOGIN_WS_URL,
//           GAME_VERSION: game.GAME_VERSION,
//           ORIGIN:       game.ORIGIN,
//         },
//       });
//       setBotStatus(s => ({ ...s, running: true, claimMode }));
//       setLogs([]);
//       setTab('terminal');
//     } catch (e) {
//       setLogs(prev => [...prev, {
//         type: 'error',
//         message: `Failed to start: ${e.response?.data?.error || e.message}`,
//         timestamp: new Date().toISOString(),
//       }]);
//     }
//     setStarting(false);
//   };

//   const handleStop = async () => {
//     try {
//       await processingAPI.stop(profileName);
//       setBotStatus(s => ({ ...s, running: false }));
//     } catch (_) {}
//   };

//   const modeColor = claimMode === 'cashback' ? '#34d399' : '#a78bfa';
//   const modeEmoji = claimMode === 'cashback' ? '💰' : '🎁';
//   const modeLabel = claimMode === 'cashback' ? 'Cashback Claim' : 'Pothli Claim';

//   const TABS = [
//     { id: 'terminal', label: 'Terminal',  icon: Terminal  },
//     { id: 'accounts', label: 'Accounts',  icon: Users     },
//     { id: 'stats',    label: 'Stats',     icon: BarChart3 },
//     { id: 'proxy',    label: 'Proxy',     icon: Shield    },
//   ];

//   return (
//     <Layout title={profileName.replace('_', ' ')}>
//       <div style={{ maxWidth: 1000 }}>

//         {/* Mode Selector — hidden while running */}
//         {!running && (
//           <div className="card" style={{ marginBottom: 16 }}>
//             <ClaimModeSelector value={claimMode} onChange={handleModeChange} disabled={running} game={game} />
//           </div>
//         )}

//         {/* Control Bar */}
//         <div className="card" style={{ marginBottom: 16 }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>

//             {/* Status dot */}
//             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//               <span className={`dot ${running ? 'dot-orange dot-pulse' : 'dot-grey'}`} />
//               <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: running ? 'var(--accent)' : 'var(--text-secondary)' }}>
//                 {running ? 'RUNNING' : 'IDLE'}
//               </span>
//             </div>

//             <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

//             {/* Active mode badge */}
//             <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${modeColor}12`, border: `1px solid ${modeColor}40`, borderRadius: 20, padding: '3px 12px' }}>
//               <span style={{ fontSize: 12 }}>{modeEmoji}</span>
//               <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: modeColor, fontWeight: 700 }}>
//                 {modeLabel.toUpperCase()}
//               </span>
//             </div>

//             {/* Active game badge */}
//             <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${game.color}12`, border: `1px solid ${game.color}40`, borderRadius: 20, padding: '3px 12px' }}>
//               <span style={{ fontSize: 12 }}>{game.emoji}</span>
//               <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: game.color, fontWeight: 700 }}>
//                 {game.shortLabel}
//               </span>
//             </div>

//             {/* Cycles input */}
//             {!running && (
//               <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
//                 <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>CYCLES</span>
//                 <input type="number" value={repetitions} min={1} max={50}
//                   onChange={e => setReps(parseInt(e.target.value) || 1)}
//                   style={{ width: 60, padding: '5px 8px', background: 'var(--bg-raised)', border: '1px solid var(--border-lit)', borderRadius: 4, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none' }} />
//               </div>
//             )}

//             {running && botStatus.totalCycles > 1 && (
//               <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
//                 Cycle {botStatus.currentCycle || 0}/{botStatus.totalCycles}
//               </div>
//             )}

//             <div style={{ flex: 1 }} />

//             {!running ? (
//               <button className="btn btn-primary btn-lg" onClick={handleStart} disabled={starting}>
//                 <Play size={14} />
//                 {starting ? 'STARTING...' : `START ${modeLabel.toUpperCase()}`}
//               </button>
//             ) : (
//               <button className="btn btn-danger" onClick={handleStop}>
//                 <Square size={13} />
//                 STOP BOT
//               </button>
//             )}
//           </div>

//           {/* Progress bar */}
//           {running && botStatus.totalCycles > 1 && (
//             <div style={{ marginTop: 14 }}>
//               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 5 }}>
//                 <span>{modeLabel}</span>
//                 <span>Cycle {botStatus.currentCycle || 0}/{botStatus.totalCycles}</span>
//               </div>
//               <div className="progress-bar">
//                 <div className="progress-fill amber" style={{ width: `${botStatus.totalCycles > 0 ? ((botStatus.currentCycle || 0) / botStatus.totalCycles) * 100 : 20}%` }} />
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Tabs */}
//         <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
//           <div className="tab-nav" style={{ background: 'var(--bg-raised)', padding: '0 8px' }}>
//             {TABS.map(t => (
//               <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
//                 <t.icon size={11} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
//                 {t.label}
//               </button>
//             ))}
//           </div>

//           <div style={{ padding: 20 }}>
//             {tab === 'terminal' && (
//               <div>
//                 <div className="card-header" style={{ marginBottom: 12 }}>
//                   <span className="card-title">Live Output</span>
//                   <button className="btn btn-ghost btn-sm" onClick={() => setLogs([])}>Clear</button>
//                 </div>
//                 <BotTerminal logs={logs} />

//                 {/* Live stats strip */}
//                 {running && liveStats && (
//                   <div style={{ display: 'flex', gap: 16, marginTop: 12, padding: '8px 12px', background: 'var(--bg-raised)', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 11, flexWrap: 'wrap' }}>
//                     {[
//                       { label: 'Workers',  value: liveStats.activeWorkers || 0 },
//                       { label: 'Success',  value: liveStats.successCount  || 0, color: 'var(--success)' },
//                       { label: 'Failed',   value: liveStats.failCount     || 0, color: 'var(--danger)'  },
//                       { label: 'Claimed',  value: (liveStats.pothliClaimed || liveStats.cashbackClaimed || 0), color: modeColor },
//                       { label: 'Won',      value: (liveStats.totalScoreWon || liveStats.totalCashbackAmount || 0), color: 'var(--accent)' },
//                     ].map(s => (
//                       <div key={s.label} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
//                         <span style={{ color: 'var(--text-muted)' }}>{s.label}:</span>
//                         <span style={{ fontWeight: 700, color: s.color || 'var(--text-primary)' }}>{s.value}</span>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}
//             {tab === 'accounts' && <AccountsTable profile={profileName} />}
//             {tab === 'stats'    && <StatsPanel liveStats={liveStats} claimMode={claimMode} />}
//             {tab === 'proxy'    && <ProxyPanel profile={profileName} />}
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// }




import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { useBotEvents } from '../hooks/useSocket';
import { accountsAPI, processingAPI, proxyAPI } from '../services/api';
import { useGame } from '../hooks/useGame';
import { Play, Square, Upload, Trash2, RefreshCw, Shield, Terminal, Users, Plus, BarChart3 } from 'lucide-react';

// ── Terminal ───────────────────────────────────────────────────────────────────
const BotTerminal = memo(function BotTerminal({ logs }) {
  const endRef       = useRef(null);
  const containerRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs, autoScroll]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    setAutoScroll(el.scrollHeight - el.scrollTop - el.clientHeight < 50);
  };

  const colorMap = {
    success: 'terminal-success', error: 'terminal-error',
    warning: 'terminal-warning', debug: 'terminal-debug', info: 'terminal-info',
  };

  return (
    <div className="terminal" ref={containerRef} onScroll={handleScroll}>
      {logs.length === 0 && (
        <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
          Waiting for bot output...
        </div>
      )}
      {logs.map((log, i) => (
        <div key={i} className="terminal-line">
          <span className="terminal-time">
            {new Date(log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className={colorMap[log.type] || 'terminal-info'}>{log.message}</span>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
});

// ── Claim Mode Selector ────────────────────────────────────────────────────────
function ClaimModeSelector({ value, onChange, disabled, game }) {
  const modes = [
    {
      id:    'pothli',
      emoji: '🎁',
      title: 'Pothli / Theli',
      sub:   'Gift Bag Claim',
      desc:  'Claims the daily Pothli / Theli gift bag for each account. Fast single-step claim.',
      pills: ['subID:29', 'Response:145', 'Daily Gift'],
      color: '#a78bfa',
      locked: !game?.supportsPothli,
    },
    {
      id:    'cashback',
      emoji: '💰',
      title: 'Cashback',
      sub:   'Cashback Reward',
      desc:  game?.supportsCashback
        ? 'Claims accumulated cashback reward. Checks availability then claims.'
        : `${game?.label} does not support cashback.`,
      pills: game?.supportsCashback
        ? ['subID:28', 'Response:144', 'Check→Claim']
        : ['Not Available'],
      color: '#34d399',
      locked: !game?.supportsCashback,
    },
  ];

  return (
    <div>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 10 }}>
        Select Claim Mode
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {modes.map(mode => {
          const selected   = value === mode.id;
          const isLocked   = mode.locked;
          const isDisabled = disabled || isLocked;
          return (
            <div key={mode.id}
              onClick={() => !isDisabled && onChange(mode.id)}
              style={{
                position: 'relative', padding: '14px 12px', borderRadius: 8, cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isLocked ? 0.45 : 1,
                border: `2px solid ${selected && !isLocked ? mode.color : 'var(--border)'}`,
                background: selected && !isLocked ? `${mode.color}10` : 'var(--bg-raised)',
                transition: 'all 0.15s', textAlign: 'center',
              }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{mode.emoji}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: selected && !isLocked ? mode.color : 'var(--text-primary)', marginBottom: 2 }}>
                {mode.title}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>{mode.sub}</div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>{mode.desc}</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
                {mode.pills.map(p => (
                  <span key={p} style={{ fontSize: 8, fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: 3, background: 'var(--bg-surface)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    {p}
                  </span>
                ))}
              </div>
              {selected && !isLocked && (
                <div style={{ position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: '50%', background: mode.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#050508', fontWeight: 800 }}>✓</div>
              )}
              {isLocked && (
                <div style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, color: 'var(--text-muted)' }}>🔒</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Proxy Panel ────────────────────────────────────────────────────────────────
function ProxyPanel({ profile }) {
  const [config, setConfig]     = useState({ enabled: false, proxyList: [] });
  const [proxyText, setText]    = useState('');
  const [status, setStatus]     = useState('');
  const [statusOk, setStatusOk] = useState(true);
  const [testing, setTesting]   = useState(false);
  const [saving, setSaving]     = useState(false);
  const [norming, setNorming]   = useState(false);

  useEffect(() => {
    proxyAPI.get(profile).then(r => {
      const cfg  = r.data.config || {};
      setConfig(cfg);
      setText(Array.isArray(cfg.proxyList) ? cfg.proxyList.join('\n') : '');
    }).catch(() => {});
  }, [profile]);

  const showSt = (msg, ok = true) => { setStatus(msg); setStatusOk(ok); };

  const handleNormalize = async () => {
    setNorming(true);
    try {
      const r = await proxyAPI.normalize(profile, proxyText);
      if (r.data.success) { setText(r.data.normalized.join('\n')); showSt(`✅ ${r.data.count} proxies normalized`); }
    } catch { showSt('❌ Normalize failed', false); }
    setNorming(false);
  };

  const handleTest = async () => {
    const first = proxyText.split('\n').map(l => l.trim()).find(Boolean);
    if (!first) { showSt('⚠️ No proxy to test', false); return; }
    setTesting(true); showSt('⏳ Testing live connection...');
    try {
      const r = await proxyAPI.test(profile, first);
      showSt(r.data.message, r.data.success);
    } catch { showSt('❌ Test failed', false); }
    setTesting(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await proxyAPI.save(profile, { ...config, proxyList: proxyText.split('\n').filter(Boolean) });
      showSt(`✅ Saved ${r.data.saved} proxies`);
    } catch { showSt('❌ Save failed', false); }
    setSaving(false);
  };

  return (
    <div>
      <label className="checkbox-label" style={{ marginBottom: 16 }}>
        <input type="checkbox" checked={config.enabled}
          onChange={e => setConfig(c => ({ ...c, enabled: e.target.checked }))} />
        Enable proxy for this profile
      </label>

      {config.enabled && (
        <>
          <div className="form-group">
            <label className="form-label">
              Proxy List
              <span style={{ marginLeft: 6, color: 'var(--text-muted)', fontWeight: 400, fontSize: 10 }}>
                — all formats accepted, one per line
              </span>
            </label>
            <div style={{ background: 'var(--bg-raised)', borderRadius: 4, padding: '8px 10px', marginBottom: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.7 }}>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 3 }}>Accepted formats:</div>
              <div>socks5h://user:pass@host:port</div>
              <div>socks5://user:pass@host:port</div>
              <div>http://user:pass@host:port</div>
              <div>user:pass@host:port <span style={{ color: 'var(--accent)', fontSize: 9 }}>← auto → socks5h</span></div>
              <div>host:port:user:pass <span style={{ color: 'var(--accent)', fontSize: 9 }}>← auto → socks5h</span></div>
            </div>
            <textarea className="textarea" rows={7}
              placeholder={'socks5h://user:pass@45.39.25.184:5619\nuser:pass@gw.dataimpulse.com:10037\n45.39.25.184:5619:user:pass'}
              value={proxyText} onChange={e => setText(e.target.value)}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} />
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
            <button className="btn btn-warning btn-sm" onClick={handleNormalize} disabled={norming}>{norming ? '...' : '⇄ Normalize'}</button>
            <button className="btn btn-ghost btn-sm"   onClick={handleTest}      disabled={testing}>{testing ? '...' : '⚡ Test First'}</button>
            <button className="btn btn-primary btn-sm" onClick={handleSave}      disabled={saving}>{saving ? '...' : '↑ Save'}</button>
          </div>
        </>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: config.enabled ? 'var(--success)' : 'var(--text-muted)' }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          {config.enabled ? `Proxy active — ${Array.isArray(config.proxyList) ? config.proxyList.length : 0} proxies` : 'No proxy — direct connection'}
        </span>
      </div>

      {status && (
        <div style={{ marginTop: 10, padding: '7px 10px', borderRadius: 4, background: 'var(--bg-raised)', fontFamily: 'var(--font-mono)', fontSize: 11, color: statusOk ? 'var(--success)' : 'var(--danger)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {status}
        </div>
      )}
    </div>
  );
}

// ── Accounts Table ─────────────────────────────────────────────────────────────
function AccountsTable({ profile }) {
  const [accounts, setAccounts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [showGen, setShowGen]       = useState(false);
  const [importText, setImportText] = useState('');
  const [status, setStatus]         = useState('');
  const [statusType, setStatusType] = useState('info');

  const [genUser, setGenUser]   = useState('');
  const [genStart, setGenStart] = useState(1);
  const [genEnd, setGenEnd]     = useState(100);
  const [genPass, setGenPass]   = useState('');
  const [generating, setGen]    = useState(false);

  const setMsg = (m, t = 'info') => { setStatus(m); setStatusType(t); };

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await accountsAPI.getAll(profile); setAccounts(r.data.accounts || []); }
    catch { setMsg('Failed to load', 'error'); }
    setLoading(false);
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  const handleImport = async () => {
    const parsed = importText.trim().split('\n').map(l => {
      const [u, pw] = l.trim().split(':');
      return u && pw ? { username: u.trim(), password: pw.trim() } : null;
    }).filter(Boolean);
    if (!parsed.length) { setMsg('⚠️ No valid lines (format: user:pass)', 'error'); return; }
    try {
      const r = await accountsAPI.bulkImport(profile, parsed);
      setImportText(''); setShowImport(false);
      setMsg(`✅ Added ${r.data.added} | Skipped ${r.data.duplicates} duplicates`, 'success');
      await load();
    } catch { setMsg('❌ Import failed', 'error'); }
  };

  const handleGenerate = async () => {
    if (!genUser.trim()) { setMsg('⚠️ Username prefix required', 'error'); return; }
    if (genStart > genEnd) { setMsg('⚠️ Start must be ≤ End', 'error'); return; }
    setGen(true); setMsg(`Generating ${genEnd - genStart + 1} accounts...`);
    try {
      const r = await accountsAPI.generate(profile, {
        username:   genUser.trim(),
        startRange: genStart,
        endRange:   genEnd,
        password:   genPass.trim() || 'password123',
      });
      setMsg(`✅ Generated ${r.data.generated || 0} | Added ${r.data.added} | Skipped ${r.data.duplicates}`, 'success');
      setShowGen(false); await load();
    } catch (e) { setMsg(`❌ ${e.message}`, 'error'); }
    setGen(false);
  };

  const handleClearAll = async () => {
    if (!confirm(`Clear ALL ${accounts.length} accounts? Cannot be undone.`)) return;
    try { await accountsAPI.clearAll(profile); setMsg('✅ All cleared', 'success'); await load(); }
    catch { setMsg('❌ Clear failed', 'error'); }
  };

  // FIX: plain template literal — no padStart, so Rx1..Rx1000 not Rx001..Rx1000
  const previewName = genUser
    ? `${genUser}${genStart} … ${genUser}${genEnd}`
    : '';

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          {accounts.length.toLocaleString()} accounts
        </span>
        <div style={{ flex: 1 }} />
        <button className="btn btn-ghost btn-sm" onClick={load} disabled={loading}><RefreshCw size={11} className={loading ? 'spin' : ''} /></button>
        <button className="btn btn-ghost btn-sm"    onClick={() => setShowImport(v => !v)}><Upload size={11} /> Import</button>
        <button className="btn btn-primary btn-sm"  onClick={() => setShowGen(v => !v)}><Plus size={11} /> Generate</button>
        {accounts.length > 0 && <button className="btn btn-danger btn-sm" onClick={handleClearAll}><Trash2 size={11} /> Clear All</button>}
      </div>

      {status && (
        <div style={{ padding: '6px 10px', marginBottom: 10, borderRadius: 4, background: 'var(--bg-raised)', fontFamily: 'var(--font-mono)', fontSize: 11, color: statusType === 'success' ? 'var(--success)' : statusType === 'error' ? 'var(--danger)' : 'var(--text-secondary)' }}>
          {status}
        </div>
      )}

      {/* Import panel */}
      {showImport && (
        <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 6, padding: 12, marginBottom: 12 }}>
          <div className="form-label" style={{ marginBottom: 6 }}>Import accounts (user:pass per line)</div>
          <textarea className="textarea" rows={5} placeholder="zaib111:password123&#10;zaib112:password123"
            value={importText} onChange={e => setImportText(e.target.value)}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }} />
          <button className="btn btn-primary btn-sm" style={{ marginTop: 8 }} onClick={handleImport}>Import</button>
        </div>
      )}

      {/* Generate panel */}
      {showGen && (
        <div style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 6, padding: 12, marginBottom: 12 }}>
          <div className="form-label" style={{ marginBottom: 8 }}>Generate accounts</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px', gap: 8, marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>Username prefix</div>
              <input className="input" value={genUser} onChange={e => setGenUser(e.target.value)} placeholder="zaib" />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>Start</div>
              <input className="input" type="number" value={genStart} onChange={e => setGenStart(parseInt(e.target.value) || 1)} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>End</div>
              <input className="input" type="number" value={genEnd} onChange={e => setGenEnd(parseInt(e.target.value) || 100)} />
            </div>
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 3 }}>Password</div>
            <input className="input" value={genPass} onChange={e => setGenPass(e.target.value)} placeholder="password123" />
          </div>
          {/* FIX: previewName uses plain numbers — no padStart */}
          {previewName && (
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>
              Preview: <span style={{ color: 'var(--accent)' }}>{previewName}</span>
              <span style={{ marginLeft: 8 }}>({(genEnd - genStart + 1).toLocaleString()} accounts)</span>
            </div>
          )}
          <button className="btn btn-primary btn-sm" onClick={handleGenerate} disabled={generating}>
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
      )}

      {/* Accounts list */}
      <div style={{ maxHeight: 320, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 6 }}>
        {accounts.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
            No accounts yet. Import or generate above.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            <thead>
              <tr style={{ background: 'var(--bg-raised)', borderBottom: '1px solid var(--border)' }}>
                {['#', 'Username', 'Score', 'Last Processed'].map(h => (
                  <th key={h} style={{ padding: '6px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 10 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map((acc, i) => (
                <tr key={acc.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                  <td style={{ padding: '5px 10px', color: 'var(--text-muted)' }}>{i + 1}</td>
                  <td style={{ padding: '5px 10px', color: 'var(--text-primary)' }}>{acc.username}</td>
                  <td style={{ padding: '5px 10px', color: 'var(--accent)' }}>{acc.score || 0}</td>
                  <td style={{ padding: '5px 10px', color: 'var(--text-muted)' }}>{acc.last_processed ? new Date(acc.last_processed).toLocaleString() : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Stats Panel ────────────────────────────────────────────────────────────────
function StatsPanel({ liveStats, claimMode }) {
  if (!liveStats) return (
    <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '20px 0' }}>
      No live stats yet. Start the bot to see real-time data.
    </div>
  );

  const isPothli   = claimMode !== 'cashback';
  const claimedKey = isPothli ? 'pothliClaimed' : 'cashbackClaimed';
  const amountKey  = isPothli ? 'totalScoreWon'  : 'totalCashbackAmount';

  const items = [
    { label: 'Success',       value: liveStats.successCount   || 0 },
    { label: 'Failed',        value: liveStats.failCount       || 0 },
    { label: 'Claimed',       value: liveStats[claimedKey]     || 0 },
    { label: isPothli ? 'Already Claimed' : 'No Cashback',
      value: isPothli ? (liveStats.alreadyClaimed || 0) : (liveStats.noCashback || 0) },
    { label: isPothli ? 'Score Won' : 'Amount Won',
      value: liveStats[amountKey] || 0, color: 'var(--accent)' },
    { label: 'IP Ban Skipped',value: liveStats.ipBannedSkipped || 0, color: 'var(--danger)' },
    { label: 'Wrong Pass',    value: liveStats.wrongPassSkipped|| 0, color: 'var(--warning)' },
    { label: 'Active Workers',value: liveStats.activeWorkers   || 0 },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 8 }}>
      {items.map(item => (
        <div key={item.label} style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, color: item.color || 'var(--text-primary)' }}>
            {item.value}
          </div>
          <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 3, textTransform: 'uppercase', letterSpacing: 0.8 }}>
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main ProfilePage ───────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { profileName } = useParams();
  const { game }        = useGame();

  const [tab,         setTab]         = useState('terminal');
  const [logs,        setLogs]        = useState([]);
  const [botStatus,   setBotStatus]   = useState({ running: false });
  const [liveStats,   setLiveStats]   = useState(null);
  const [starting,    setStarting]    = useState(false);
  const [repetitions, setReps]        = useState(1);

  // Claim mode — persisted per-profile
  const modeKey = `_claimer_mode_${profileName}`;
  const [claimMode, setClaimMode] = useState(
    () => localStorage.getItem(modeKey) || 'pothli'
  );

  const handleModeChange = (mode) => {
    if (botStatus.running) return;
    if (mode === 'cashback' && !game.supportsCashback) return;
    if (mode === 'pothli'   && !game.supportsPothli)   return;
    setClaimMode(mode);
    localStorage.setItem(modeKey, mode);
  };

  // Auto-correct mode if game doesn't support it
  useEffect(() => {
    if (claimMode === 'cashback' && !game.supportsCashback) {
      setClaimMode('pothli'); localStorage.setItem(modeKey, 'pothli');
    }
    if (claimMode === 'pothli' && !game.supportsPothli) {
      setClaimMode('cashback'); localStorage.setItem(modeKey, 'cashback');
    }
  }, [game]);

  // Socket events
  const handleEvent = useCallback((event, data) => {
    if (event === 'bot:terminal') {
      setLogs(prev => [...prev.slice(-600), data]);
    } else if (event === 'bot:status') {
      setBotStatus(data);
      if (data.running) setLiveStats(prev => ({ ...prev, ...data, ...data.stats }));
    } else if (event === 'bot:completed') {
      setBotStatus(s => ({ ...s, running: false }));
    } else if (event === 'bot:progress') {
      setLiveStats(data.stats || null);
    } else if (event === 'bot:cycleUpdate') {
      setBotStatus(s => ({ ...s, currentCycle: data.cyclesCompleted, totalCycles: data.totalCycles }));
      setLiveStats(prev => ({ ...prev, ...data }));
    }
  }, []);

  useBotEvents(profileName, handleEvent);

  // Poll status
  useEffect(() => {
    const poll = async () => {
      try {
        const r = await processingAPI.status(profileName);
        setBotStatus(r.data);
        if (r.data.claimMode) {
          setClaimMode(r.data.claimMode);
          localStorage.setItem(modeKey, r.data.claimMode);
        }
        if (r.data.stats) setLiveStats(r.data.stats);
      } catch (_) {}
    };
    poll();
    const iv = setInterval(poll, 10000);
    return () => clearInterval(iv);
  }, [profileName]);

  const running = botStatus.running;

  const handleStart = async () => {
    setStarting(true);
    try {
      await processingAPI.start(profileName, {
        claimMode,
        repetitions,
        gameConfig: {
          LOGIN_WS_URL: game.LOGIN_WS_URL,
          GAME_VERSION: game.GAME_VERSION,
          ORIGIN:       game.ORIGIN,
        },
      });
      setBotStatus(s => ({ ...s, running: true, claimMode }));
      setLogs([]);
      setTab('terminal');
    } catch (e) {
      setLogs(prev => [...prev, {
        type: 'error',
        message: `Failed to start: ${e.response?.data?.error || e.message}`,
        timestamp: new Date().toISOString(),
      }]);
    }
    setStarting(false);
  };

  const handleStop = async () => {
    try {
      await processingAPI.stop(profileName);
      setBotStatus(s => ({ ...s, running: false }));
    } catch (_) {}
  };

  const modeColor = claimMode === 'cashback' ? '#34d399' : '#a78bfa';
  const modeEmoji = claimMode === 'cashback' ? '💰' : '🎁';
  const modeLabel = claimMode === 'cashback' ? 'Cashback Claim' : 'Pothli Claim';

  const TABS = [
    { id: 'terminal', label: 'Terminal',  icon: Terminal  },
    { id: 'accounts', label: 'Accounts',  icon: Users     },
    { id: 'stats',    label: 'Stats',     icon: BarChart3 },
    { id: 'proxy',    label: 'Proxy',     icon: Shield    },
  ];

  return (
    <Layout title={profileName.replace('_', ' ')}>
      <div style={{ maxWidth: 1000 }}>

        {/* Mode Selector — hidden while running */}
        {!running && (
          <div className="card" style={{ marginBottom: 16 }}>
            <ClaimModeSelector value={claimMode} onChange={handleModeChange} disabled={running} game={game} />
          </div>
        )}

        {/* Control Bar */}
        <div className="card" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>

            {/* Status dot */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`dot ${running ? 'dot-orange dot-pulse' : 'dot-grey'}`} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: running ? 'var(--accent)' : 'var(--text-secondary)' }}>
                {running ? 'RUNNING' : 'IDLE'}
              </span>
            </div>

            <div style={{ width: 1, height: 24, background: 'var(--border)' }} />

            {/* Active mode badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${modeColor}12`, border: `1px solid ${modeColor}40`, borderRadius: 20, padding: '3px 12px' }}>
              <span style={{ fontSize: 12 }}>{modeEmoji}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: modeColor, fontWeight: 700 }}>
                {modeLabel.toUpperCase()}
              </span>
            </div>

            {/* Active game badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: `${game.color}12`, border: `1px solid ${game.color}40`, borderRadius: 20, padding: '3px 12px' }}>
              <span style={{ fontSize: 12 }}>{game.emoji}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: game.color, fontWeight: 700 }}>
                {game.shortLabel}
              </span>
            </div>

            {/* Cycles input */}
            {!running && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 10, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>CYCLES</span>
                <input type="number" value={repetitions} min={1} max={50}
                  onChange={e => setReps(parseInt(e.target.value) || 1)}
                  style={{ width: 60, padding: '5px 8px', background: 'var(--bg-raised)', border: '1px solid var(--border-lit)', borderRadius: 4, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12, outline: 'none' }} />
              </div>
            )}

            {running && botStatus.totalCycles > 1 && (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
                Cycle {botStatus.currentCycle || 0}/{botStatus.totalCycles}
              </div>
            )}

            <div style={{ flex: 1 }} />

            {!running ? (
              <button className="btn btn-primary btn-lg" onClick={handleStart} disabled={starting}>
                <Play size={14} />
                {starting ? 'STARTING...' : `START ${modeLabel.toUpperCase()}`}
              </button>
            ) : (
              <button className="btn btn-danger" onClick={handleStop}>
                <Square size={13} />
                STOP BOT
              </button>
            )}
          </div>

          {/* Progress bar */}
          {running && botStatus.totalCycles > 1 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 5 }}>
                <span>{modeLabel}</span>
                <span>Cycle {botStatus.currentCycle || 0}/{botStatus.totalCycles}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill amber" style={{ width: `${botStatus.totalCycles > 0 ? ((botStatus.currentCycle || 0) / botStatus.totalCycles) * 100 : 20}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div className="tab-nav" style={{ background: 'var(--bg-raised)', padding: '0 8px' }}>
            {TABS.map(t => (
              <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
                <t.icon size={11} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: 20 }}>
            {tab === 'terminal' && (
              <div>
                <div className="card-header" style={{ marginBottom: 12 }}>
                  <span className="card-title">Live Output</span>
                  <button className="btn btn-ghost btn-sm" onClick={() => setLogs([])}>Clear</button>
                </div>
                <BotTerminal logs={logs} />

                {/* Live stats strip */}
                {running && liveStats && (
                  <div style={{ display: 'flex', gap: 16, marginTop: 12, padding: '8px 12px', background: 'var(--bg-raised)', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 11, flexWrap: 'wrap' }}>
                    {[
                      { label: 'Workers',  value: liveStats.activeWorkers || 0 },
                      { label: 'Success',  value: liveStats.successCount  || 0, color: 'var(--success)' },
                      { label: 'Failed',   value: liveStats.failCount     || 0, color: 'var(--danger)'  },
                      { label: 'Claimed',  value: (liveStats.pothliClaimed || liveStats.cashbackClaimed || 0), color: modeColor },
                      { label: 'Won',      value: (liveStats.totalScoreWon || liveStats.totalCashbackAmount || 0), color: 'var(--accent)' },
                    ].map(s => (
                      <div key={s.label} style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{s.label}:</span>
                        <span style={{ fontWeight: 700, color: s.color || 'var(--text-primary)' }}>{s.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {tab === 'accounts' && <AccountsTable profile={profileName} />}
            {tab === 'stats'    && <StatsPanel liveStats={liveStats} claimMode={claimMode} />}
            {tab === 'proxy'    && <ProxyPanel profile={profileName} />}
          </div>
        </div>
      </div>
    </Layout>
  );
}