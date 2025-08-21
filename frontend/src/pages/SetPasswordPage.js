import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { toast } from 'react-toastify';

export default function SetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // 🔒 Vérifie si l'email est présent
  useEffect(() => {
    if (!email) {
      toast.error("Email manquant. Redirection...");
      setTimeout(() => navigate('/'), 1500);
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');

    if (!password || !confirmPassword) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/users/set-password', { email, password });
      setMsg(res.data.msg || 'Mot de passe défini avec succès !');
      toast.success('Mot de passe défini avec succès !');
      setPassword('');
      setConfirmPassword('');

      // ✅ Redirection après 2 sec
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Erreur lors de la définition du mot de passe');
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Définir un mot de passe</h2>
      <p>Pour continuer, veuillez définir un mot de passe pour votre compte <strong>{email}</strong></p>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Confirmer le mot de passe"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Chargement...' : 'Valider'}
        </button>
      </form>

      {msg && <p style={styles.msg}>{msg}</p>}
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    margin: '50px auto',
    padding: 30,
    textAlign: 'center',
    border: '1px solid #ddd',
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 0 20px rgba(0,0,0,0.05)',
  },
  title: { marginBottom: 15 },
  form: { display: 'flex', flexDirection: 'column' },
  input: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 5,
    border: '1px solid #ccc',
    fontSize: 16,
  },
  button: {
    padding: 12,
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: 5,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  msg: { marginTop: 15, color: 'green' },
  error: { marginTop: 15, color: 'red' },
};
