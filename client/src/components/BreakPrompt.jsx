import { motion, AnimatePresence } from 'framer-motion';
import { useTimer } from '../context/TimerContext';

export default function BreakPrompt() {
  const { showBreakPrompt, pomodorosDone, switchMode, continueWithoutBreak } = useTimer();

  return (
    <AnimatePresence>
      {showBreakPrompt && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[200] backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1,   y: 0  }}
            exit={{   opacity: 0, scale: 0.8, y: 20  }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201]
                       glass-card rounded-3xl p-8 w-96 text-center"
            style={{ boxShadow: '0 0 60px rgba(99,102,241,0.4)' }}>

            {/* Celebration */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: 2 }}
              className="text-5xl mb-4">
              🎉
            </motion.div>

            <h2 className="text-white text-xl font-bold mb-1">Session Complete!</h2>
            <p className="text-slate-400 text-sm mb-2">
              Pomodoro #{pomodorosDone} done. Amazing work!
            </p>
            <div className="flex gap-2 justify-center mb-6">
              {[...Array(Math.min(pomodorosDone, 8))].map((_, i) => (
                <span key={i} className="text-lg">🍅</span>
              ))}
            </div>

            <p className="text-slate-300 text-sm font-medium mb-4">What would you like to do?</p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => { switchMode('short'); }}
                className="w-full py-3 rounded-2xl text-white font-semibold text-sm transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #14b8a6, #06b6d4)', boxShadow: '0 0 20px rgba(20,184,166,0.3)' }}>
                ☕ Short Break (5 min)
              </button>
              <button
                onClick={() => { switchMode('long'); }}
                className="w-full py-3 rounded-2xl text-white font-semibold text-sm transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #a855f7, #8b5cf6)', boxShadow: '0 0 20px rgba(168,85,247,0.3)' }}>
                🛋️ Long Break (15 min)
              </button>
              <button
                onClick={continueWithoutBreak}
                className="w-full py-3 glass rounded-2xl text-slate-300 hover:text-white font-semibold text-sm transition-all hover:bg-white/10">
                ⚡ Keep Focusing (No Break)
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}