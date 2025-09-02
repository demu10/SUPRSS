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
import CollectionArticlesPage from './pages/CollectionArticlesPage';
import FeedsPage from './pages/FeedsPage';
import FeedArticlesPage from './pages/FeedArticlesPage';
import ArticlesPage from "./pages/ArticlesPage";
import FavoriteArticlesPage from './pages/FavoriteArticlesPage'; // adapte le chemin si nécessaire
import AutomationPage from './pages/AutomationPage';
// import SearchPage from './pages/SearchPage';
import SearchResultsPage from './pages/SearchResultsPage'; // corrige l'erreur jsx-no-undef
import ImportPage from './pages/ImportPage';
import ExportPage from './pages/ExportPage';
import MessagingPage from './pages/MessagingPage';
import PreferencesPage from './pages/PreferencesPage';
import SetPasswordPage from './pages/SetPasswordPage';
import ConfirmEmailPage from './pages/ConfirmEmailPage';
import Layout from './components/Layout';

// ✅ Route privée
function PrivateRoute({ children }) {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
}

function App() {
  // ⬇️ on enlève `token` pour éviter le warning "assigned but never used"
  const { setToken } = useContext(AuthContext);
  const [checkingToken, setCheckingToken] = useState(true);
  const navigate = useNavigate();

  // Récupère un token dans l’URL (ex: ...?token=XXX) après OAuth
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

  // Valide le token côté backend
  useEffect(() => {
    const validateToken = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          await api.get('/users/validate-token'); // doit envoyer l'Authorization en header via ton instance api
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

  if (checkingToken) {
    return <p style={{ textAlign: 'center', marginTop: 50 }}>Vérification du token...</p>;
  }

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
        {/* Public */}
        <Route path="/login" element={<AuthPage />} />
        <Route path="/confirm/:token" element={<ConfirmEmailPage />} />

        {/* Protégé + Layout */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/home" />} />
          <Route path="home" element={<HomePage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="feeds" element={<FeedsPage />} />
          <Route path="/feeds/:feedId/articles" element={<PrivateRoute><FeedArticlesPage /></PrivateRoute>} />
          {/* ⬇️ sans slash pour rester dans le Layout */}
          <Route path="/collections/:id/articles" element={<CollectionArticlesPage />} />
          <Route path="articles/:feedId" element={<ArticlesPage />} />
          <Route path="/favorites" element={<FavoriteArticlesPage />} />
          <Route path="automation" element={<AutomationPage />} />
          {/* <Route path="search" element={<SearchPage />} /> */}
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="import" element={<ImportPage />} />
          <Route path="export" element={<ExportPage />} />
          <Route path="messaging" element={<MessagingPage />} />
          <Route path="preferences" element={<PreferencesPage />} />
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
