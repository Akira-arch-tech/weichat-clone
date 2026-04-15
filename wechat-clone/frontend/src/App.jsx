import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import useStore from './store';
import { connectSocket, disconnectSocket, getSocket } from './socket';
import { authAPI } from './api';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Chat from './pages/Chat';
import ContactDetail from './pages/ContactDetail';
import Moments from './pages/Moments';
import CreateMoment from './pages/CreateMoment';
import Settings from './pages/Settings';

function ProtectedRoute({ children }) {
  const token = useStore(s => s.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const token = useStore(s => s.token);
  if (token) {
    return <Navigate to="/home" replace />;
  }
  return children;
}

export default function App() {
  const { token, setUser, logout } = useStore();

  useEffect(() => {
    if (!token) return;

    // Verify token and get current user
    authAPI.me().then(res => {
      setUser(res.data);
    }).catch(() => {
      logout();
    });

    // Connect socket — individual pages handle their own socket events
    connectSocket(token);

    return () => {
      // Don't disconnect on token change re-render; only disconnect on full logout
    };
  }, [token]);

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-[#EDEDED] flex justify-center">
        <div className="w-full max-w-[390px] min-h-screen flex flex-col bg-[#EDEDED] relative">
          <Routes>
            <Route path="/" element={<Navigate to={token ? '/home' : '/login'} replace />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/chat/:userId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/contacts/:userId" element={<ProtectedRoute><ContactDetail /></ProtectedRoute>} />
            <Route path="/moments" element={<ProtectedRoute><Moments /></ProtectedRoute>} />
            <Route path="/moments/create" element={<ProtectedRoute><CreateMoment /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
