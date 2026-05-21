import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimer, MODES } from '../context/TimerContext';
import API from '../api/axios';

export default function StudyRoom() {
  const timer = useTimer();

  // Layout
  const [rightOpen,   setRightOpen]   = useState(true);
  const [activeTab,   setActiveTab]   = useState('notes');  // notes | pdf
  const [activeRight, setActiveRight] = useState('timer');  // timer | ai

  // Subjects
  const [subjects, setSubjects] = useState([]);

  // Notes
  const [notes,    setNotes]    = useState(() => localStorage.getItem('study_notes') || '');
  const [noteSaved, setNoteSaved] = useState(true);

  // PDF
  const [pdfUrl,  setPdfUrl]  = useState(null);
  const [pdfName, setPdfName] = useState('');
  const fileInputRef = useRef(null);

  // AI
  const [aiInput,   setAiInput]   = useState('');
  const [aiMsgs,    setAiMsgs]    = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const aiBottomRef = useRef(null);

  useEffect(() => {
    API.get('/subjects').then(r => setSubjects(r.data)).catch(console.error);
  }, []);

  // Auto-save notes with debounce
  useEffect(() => {
    setNoteSaved(false);
    const t = setTimeout(() => {
      localStorage.setItem('study_notes', notes);
      setNoteSaved(true);
    }, 800);
    return () => clearTimeout(t);
  }, [notes]);

  useEffect(() => {
    aiBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMsgs]);

  // PDF upload
  const handlePdfUpload = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== 'application/pdf') return;
    const url = URL.createObjectURL(file);
    setPdfUrl(url);
    setPdfName(file.name);
    setActiveTab('pdf');
  };

  // Export notes
  const exportNotesTxt = () => {
    const blob = new Blob([notes], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'study-notes.txt'; a.click();
  };

  const exportNotesPdf = () => {
    const win = window.open('', '_blank');
    win.document.write(`<html><body><pre style="font-family:sans-serif;padding:24px;white-space:pre-wrap;">${notes}</pre></body></html>`);
    win.document.close();
    win.print();
  };

  // AI
  const sendAI = async (msg) => {
    const message = msg || aiInput;
    if (!message.trim() || aiLoading) return;
    setAiInput('');
    setAiMsgs(prev => [...prev, { role: 'user', text: message }]);
    setAiLoading(true);
    try {
      const res = await API.post('/ai/ask', { message, type: 'doubt' });
      setAiMsgs(prev => [...prev, { role: 'ai', text: res.data.reply }]);
    } catch {
      setAiMsgs(prev => [...prev, { role: 'ai', text: '⚠️ AI is busy. Try again shortly.' }]);
    }
    setAiLoading(false);
  };

  // Summarize notes with AI
  const summarizeNotes = () => {
    if (!notes.trim()) return;
    setActiveRight('ai');
    sendAI(`Please summarize these study notes concisely:\n\n${notes.slice(0, 2000)}`);
  };

  const color = MODES[timer.mode]?.color || '#6366f1';
  const R     = 54;
  const circ  = 2 * Math.PI * R;

  return (
    <div className="flex h-screen bg-[#080810] overflow-hidden text-slate-200">

      {/* LEFT — Icon Rail */}
      <div className="w-12 bg-[#0c0c18] border-r border-white/5 flex flex-col items-center py-4 gap-2 flex-shrink-0">
        <a href="/" className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold mb-4" title="Dashboard">S</a>
        {[
          { icon: '🏠',  to: '/',           title: 'Dashboard'  },
          { icon: '📊',  to: '/analytics',  title: 'Analytics'  },
          { icon: '🍅',  to: '/pomodoro',   title: 'Pomodoro'   },
          { icon: '🤖',  to: '/ai',         title: 'AI Chat'    },
        ].map((item, i) => (
          <a key={i} href={item.to} title={item.title}
            className="w-9 h-9 rounded-xl glass flex items-center justify-center text-sm hover:bg-indigo-500/20 transition-all text-slate-400 hover:text-white">
            {item.icon}
          </a>
        ))}
      </div>

      {/* CENTER — Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top Bar */}
        <div className="h-11 bg-[#0c0c18] border-b border-white/5 flex items-center px-4 gap-3 flex-shrink-0">
          {/* Tabs */}
          <div className="flex gap-1 flex-1">
            <button onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${activeTab === 'notes' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}>
              📝 Notes
            </button>
            <button onClick={() => { fileInputRef.current.click(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${activeTab === 'pdf' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}>
              📄 {pdfName ? pdfName.slice(0, 20) + (pdfName.length > 20 ? '...' : '') : 'Open PDF'}
            </button>
            {pdfUrl && (
              <button onClick={() => setActiveTab('pdf')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                  ${activeTab === 'pdf' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-500 hover:text-slate-300'}`}>
                View PDF
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="application/pdf"
              onChange={handlePdfUpload} className="hidden" />
          </div>

          {/* Subject Selector */}
          <select value={timer.subjectId} onChange={e => timer.setSubjectId(e.target.value)}
            className="bg-transparent text-slate-400 text-xs focus:outline-none cursor-pointer border border-white/10 rounded-lg px-2 py-1">
            <option value="">No subject</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>

          {/* Mini Timer */}
          <div className="flex items-center gap-2 glass rounded-xl px-3 py-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${timer.running ? 'bg-green-400 animate-pulse' : 'bg-slate-600'}`} />
            <span className="text-white font-mono font-bold text-xs">{timer.mins}:{timer.secs}</span>
            <button onClick={timer.running ? timer.pause : timer.start}
              className="text-xs px-2 py-0.5 rounded-lg text-white font-medium"
              style={{ background: color }}>
              {timer.running ? '⏸' : '▶'}
            </button>
          </div>

          {/* Notes Actions */}
          {activeTab === 'notes' && (
            <div className="flex gap-1">
              <button onClick={summarizeNotes}
                className="px-2 py-1 glass rounded-lg text-xs text-indigo-400 hover:text-indigo-300 transition-all">
                🤖 Summarize
              </button>
              <button onClick={exportNotesTxt}
                className="px-2 py-1 glass rounded-lg text-xs text-slate-400 hover:text-white transition-all">
                ↓ TXT
              </button>
              <button onClick={exportNotesPdf}
                className="px-2 py-1 glass rounded-lg text-xs text-slate-400 hover:text-white transition-all">
                ↓ PDF
              </button>
            </div>
          )}

          <button onClick={() => setRightOpen(!rightOpen)}
            className="text-slate-500 hover:text-white text-xs glass px-2 py-1 rounded-lg transition-all">
            {rightOpen ? '→' : '←'}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">

            {/* Notes Editor */}
            {activeTab === 'notes' && (
              <motion.div key="notes"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col p-4">
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                  <p className="text-slate-600 text-xs">
                    {noteSaved ? '✓ Saved' : '● Saving...'} · {notes.length} chars
                  </p>
                  <button onClick={() => { if (window.confirm('Clear notes?')) setNotes(''); }}
                    className="text-xs text-slate-600 hover:text-red-400 transition-all">
                    Clear
                  </button>
                </div>
                <textarea
                  className="flex-1 bg-transparent text-slate-200 text-sm leading-7 resize-none focus:outline-none placeholder-slate-700 font-mono"
                  placeholder={`# My Study Notes\n\nStart typing here...\n\nYour notes are auto-saved and can be exported as TXT or PDF.\nClick "🤖 Summarize" to get an AI summary of your notes!\n\nTip: Use markdown-style headings with # for structure`}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  spellCheck={true}
                />
              </motion.div>
            )}

            {/* PDF Viewer */}
            {activeTab === 'pdf' && (
              <motion.div key="pdf"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-full flex flex-col">
                {pdfUrl
                  ? <iframe src={pdfUrl} className="flex-1 w-full border-0" title="PDF Viewer" />
                  : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                      <motion.div animate={{ y: [0,-8,0] }} transition={{ duration:3, repeat:Infinity }}
                        className="text-6xl mb-4">📄</motion.div>
                      <p className="text-white font-semibold text-lg mb-2">Open a PDF to Study</p>
                      <p className="text-slate-400 text-sm mb-6 max-w-xs">
                        Read PDFs inside StudyAI while keeping your timer, notes, and AI accessible.
                      </p>
                      <button onClick={() => fileInputRef.current.click()}
                        className="px-6 py-3 rounded-2xl text-white font-semibold text-sm hover:scale-105 transition-all"
                        style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 24px rgba(99,102,241,0.4)' }}>
                        📂 Choose PDF File
                      </button>
                    </div>
                  )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RIGHT — Timer + AI Panel */}
      <AnimatePresence>
        {rightOpen && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0,   opacity: 1 }}
            exit={{   x: 320, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="w-72 bg-[#0c0c18] border-l border-white/5 flex flex-col flex-shrink-0">

            {/* Right Tabs */}
            <div className="flex border-b border-white/5 flex-shrink-0">
              {[
                { key: 'timer', icon: '🍅', label: 'Timer' },
                { key: 'ai',    icon: '🤖', label: 'AI'    }
              ].map(tab => (
                <button key={tab.key} onClick={() => setActiveRight(tab.key)}
                  className={`flex-1 py-3 text-xs font-medium transition-all flex items-center justify-center gap-1.5
                    ${activeRight === tab.key ? 'text-indigo-300 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">

              {/* Timer Panel */}
              {activeRight === 'timer' && (
                <motion.div key="timer"
                  initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  className="flex-1 flex flex-col p-4 overflow-y-auto">

                  {/* Mode Tabs */}
                  <div className="flex gap-1 mb-4 glass rounded-xl p-1">
                    {Object.entries(MODES).map(([key, val]) => (
                      <button key={key} onClick={() => timer.switchMode(key)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
                          ${timer.mode === key ? 'text-white' : 'text-slate-500 hover:text-white'}`}
                        style={timer.mode === key ? { background: val.color } : {}}>
                        {key === 'focus' ? '25m' : key === 'short' ? '5m' : '15m'}
                      </button>
                    ))}
                  </div>

                  {/* Ring */}
                  <div className="flex justify-center mb-4">
                    <div className="relative w-36 h-36">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                        <circle cx="64" cy="64" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                        <circle cx="64" cy="64" r={R} fill="none" stroke={color} strokeWidth="8"
                          strokeDasharray={circ}
                          strokeDashoffset={circ * (1 - timer.progress / 100)}
                          strokeLinecap="round"
                          style={{ transition:'stroke-dashoffset 1s linear', filter:`drop-shadow(0 0 6px ${color})` }} />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-white font-bold text-2xl font-mono">{timer.mins}:{timer.secs}</span>
                        <span className="text-slate-500 text-xs mt-0.5">{MODES[timer.mode]?.label}</span>
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex gap-2 mb-4">
                    <button onClick={timer.reset}
                      className="flex-1 py-2 glass rounded-xl text-slate-400 hover:text-white text-xs font-medium transition-all">
                      ↺ Reset
                    </button>
                    <button onClick={timer.running ? timer.pause : timer.start}
                      className="flex-grow-[2] py-2 rounded-xl text-white text-xs font-bold transition-all hover:scale-105"
                      style={{ background: `linear-gradient(135deg, ${color}, #a855f7)` }}>
                      {timer.running ? '⏸ Pause' : '▶ Start'}
                    </button>
                  </div>

                  {/* Pomodoro dots */}
                  <div className="flex flex-wrap gap-1.5 mb-4 justify-center">
                    {[...Array(Math.min(timer.pomodorosDone, 12))].map((_, i) => (
                      <span key={i} className="text-sm">🍅</span>
                    ))}
                    {timer.pomodorosDone === 0 && (
                      <p className="text-slate-600 text-xs">Start your first session!</p>
                    )}
                  </div>

                  {/* Subject */}
                  <select value={timer.subjectId} onChange={e => timer.setSubjectId(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 w-full">
                    <option value="">No subject</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </motion.div>
              )}

              {/* AI Panel */}
              {activeRight === 'ai' && (
                <motion.div key="ai"
                  initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                  className="flex-1 flex flex-col min-h-0 p-3">

                  {/* Quick Actions */}
                  <div className="flex flex-col gap-1.5 mb-3 flex-shrink-0">
                    {[
                      { label: '💡 Explain concept', msg: 'Explain the concept I should know about: ' },
                      { label: '🧪 Generate quiz',   msg: 'Generate a 5 question quiz on: '           },
                      { label: '📝 Summarize notes', msg: `Summarize these notes:\n\n${notes.slice(0, 1500)}` },
                      { label: '🐛 Debug code',      msg: 'Debug this code: '                          },
                    ].map((a, i) => (
                      <button key={i} onClick={() => sendAI(a.msg)}
                        className="text-xs text-left px-3 py-2 glass rounded-xl text-indigo-400 hover:bg-indigo-500/10 transition-all">
                        {a.label}
                      </button>
                    ))}
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto flex flex-col gap-2 mb-3 min-h-0">
                    {aiMsgs.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center py-4">
                        <motion.div animate={{ y:[0,-5,0] }} transition={{ duration:2, repeat:Infinity }}>
                          <span className="text-3xl">🧠</span>
                        </motion.div>
                        <p className="text-slate-600 text-xs mt-2">Ask anything while you study!</p>
                      </div>
                    )}
                    {aiMsgs.map((m, i) => (
                      <div key={i} className={`text-xs p-2.5 rounded-xl leading-relaxed break-words
                        ${m.role === 'user'
                          ? 'bg-indigo-500/20 text-indigo-200 ml-4'
                          : 'glass text-slate-300 mr-4'}`}
                        style={{ whiteSpace: 'pre-wrap' }}>
                        {m.text}
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="glass rounded-xl p-2.5 mr-4 flex gap-1 items-center">
                        {[0,1,2].map(i => (
                          <motion.div key={i} className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                            animate={{ y:[0,-4,0] }} transition={{ duration:0.5, repeat:Infinity, delay:i*0.12 }} />
                        ))}
                      </div>
                    )}
                    <div ref={aiBottomRef} />
                  </div>

                  {/* Input */}
                  <div className="flex gap-2 flex-shrink-0">
                    <input
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                      placeholder="Ask AI..."
                      value={aiInput}
                      onChange={e => setAiInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendAI()}
                    />
                    <button onClick={() => sendAI()} disabled={aiLoading}
                      className="px-3 py-2 rounded-xl text-white text-xs font-medium disabled:opacity-50 hover:scale-105 transition-all"
                      style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
                      ➤
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}