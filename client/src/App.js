import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TimerProvider } from './context/TimerContext';
import Login       from './pages/Login';
import Signup      from './pages/Signup';
import Dashboard   from './pages/Dashboard';
import Pomodoro    from './pages/Pomodoro';
import AIChat      from './pages/AIChat';
import Analytics   from './pages/Analytics';
import StudyRoom   from './pages/StudyRoom';
import FloatingAI  from './components/FloatingAI';
import BreakPrompt from './components/BreakPrompt';

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  return token ? children : <Navigate to="/login" />;
};

const AppRoutes = () => {
  const { token } = useAuth();
  return (
    <>
      <Routes>
        <Route path="/login"      element={<Login />} />
        <Route path="/signup"     element={<Signup />} />
        <Route path="/"           element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/pomodoro"   element={<PrivateRoute><Pomodoro /></PrivateRoute>} />
        <Route path="/ai"         element={<PrivateRoute><AIChat /></PrivateRoute>} />
        <Route path="/analytics"  element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="/study-room" element={<PrivateRoute><StudyRoom /></PrivateRoute>} />
      </Routes>
      {token && <FloatingAI  />}
      {token && <BreakPrompt />}
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <TimerProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TimerProvider>
    </AuthProvider>
  );
}