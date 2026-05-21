import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import API from '../api/axios';

const MODES = [
  { key: 'doubt',   icon: '❓', label: 'Ask Doubt',      placeholder: 'Ask any question...',          color: '#6366f1' },
  { key: 'concept', icon: '💡', label: 'Explain Concept', placeholder: 'Enter a concept...',           color: '#a855f7' },
  { key: 'debug',   icon: '🐛', label: 'Debug Code',      placeholder: 'Paste your code here...',      color: '#ec4899' },
  { key: 'summary', icon: '📝', label: 'Summarize',       placeholder: 'Paste your notes here...',     color: '#14b8a6' },
  { key: 'quiz',    icon: '🧪', label: 'Generate Quiz',   placeholder: 'Enter a topic for quiz...',    color: '#f59e0b' }
];

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [mode,     setMode]     = useState('doubt');
  const [loading,  setLoading]  = useState(false);
  const bottomRef  = useRef(null);
  const currentMode = MODES.find(m => m.key === mode);

  useEffect(() => {
    API.get('/ai/history').then(r => setMessages(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', message: input, type: mode, createdAt: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await API.post('/ai/ask', { message: input, type: mode });
      setMessages(prev => [...prev, { role: 'assistant', message: res.data.reply, type: mode, createdAt: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', message: '⚠️ AI is busy. Please try again shortly.', type: mode, createdAt: new Date() }]);
    }
    setLoading(false);
  };

  const clearChat = async () => {
    await API.delete('/ai/clear');
    setMessages([]);
  };

  return (
    <div className="flex min-h-screen bg-[#0f0f1a]">
      <Sidebar />
      <main className="lg:ml-56 pt-14 lg:pt-0 flex-1 flex flex-col h-screen p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white">🤖 <span className="gradient-text">AI Study Assistant</span></h1>
            <p className="text-slate-400 text-sm mt-0.5">Powered by Google Gemini</p>
          </div>
          <button onClick={clearChat}
            className="px-4 py-2 glass rounded-xl text-red-400 hover:bg-red-500/10 text-sm font-500 transition-all">
            🗑 Clear
          </button>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {MODES.map(m => (
            <button key={m.key} onClick={() => setMode(m.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-500 transition-all duration-200 border
                ${mode === m.key ? 'text-white scale-105' : 'text-slate-400 border-white/10 glass hover:text-white'}`}
              style={mode === m.key ? { background: m.color, borderColor: m.color, boxShadow: `0 0 16px ${m.color}60` } : {}}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {/* Chat Window */}
        <div className="flex-1 glass-card rounded-2xl p-4 overflow-y-auto mb-4 flex flex-col gap-3 min-h-0">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <motion.div animate={{ y: [0,-10,0] }} transition={{ duration:3, repeat:Infinity }}
                className="text-6xl mb-4">🧠</motion.div>
              <p className="text-slate-300 font-500 text-lg mb-2">Your AI Study Buddy</p>
              <p className="text-slate-500 text-sm max-w-xs">Select a mode above and start asking. I can explain concepts, debug code, generate quizzes and more!</p>
            </div>
          )}
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i}
                initial={{ opacity:0, y:10, scale:0.98 }}
                animate={{ opacity:1, y:0,  scale:1   }}
                transition={{ duration:0.2 }}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0
                  ${msg.role === 'user' ? 'bg-indigo-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'}`}>
                  {msg.role === 'user' ? '👤' : '🤖'}
                </div>
                <div className={`max-w-2xl px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-indigo-500/20 text-indigo-100 border border-indigo-500/30 rounded-tr-sm'
                    : 'glass text-slate-200 rounded-tl-sm'}`}
                  style={{ whiteSpace: 'pre-wrap' }}>
                  {msg.message}
                  <p className="text-xs opacity-40 mt-2">
                    {new Date(msg.createdAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-sm">🤖</div>
              <div className="glass px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                {[0,1,2].map(i => (
                  <motion.div key={i} className="w-2 h-2 bg-indigo-400 rounded-full"
                    animate={{ y: [0,-6,0] }} transition={{ duration:0.6, repeat:Infinity, delay:i*0.15 }} />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-3">
          <textarea
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            placeholder={currentMode.placeholder}
            value={input}
            rows={2}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          />
          <button onClick={sendMessage} disabled={loading}
            className="px-6 rounded-2xl text-white font-600 text-sm transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: `linear-gradient(135deg, ${currentMode.color}, #a855f7)`, boxShadow: `0 0 20px ${currentMode.color}40` }}>
            ➤
          </button>
        </div>
        <p className="text-slate-600 text-xs mt-2 text-center">Enter to send · Shift+Enter for new line</p>

      </main>
    </div>
  );
}