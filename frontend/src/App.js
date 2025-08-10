
import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
// import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import SetPasswordPage from './pages/SetPasswordPage';
import { AuthContext } from './AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const { token, setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ Vérifie si un token est présent dans l'URL (OAuth)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromURL = params.get('token');

    if (tokenFromURL) {
      setToken(tokenFromURL);
      localStorage.setItem('token', tokenFromURL);

      // Nettoie l'URL pour ne pas garder ?token=...
      window.history.replaceState({}, document.title, '/');
      navigate('/');
    }
  }, [navigate, setToken]);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />

      <Routes>
        <Route path="/login" element={<AuthPage />} />

        <Route path="/" element={token ? <Navigate to="/home" /> : <AuthPage />} />
        {/* <Route path="/home" element={token ? <HomePage /> : <Navigate to="/" />} /> */}
        {/* <Route path="/" element={<LandingPage />} /> */}
        <Route path="/home" element={<HomePage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />

      </Routes>
    </>
  );
}

// 🔁 Wrapper nécessaire car `useNavigate` doit être utilisé dans un composant enfant de <Router>
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
