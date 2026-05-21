import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';

const COLORS = ['#6366f1','#a855f7','#14b8a6','#ec4899','#f59e0b','#3b82f6'];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0  },
  transition: { duration: 0.4, delay }
});

const EmptyState = ({ icon, message }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <p className="text-4xl mb-3">{icon}</p>
    <p className="text-slate-400 text-sm">{message}</p>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card rounded-xl px-4 py-2 text-sm">
      <p className="text-slate-300">{label}</p>
      <p className="text-indigo-400 font-bold">{payload[0].value}{payload[0].name === 'hours' ? 'h' : ''}</p>
    </div>
  );
};

export default function Analytics() {
  const [weekly,   setWeekly]   = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [goals,    setGoals]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [insight,  setInsight]  = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [w, s, g] = await Promise.all([
        API.get('/pomodoro/weekly'),
        API.get('/subjects'),
        API.get('/goals/all')
      ]);
      setWeekly(w.data);
      setSubjects(s.data);
      setGoals(g.data);
      generateInsight(w.data, s.data, g.data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const generateInsight = (w, s, g) => {
    const totalHours    = w.reduce((a, d) => a + Number(d.hours), 0);
    const bestDay       = w.reduce((a, d) => Number(d.hours) > Number(a.hours) ? d : a, w[0] || {});
    const completedGoals = g.filter(x => x.completed).length;
    const topSubject    = s.sort((a, b) => b.hoursStudied - a.hoursStudied)[0];

    if (totalHours === 0) {
      setInsight("Start your first study session to unlock AI insights! 🚀");
      return;
    }
    setInsight(
      `You studied ${totalHours.toFixed(1)} hours this week. ` +
      `${bestDay.date ? `Your best day was ${new Date(bestDay.date).toLocaleDateString('en',{weekday:'long'})} with ${bestDay.hours}h. ` : ''}` +
      `${topSubject ? `You're spending the most time on ${topSubject.name}. ` : ''}` +
      `${completedGoals} goals completed. Keep the momentum going! 💪`
    );
  };

  const totalHours     = weekly.reduce((a, d) => a + Number(d.hours), 0);
  const totalPomodoros = weekly.reduce((a, d) => a + d.pomodoros, 0);
  const completedGoals = goals.filter(g => g.completed).length;
  const goalRate       = goals.length ? Math.round((completedGoals / goals.length) * 100) : 0;

  const subjectData = subjects.map(s => ({
    name: s.name, value: Number(s.hoursStudied?.toFixed(1)) || 0
  })).filter(s => s.value > 0);

  const weeklyFormatted = weekly.map(d => ({
    ...d,
    day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    hours: Number(d.hours)
  }));

  if (loading) return (
    <div className="flex h-screen bg-[#0f0f1a]">
      <Sidebar />
      <div className="lg:ml-56 flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0f0f1a]">
      <Sidebar />
      <main className="lg:ml-56 flex-1 p-4 md:p-8 overflow-y-auto">

        {/* Header */}
        <motion.div {...fadeUp(0)} className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">📊 <span className="gradient-text">Analytics</span></h1>
          <p className="text-slate-400 text-sm">Your study performance overview</p>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Hours This Week', value: `${totalHours.toFixed(1)}h`, icon: '⏱️', color: 'from-indigo-500 to-purple-600' },
            { label: 'Pomodoros',       value: totalPomodoros,              icon: '🍅', color: 'from-pink-500 to-rose-600'    },
            { label: 'Goals Completed', value: completedGoals,              icon: '✅', color: 'from-teal-500 to-cyan-600'    },
            { label: 'Completion Rate', value: `${goalRate}%`,              icon: '🎯', color: 'from-amber-500 to-orange-600' }
          ].map((m, i) => (
            <motion.div key={i} {...fadeUp(i * 0.08)}
              className="glass-card rounded-2xl p-5 hover:scale-105 transition-transform duration-200">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.color} flex items-center justify-center text-lg mb-3`}>
                {m.icon}
              </div>
              <p className="text-2xl font-bold text-white mb-1">{m.value}</p>
              <p className="text-slate-400 text-xs">{m.label}</p>
            </motion.div>
          ))}
        </div>

        {/* AI Insight */}
        {insight && (
          <motion.div {...fadeUp(0.2)}
            className="glass-card rounded-2xl p-5 mb-8 border border-indigo-500/20 flex gap-4 items-start">
            <span className="text-2xl">🤖</span>
            <div>
              <p className="text-indigo-400 text-xs font-semibold mb-1 uppercase tracking-wider">AI Insight</p>
              <p className="text-slate-300 text-sm leading-relaxed">{insight}</p>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

          {/* Weekly Hours Chart */}
          <motion.div {...fadeUp(0.25)} className="glass-card rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span>📈</span> Weekly Study Hours
            </h2>
            {totalHours === 0
              ? <EmptyState icon="📅" message="No study sessions this week yet. Start a Pomodoro session!" />
              : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyFormatted}>
                    <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="hours" name="hours" fill="url(#barGrad)" radius={[6,6,0,0]} />
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              )}
          </motion.div>

          {/* Subject Distribution */}
          <motion.div {...fadeUp(0.3)} className="glass-card rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span>📚</span> Subject Distribution
            </h2>
            {subjectData.length === 0
              ? <EmptyState icon="📚" message="Add subjects and start studying to see distribution!" />
              : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width="55%" height={180}>
                    <PieChart>
                      <Pie data={subjectData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                        paddingAngle={3} dataKey="value">
                        {subjectData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid #6366f1', borderRadius: '12px', color: '#e2e8f0' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-2 flex-1">
                    {subjectData.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-slate-300 truncate flex-1">{s.name}</span>
                        <span className="text-slate-400">{s.value}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </motion.div>
        </div>

        {/* Focus Trend */}
        <motion.div {...fadeUp(0.35)} className="glass-card rounded-2xl p-6 mb-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>🎯</span> Focus Trend (Pomodoros per day)
          </h2>
          {totalPomodoros === 0
            ? <EmptyState icon="🍅" message="Complete Pomodoro sessions to see your focus trend!" />
            : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={weeklyFormatted}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="pomodoros" stroke="#6366f1" strokeWidth={2}
                    dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6, fill: '#a855f7' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
        </motion.div>

        {/* Goal Completion */}
        <motion.div {...fadeUp(0.4)} className="glass-card rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <span>✅</span> Goal Completion History
          </h2>
          {goals.length === 0
            ? <EmptyState icon="🎯" message="Add goals from the dashboard to track your progress!" />
            : (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                {goals.slice(0,15).map((g, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/3">
                    <span>{g.completed ? '✅' : '⭕'}</span>
                    <span className={`flex-1 text-sm ${g.completed ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                      {g.title}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(g.createdAt).toLocaleDateString('en',{month:'short',day:'numeric'})}
                    </span>
                  </div>
                ))}
              </div>
            )}
        </motion.div>

      </main>
    </div>
  );
}