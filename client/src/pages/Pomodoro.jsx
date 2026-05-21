import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import { useTimer, MODES } from '../context/TimerContext';
import API from '../api/axios';

export default function Pomodoro() {
  const timer = useTimer();
  const [subjects,      setSubjects]      = useState([]);
  const [stats,         setStats]         = useState(null);
  const [sessions,      setSessions]      = useState([]);
  const [customMinutes, setCustomMinutes] = useState('');
  const [showCustom,    setShowCustom]    = useState(false);
  const [weekly,        setWeekly]        = useState([]);

  useEffect(() => {
    API.get('/subjects').then(r => setSubjects(r.data)).catch(console.error);
    API.get('/pomodoro/today').then(r => { setSessions(r.data.sessions || []); setStats(r.data); }).catch(console.error);
    API.get('/pomodoro/weekly').then(r => setWeekly(r.data)).catch(console.error);
  }, []);

  const R     = 100;
  const circ  = 2 * Math.PI * R;
  const color = MODES[timer.mode]?.color || '#6366f1';

  const handleCustomStart = () => {
    const mins = parseInt(customMinutes);
    if (!mins || mins < 1 || mins > 300) return;
    timer.setCustomDuration('focus', mins);
    timer.switchMode('focus', mins * 60);
    setShowCustom(false);
    setCustomMinutes('');
  };

  return (
    <div className="flex min-h-screen bg-[#0f0f1a]">
      <Sidebar />
      <main className="lg:ml-56 flex-1 p-4 md:p-8 pt-16 lg:pt-8 overflow-y-auto">

        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-white">
            🍅 <span className="gradient-text">Focus Timer</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Stay focused. Build momentum.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Timer Card */}
          <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
            transition={{ duration:0.4 }}
            className="lg:col-span-2 glass-card rounded-3xl p-8 flex flex-col items-center">

            {/* Mode Tabs */}
            <div className="flex gap-2 mb-6 glass rounded-2xl p-1 w-full max-w-sm">
              {Object.entries(MODES).map(([key, val]) => (
                <button key={key} onClick={() => timer.switchMode(key)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all duration-200
                    ${timer.mode === key ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                  style={timer.mode === key ? { background: val.color } : {}}>
                  {val.label}
                </button>
              ))}
            </div>

            {/* Subject Selector */}
            <select value={timer.subjectId} onChange={e => timer.setSubjectId(e.target.value)}
              className="mb-6 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 w-full max-w-xs">
              <option value="">No subject selected</option>
              {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>

            {/* Timer Ring */}
            <div className="relative w-64 h-64 mb-6">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
                <circle cx="120" cy="120" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                <circle cx="120" cy="120" r={R} fill="none" stroke={color} strokeWidth="12"
                  strokeDasharray={circ}
                  strokeDashoffset={circ * (1 - timer.progress / 100)}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 12px ${color})` }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-bold text-white font-mono tracking-tight">
                  {timer.mins}:{timer.secs}
                </span>
                <span className="text-slate-400 text-sm mt-2">{MODES[timer.mode]?.label}</span>
                {timer.running && (
                  <span className="text-xs text-indigo-400 mt-1 animate-pulse">● Recording</span>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 mb-6">
              <button onClick={timer.reset}
                className="px-6 py-3 glass rounded-2xl text-slate-300 hover:text-white text-sm font-semibold transition-all hover:scale-105">
                ↺ Reset
              </button>
              <button onClick={timer.running ? timer.pause : timer.start}
                className="px-12 py-3 rounded-2xl text-white font-bold text-sm transition-all hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${color}, #a855f7)`, boxShadow: `0 0 24px ${color}50` }}>
                {timer.running ? '⏸ Pause' : '▶ Start'}
              </button>
            </div>

            {/* Custom Duration */}
            <div className="w-full max-w-sm">
              <button onClick={() => setShowCustom(!showCustom)}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mb-3 flex items-center gap-1">
                ⚙️ {showCustom ? 'Hide' : 'Set custom duration'}
              </button>

              {showCustom && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
                  className="glass rounded-2xl p-4">
                  <p className="text-slate-300 text-xs mb-3 font-medium">Custom focus duration (minutes)</p>
                  <div className="flex gap-2">
                    <input type="number" min="1" max="300" placeholder="e.g. 45"
                      value={customMinutes}
                      onChange={e => setCustomMinutes(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button onClick={handleCustomStart}
                      className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-semibold transition-colors">
                      Set
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[25, 45, 50, 90].map(m => (
                      <button key={m} onClick={() => { setCustomMinutes(String(m)); }}
                        className="flex-1 py-1.5 glass rounded-lg text-xs text-slate-400 hover:text-white transition-all">
                        {m}m
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Pomodoro count */}
            <div className="flex items-center gap-2 mt-4">
              <span className="text-slate-500 text-xs">Today:</span>
              {[...Array(Math.min(timer.pomodorosDone, 8))].map((_, i) => (
                <span key={i} className="text-sm">🍅</span>
              ))}
              {timer.pomodorosDone === 0 && <span className="text-slate-600 text-xs">No sessions yet</span>}
              {timer.pomodorosDone > 8 && <span className="text-slate-400 text-xs">+{timer.pomodorosDone - 8} more</span>}
            </div>
          </motion.div>

          {/* Stats Panel */}
          <div className="flex flex-col gap-4">
            {[
              { label: 'Pomodoros today', value: stats?.totalPomodoros || 0,   icon: '🍅' },
              { label: 'Hours today',     value: `${stats?.totalHours || '0'}h`, icon: '⏱️' },
              { label: 'Minutes today',   value: stats?.totalMinutes  || 0,   icon: '📊' }
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-5 text-center hover:scale-105 transition-transform">
                <p className="text-2xl mb-2">{s.icon}</p>
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <p className="text-slate-400 text-xs mt-1">{s.label}</p>
              </motion.div>
            ))}

            {/* Weekly summary */}
            <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
              transition={{ delay: 0.35 }}
              className="glass-card rounded-2xl p-4">
              <p className="text-white text-sm font-semibold mb-3">📅 This Week</p>
              <div className="flex items-end gap-1 h-16">
                {weekly.map((d, i) => {
                  const h = Number(d.hours) || 0;
                  const max = Math.max(...weekly.map(x => Number(x.hours) || 0), 1);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-t-sm transition-all"
                        style={{ height: `${(h / max) * 48}px`, background: h > 0 ? '#6366f1' : '#1e1e2e', minHeight: '4px' }} />
                      <span className="text-slate-600 text-xs">
                        {new Date(d.date).toLocaleDateString('en', { weekday: 'narrow' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Recent Sessions */}
            <motion.div initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }}
              transition={{ delay:0.4 }}
              className="glass-card rounded-2xl p-4 flex-1">
              <p className="text-white text-sm font-semibold mb-3">Recent Sessions</p>
              <div className="flex flex-col gap-2 overflow-y-auto max-h-40">
                {sessions.length === 0
                  ? <p className="text-slate-600 text-xs text-center py-4">No sessions today yet</p>
                  : sessions.slice().reverse().map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs py-1.5 border-b border-white/5">
                      <span>{s.type === 'focus' ? '🍅' : '☕'}</span>
                      <span className="text-slate-300 font-medium">{s.duration}m</span>
                      <span className="text-slate-500 ml-auto">
                        {new Date(s.createdAt).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                      </span>
                    </div>
                  ))
                }
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}