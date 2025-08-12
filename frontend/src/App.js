import React, { useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CollectionsPage from './pages/CollectionPage';
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

      // Nettoie l'URL
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
        {/* Page de connexion */}
        <Route path="/login" element={<AuthPage />} />

        {/* Layout commun avec Sidebar */}
        <Route path="/" element={<Layout />}>
          {/* Page d'accueil : redirection selon connexion */}
          <Route index element={token ? <Navigate to="/home" /> : <AuthPage />} />

          {/* Pages accessibles si connecté */}
          <Route path="home" element={token ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="collections" element={token ? <CollectionsPage /> : <Navigate to="/login" />} />
          <Route path="set-password" element={<SetPasswordPage />} />
        </Route>

        {/* Route fallback si URL inconnue */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

// 🔁 Wrapper car `useNavigate` doit être dans un composant enfant de <Router>
export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
