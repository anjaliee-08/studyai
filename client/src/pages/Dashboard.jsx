import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';

const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 20 },
  animate:    { opacity: 1, y: 0  },
  transition: { duration: 0.4, delay }
});

export default function Dashboard() {
  const { user } = useAuth();
  const [goals,    setGoals]    = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [stats,    setStats]    = useState(null);
  const [weekly,   setWeekly]   = useState([]);
  const [newGoal,  setNewGoal]  = useState('');
  const [newSub,   setNewSub]   = useState('');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [g, s, p, w] = await Promise.all([
        API.get('/goals/today'),
        API.get('/subjects'),
        API.get('/pomodoro/today'),
        API.get('/pomodoro/weekly')
      ]);
      setGoals(g.data);
      setSubjects(s.data);
      setStats(p.data);
      setWeekly(w.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const addGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    const res = await API.post('/goals', { title: newGoal });
    setGoals([...goals, res.data]);
    setNewGoal('');
  };

  const completeGoal = async (id) => {
    const res = await API.put(`/goals/${id}/complete`);
    setGoals(goals.map(g => g._id === id ? res.data : g));
  };

  const deleteGoal = async (id) => {
    await API.delete(`/goals/${id}`);
    setGoals(goals.filter(g => g._id !== id));
  };

  const addSubject = async (e) => {
    e.preventDefault();
    if (!newSub.trim()) return;
    const colors = ['#6366f1','#a855f7','#14b8a6','#ec4899','#3b82f6'];
    const color  = colors[subjects.length % colors.length];
    const res    = await API.post('/subjects', { name: newSub, color });
    setSubjects([...subjects, res.data]);
    setNewSub('');
  };

  const completed  = goals.filter(g => g.completed).length;
  const goalPct    = goals.length ? Math.round((completed / goals.length) * 100) : 0;
  const totalHours = subjects.reduce((a, s) => a + (s.hoursStudied || 0), 0);

  const metrics = [
    { label: 'Hours Today',   value: stats?.totalHours   || '0',   icon: '⏱️', color: 'from-indigo-500 to-purple-600' },
    { label: 'Pomodoros',     value: stats?.totalPomodoros || 0,   icon: '🍅', color: 'from-pink-500 to-rose-600'     },
    { label: 'Goals Done',    value: `${completed}/${goals.length}`, icon: '✅', color: 'from-teal-500 to-cyan-600'   },
    { label: 'Total Hours',   value: `${totalHours.toFixed(1)}h`,  icon: '📚', color: 'from-amber-500 to-orange-600' }
  ];

  if (loading) return (
    <div className="flex h-screen bg-[#0f0f1a]">
      <Sidebar />
      <div className="ml-56 flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0f0f1a]">
      <Sidebar />

      <main className="lg:ml-56 pt-14 lg:pt-0 flex-1 p-8 overflow-y-auto">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              Good day, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-slate-400 text-sm">{new Date().toDateString()} · Let's crush it today</p>
          </div>
          <div className="glass rounded-2xl px-4 py-2 flex items-center gap-2">
            <span className="text-orange-400 text-lg">🔥</span>
            <span className="text-white font-bold">{user?.streak || 0}</span>
            <span className="text-slate-400 text-sm">day streak</span>
          </div>
        </motion.div>

        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {metrics.map((m, i) => (
            <motion.div key={i} {...fadeUp(i * 0.08)}
              className="glass-card rounded-2xl p-5 hover:scale-105 transition-transform duration-200 cursor-default">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-lg mb-3`}>
                {m.icon}
              </div>
              <p className="text-2xl font-bold text-white mb-1">{m.value}</p>
              <p className="text-slate-400 text-xs">{m.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">

          {/* Weekly Chart */}
          <motion.div {...fadeUp(0.2)} className="col-span-2 glass-card rounded-2xl p-6">
            <h2 className="text-white font-600 mb-4 flex items-center gap-2">
              <span>📈</span> Weekly Study Hours
            </h2>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weekly}>
                <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={d => new Date(d).toLocaleDateString('en',{weekday:'short'})} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1e1e2e', border: '1px solid #6366f1', borderRadius: '12px', color: '#e2e8f0' }}
                  formatter={(v) => [`${v}h`, 'Hours']}
                />
                <Bar dataKey="hours" fill="url(#barGradient)" radius={[6,6,0,0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Goal Progress */}
          <motion.div {...fadeUp(0.25)} className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center">
            <h2 className="text-white font-600 mb-4 self-start flex items-center gap-2">
              <span>🎯</span> Goal Progress
            </h2>
            <div className="relative w-32 h-32 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#1e1e2e" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="url(#ringGrad)" strokeWidth="10"
                  strokeDasharray={`${2*Math.PI*50}`}
                  strokeDashoffset={`${2*Math.PI*50*(1 - goalPct/100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
                <defs>
                  <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">{goalPct}%</span>
                <span className="text-xs text-slate-400">complete</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm">{completed} of {goals.length} goals done</p>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">

          {/* Goals */}
          <motion.div {...fadeUp(0.3)} className="glass-card rounded-2xl p-6">
            <h2 className="text-white font-600 mb-4 flex items-center gap-2">
              <span>✅</span> Today's Goals
            </h2>
            <form onSubmit={addGoal} className="flex gap-2 mb-4">
              <input
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Add a goal..."
                value={newGoal}
                onChange={e => setNewGoal(e.target.value)}
              />
              <button type="submit"
                className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-500 transition-colors">
                Add
              </button>
            </form>
            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
              {goals.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No goals yet!</p>}
              {goals.map(g => (
                <motion.div key={g._id} layout
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/5 transition-colors group">
                  <input type="checkbox" checked={g.completed}
                    onChange={() => !g.completed && completeGoal(g._id)}
                    className="w-4 h-4 accent-indigo-500 cursor-pointer flex-shrink-0"
                  />
                  <span className={`flex-1 text-sm ${g.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {g.title}
                  </span>
                  <button onClick={() => deleteGoal(g._id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 text-xs transition-all">
                    ✕
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Subjects */}
          <motion.div {...fadeUp(0.35)} className="glass-card rounded-2xl p-6">
            <h2 className="text-white font-600 mb-4 flex items-center gap-2">
              <span>📚</span> Subjects
            </h2>
            <form onSubmit={addSubject} className="flex gap-2 mb-4">
              <input
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Add a subject..."
                value={newSub}
                onChange={e => setNewSub(e.target.value)}
              />
              <button type="submit"
                className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-500 transition-colors">
                Add
              </button>
            </form>
            <div className="flex flex-col gap-3 max-h-52 overflow-y-auto">
              {subjects.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No subjects yet!</p>}
              {subjects.map(s => (
                <div key={s._id} className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="flex-1 text-sm text-slate-200">{s.name}</span>
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((s.hoursStudied / 10) * 100, 100)}%`, background: s.color }} />
                  </div>
                  <span className="text-xs text-slate-400 w-10 text-right">{s.hoursStudied?.toFixed(1)}h</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* AI Quick Access Banner */}
        <motion.div {...fadeUp(0.4)}
          className="gradient-border rounded-2xl p-6 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))' }}>
          <div>
            <h3 className="text-white font-600 text-lg mb-1">🤖 AI Study Assistant</h3>
            <p className="text-slate-400 text-sm">Ask doubts, generate quizzes, debug code, summarize notes</p>
          </div>
          <a href="/ai"
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-600 text-sm hover:scale-105 transition-transform glow-purple">
            Open AI Chat →
          </a>
        </motion.div>

      </main>
    </div>
  );
}