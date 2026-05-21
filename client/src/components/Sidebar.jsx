import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTimer } from '../context/TimerContext';

const navItems = [
  { to: '/',            icon: '⚡', label: 'Dashboard'   },
  { to: '/pomodoro',    icon: '🍅', label: 'Focus Timer' },
  { to: '/study-room',  icon: '🎯', label: 'Study Room'  },
  { to: '/ai',          icon: '🤖', label: 'AI Chat'     },
  { to: '/analytics',   icon: '📊', label: 'Analytics'   },
];

export default function Sidebar() {
  const { user, logout }          = useAuth();
  const { mins, secs, running }   = useTimer();
  const navigate                  = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full py-6 px-4">
      {/* Logo */}
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold glow-purple">
          S
        </div>
        <span className="gradient-text font-bold text-lg">StudyAI</span>
      </div>

      {/* User */}
      <div className="glass rounded-2xl p-3 mb-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-sm text-white flex-shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        <p className="text-xs text-slate-500 font-medium px-3 mb-2 uppercase tracking-wider">Menu</p>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
               ${isActive
                 ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                 : 'text-slate-400 hover:text-white hover:bg-white/5'}`
            }>
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Timer pill */}
      {running && (
        <div className="glass rounded-2xl p-3 mb-4 text-center border border-indigo-500/30">
          <p className="text-xs text-slate-400 mb-1">🍅 Focus running</p>
          <p className="text-white font-bold text-lg">{mins}:{secs}</p>
        </div>
      )}

      {/* Streak */}
      <div className="glass rounded-2xl p-3 mb-4 text-center">
        <p className="text-2xl mb-1">🔥</p>
        <p className="text-white font-bold text-lg">{user?.streak || 0}</p>
        <p className="text-xs text-slate-400">day streak</p>
      </div>

      {/* Logout */}
      <button
        onClick={() => { logout(); navigate('/login'); }}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200">
        <span>🚪</span> Logout
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 h-full w-56 glass-card flex-col z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-[60] glass rounded-xl p-2.5 text-white"
        onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-[55]"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed top-0 left-0 h-full w-56 glass-card z-[56]">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}