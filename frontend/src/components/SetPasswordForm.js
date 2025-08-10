import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const SetPasswordForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const userEmail = location.state?.email;

  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // 🔒 Vérifie si l'email est présent
  useEffect(() => {
    if (!userEmail) {
      toast.error("Email manquant. Redirection...");
      setTimeout(() => navigate('/'), 1500);
    }
  }, [userEmail, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    setMsg('');
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/users/set-password', {
        email: userEmail,
        password
      });

      setMsg(res.data.msg);
      toast.success("Mot de passe défini avec succès !");
      setPassword('');

      // ✅ Redirection vers la page de connexion après 2 sec
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Erreur lors de la création du mot de passe');
    }
  };

  if (!userEmail) return null;

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">Définir un mot de passe</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600">Email : <strong>{userEmail}</strong></p>

        <input
          type="password"
          placeholder="Nouveau mot de passe"
          className="w-full border border-gray-300 rounded p-2"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Enregistrer le mot de passe
        </button>
      </form>

      {msg && <p className="mt-4 text-green-600">{msg}</p>}
      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
};

export default SetPasswordForm;
