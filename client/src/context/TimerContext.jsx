import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import API from '../api/axios';

const TimerContext = createContext();

export const MODES = {
  focus: { label: 'Focus',       default: 25 * 60, color: '#6366f1' },
  short: { label: 'Short Break', default:  5 * 60, color: '#14b8a6' },
  long:  { label: 'Long Break',  default: 15 * 60, color: '#a855f7' }
};

const getInitialDurations = () => {
  try {
    return JSON.parse(localStorage.getItem('timer_durations')) ||
      { focus: 25 * 60, short: 5 * 60, long: 15 * 60 };
  } catch { return { focus: 25 * 60, short: 5 * 60, long: 15 * 60 }; }
};

export const TimerProvider = ({ children }) => {
  const [mode,        setMode]        = useState(() => localStorage.getItem('timer_mode') || 'focus');
  const [durations,   setDurations]   = useState(getInitialDurations);
  const [running,     setRunning]     = useState(false);
  const [endTime,     setEndTime]     = useState(() => Number(localStorage.getItem('timer_end')) || null);
  const [timeLeft,    setTimeLeft]    = useState(() => durations[localStorage.getItem('timer_mode') || 'focus']);
  const [subjectId,   setSubjectId]   = useState('');
  const [pomodorosDone, setPomodorosDone] = useState(() => Number(localStorage.getItem('pomodoros_done')) || 0);
  const [showBreakPrompt, setShowBreakPrompt] = useState(false);
  const intervalRef = useRef(null);

  const calcTimeLeft = useCallback(() => {
    if (!endTime) return durations[mode];
    const diff = Math.round((endTime - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endTime, mode]);

  // Restore timer on mount
  useEffect(() => {
    const savedEnd  = Number(localStorage.getItem('timer_end'));
    const savedMode = localStorage.getItem('timer_mode') || 'focus';
    if (savedEnd && savedEnd > Date.now()) {
      setEndTime(savedEnd);
      setMode(savedMode);
      setRunning(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        const t = calcTimeLeft();
        setTimeLeft(t);
        if (t <= 0) {
          clearInterval(intervalRef.current);
          setRunning(false);
          setEndTime(null);
          localStorage.removeItem('timer_end');
          handleSessionEnd();
        }
      }, 500);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, calcTimeLeft]);

  const handleSessionEnd = async () => {
    // Play chime
    try {
      const ctx  = new (window.AudioContext || window.webkitAudioContext)();
      const play = (freq, start, dur) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + dur);
      };
      play(523, 0,    0.3);
      play(659, 0.3,  0.3);
      play(784, 0.6,  0.5);
    } catch { /* audio not supported */ }

    // Browser notification
    if (Notification.permission === 'granted') {
      new Notification('⏰ StudyAI', {
        body: mode === 'focus'
          ? '🎉 Focus session complete! You can take a break now.'
          : '💪 Break over! Ready to focus?',
        icon: '/favicon.ico'
      });
    }

    // Save session to DB
    if (mode === 'focus') {
      const newCount = pomodorosDone + 1;
      setPomodorosDone(newCount);
      localStorage.setItem('pomodoros_done', newCount);
      setShowBreakPrompt(true); // Show break options

      try {
        await API.post('/pomodoro', {
          duration:  durations.focus / 60,
          type:      'focus',
          subjectId: subjectId || undefined
        });
      } catch { /* save failed silently */ }
    } else {
      setShowBreakPrompt(false);
    }
  };

  const start = () => {
    if (Notification.permission === 'default') Notification.requestPermission();
    const end = Date.now() + timeLeft * 1000;
    setEndTime(end);
    localStorage.setItem('timer_end',  String(end));
    localStorage.setItem('timer_mode', mode);
    setRunning(true);
    setShowBreakPrompt(false);
  };

  const pause = () => {
    setRunning(false);
    setEndTime(null);
    localStorage.removeItem('timer_end');
  };

  const reset = () => {
    setRunning(false);
    setEndTime(null);
    setShowBreakPrompt(false);
    localStorage.removeItem('timer_end');
    setTimeLeft(durations[mode]);
  };

  const switchMode = (m, customSecs) => {
    setRunning(false);
    setEndTime(null);
    setShowBreakPrompt(false);
    localStorage.removeItem('timer_end');
    localStorage.setItem('timer_mode', m);
    setMode(m);
    const secs = customSecs || durations[m];
    setTimeLeft(secs);
  };

  const setCustomDuration = (m, minutes) => {
    const secs = minutes * 60;
    const updated = { ...durations, [m]: secs };
    setDurations(updated);
    localStorage.setItem('timer_durations', JSON.stringify(updated));
    if (mode === m) { setTimeLeft(secs); setRunning(false); setEndTime(null); localStorage.removeItem('timer_end'); }
  };

  const continueWithoutBreak = () => {
    setShowBreakPrompt(false);
    switchMode('focus');
  };

  const mins     = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs_str = String(timeLeft % 60).padStart(2, '0');
  const progress = ((durations[mode] - timeLeft) / durations[mode]) * 100;

  return (
    <TimerContext.Provider value={{
      mode, timeLeft, running, progress, mins, secs: secs_str,
      durations, subjectId, setSubjectId, pomodorosDone,
      showBreakPrompt, setShowBreakPrompt,
      start, pause, reset, switchMode,
      setCustomDuration, continueWithoutBreak,
      MODES
    }}>
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => useContext(TimerContext);