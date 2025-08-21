import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api'; // <-- utilise ton axios configuré
import { toast } from 'react-toastify';

export default function ConfirmEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        await api.get(`/users/confirm/${token}`); // <--- baseURL est ajouté automatiquement
        toast.success('Email confirmé avec succès !');
        navigate('/login'); // redirection vers login
      } catch (err) {
        toast.error(err.response?.data?.msg || 'Erreur lors de la confirmation');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    confirmEmail();
  }, [token, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: 50 }}>
      {loading ? <p>Confirmation en cours...</p> : <p>Redirection...</p>}
    </div>
  );
}
