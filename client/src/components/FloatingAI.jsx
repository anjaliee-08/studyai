import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import API from '../api/axios';

export default function FloatingAI() {
  const [open,    setOpen]    = useState(false);
  const [input,   setInput]   = useState('');
  const [msgs,    setMsgs]    = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  // Hide on AI and Study Room pages
  if (['/ai', '/study-room'].includes(location.pathname)) return null;

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input;
    setInput('');
    setMsgs(prev => [...prev, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await API.post('/ai/ask', { message: msg, type: 'doubt' });
      setMsgs(prev => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch {
      setMsgs(prev => [...prev, { role: 'ai', text: '⚠️ AI busy. Try again.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1,   y: 0  }}
            exit={{   opacity: 0, scale: 0.8, y: 20  }}
            className="glass-card rounded-2xl w-80 flex flex-col overflow-hidden"
            style={{ height: '420px', boxShadow: '0 0 40px rgba(99,102,241,0.3)' }}>

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <span className="text-white font-semibold text-sm">AI Assistant</span>
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              </div>
              <button onClick={() => setMsgs([])} className="text-slate-500 hover:text-slate-300 text-xs">Clear</button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
              {msgs.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:2, repeat:Infinity }}
                    className="text-4xl mb-2">🧠</motion.div>
                  <p className="text-slate-400 text-xs mb-3">Ask me anything!</p>
                  {['Explain a concept', 'Generate quiz', 'Help debug code'].map(q => (
                    <button key={q} onClick={() => setInput(q)}
                      className="text-xs text-indigo-400 py-1.5 px-3 glass rounded-lg mb-1.5 hover:bg-indigo-500/10 transition-all w-full text-left">
                      → {q}
                    </button>
                  ))}
                </div>
              )}
              {msgs.map((m, i) => (
                <div key={i} className={`text-xs p-2.5 rounded-xl leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-500/20 text-indigo-200 ml-6'
                    : 'glass text-slate-300 mr-6'
                }`} style={{ whiteSpace: 'pre-wrap' }}>
                  {m.text}
                </div>
              ))}
              {loading && (
                <div className="glass rounded-xl p-2.5 mr-6 flex gap-1 items-center">
                  {[0,1,2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                      animate={{ y:[0,-4,0] }} transition={{ duration:0.5, repeat:Infinity, delay:i*0.12 }} />
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-white/5 flex gap-2">
              <input
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Ask anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
              />
              <button onClick={send} disabled={loading}
                className="px-3 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white text-xs disabled:opacity-50 hover:scale-105 transition-all">
                ➤
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-2xl text-white text-2xl flex items-center justify-center glow-purple"
        style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
        {open ? '✕' : '🤖'}
      </motion.button>
    </div>
  );
}