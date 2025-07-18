import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import ChatPage from './features/chat/ChatPage';

function App() {
  const isLoggedIn = Boolean(localStorage.getItem('access_token'));
  const [_, setForceUpdate] = useState(0);

  useEffect(() => {
    const onStorage = () => setForceUpdate((n) => n + 1);
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  function PrivateRoute({ children }: { children: JSX.Element }) {
    const location = useLocation();
    if (!Boolean(localStorage.getItem('access_token'))) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    return children;
  }

  function PublicRoute({ children }: { children: JSX.Element }) {
    if (Boolean(localStorage.getItem('access_token'))) {
      return <Navigate to="/chat" replace />;
    }
    return children;
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage onLogin={() => setForceUpdate((n) => n + 1)} onSwitchToSignup={() => window.location.replace('/signup')} />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage onSignup={() => setForceUpdate((n) => n + 1)} onSwitchToLogin={() => window.location.replace('/login')} />
              </PublicRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatPage onLogout={() => { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); setForceUpdate((n) => n + 1); }} />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to={isLoggedIn ? '/chat' : '/login'} replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
