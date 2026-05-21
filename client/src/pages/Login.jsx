import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

 return (
  <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center p-4">
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      className="glass-card rounded-3xl p-8 w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold mx-auto mb-4 glow-purple">S</div>
        <h1 className="gradient-text text-2xl font-bold">StudyAI</h1>
        <p className="text-slate-400 text-sm mt-1">Welcome back</p>
      </div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm mb-4">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input type="email" placeholder="Email" value={form.email}
          onChange={e => setForm({...form, email: e.target.value})} required
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <input type="password" placeholder="Password" value={form.password}
          onChange={e => setForm({...form, password: e.target.value})} required
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button type="submit" disabled={loading}
          className="py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-600 text-sm hover:scale-105 transition-transform mt-2 disabled:opacity-50 glow-purple">
          {loading ? 'Logging in...' : 'Login →'}
        </button>
      </form>
      <p className="text-center text-slate-500 text-sm mt-4">
        Don't have an account? <a href="/signup" className="text-indigo-400 hover:text-indigo-300">Sign up</a>
      </p>
    </motion.div>
  </div>
);
}

