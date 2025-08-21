// src/App.js
import React, { useContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from './AuthContext';
import api from './api';

// Pages
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import CollectionsPage from './pages/CollectionPage';
import FeedsPage from './pages/FeedsPage';
import SavedPage from './pages/SavedPage';
import AutomationPage from './pages/AutomationPage';
import SearchPage from './pages/SearchPage';
// import AddFeedPage from './pages/AddFeedPage';
import ImportPage from './pages/ImportPage';
import ExportPage from './pages/ExportPage';
import MessagingPage from './pages/MessagingPage';
import PreferencesPage from './pages/PreferencesPage';
import SetPasswordPage from './pages/SetPasswordPage';
import ConfirmEmailPage from './pages/ConfirmEmailPage';
import Layout from './components/Layout';

function App() {
  const { token, setToken } = useContext(AuthContext);
  const [checkingToken, setCheckingToken] = useState(true);
  const navigate = useNavigate();

  // Vérifie token depuis URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromURL = params.get('token');
    if (tokenFromURL) {
      setToken(tokenFromURL);
      localStorage.setItem('token', tokenFromURL);
      window.history.replaceState({}, document.title, '/');
      navigate('/');
    }
  }, [navigate, setToken]);

  // Vérifie validité token backend
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          await api.get('/users/validate-token');
          setToken(storedToken);
        } catch (err) {
          toast.error('Token invalide, veuillez vous reconnecter');
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setCheckingToken(false);
    };
    validateToken();
  }, [setToken]);

  if (checkingToken) return <p style={{ textAlign: 'center', marginTop: 50 }}>Vérification du token...</p>;

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

        {/* Confirmation email */}
        <Route path="/confirm/:token" element={<ConfirmEmailPage />} />

        {/* Layout commun avec Sidebar */}
        <Route path="/" element={<Layout />}>
          <Route index element={token ? <Navigate to="/home" /> : <AuthPage />} />
          <Route path="home" element={token ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="dashboard" element={token ? <DashboardPage /> : <Navigate to="/login" />} />
          <Route path="collections" element={token ? <CollectionsPage /> : <Navigate to="/login" />} />
          <Route path="feeds" element={token ? <FeedsPage /> : <Navigate to="/login" />} />
          <Route path="saved" element={token ? <SavedPage /> : <Navigate to="/login" />} />
          <Route path="automation" element={token ? <AutomationPage /> : <Navigate to="/login" />} />
          <Route path="search" element={token ? <SearchPage /> : <Navigate to="/login" />} />
          {/* <Route path="add-feed" element={token ? <AddFeedPage /> : <Navigate to="/login" />} /> */}
          <Route path="import" element={token ? <ImportPage /> : <Navigate to="/login" />} />
          <Route path="export" element={token ? <ExportPage /> : <Navigate to="/login" />} />
          <Route path="messaging" element={token ? <MessagingPage /> : <Navigate to="/login" />} />
          <Route path="preferences" element={token ? <PreferencesPage /> : <Navigate to="/login" />} />
          <Route path="set-password" element={<SetPasswordPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}
