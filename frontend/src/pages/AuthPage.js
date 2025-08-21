import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { toast } from 'react-toastify';
import logo from '../assets/logo.png';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import api from '../api';

export default function AuthPage() {
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ États
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [msg, setMsg] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    setEmail('');
    setPassword('');
    setNom('');
    setPrenom('');
    setMsg('');
  }, []);

  // Connexion
  const login = async () => {
    try {
      const res = await api.post('/users/login', { email, password });
      setToken(res.data.token);
      toast.success("Connexion réussie !");
      setEmail('');
      setPassword('');
      setMsg('');
      setTimeout(() => navigate('/home'), 1000);
    } catch (err) {
      const msg = err.response?.data?.msg;

      // Cas spécifique : le compte est Google-only ou hybride sans mot de passe défini
      if (
        msg?.includes("Ce compte a été créé via Google") ||
        msg?.includes("définir un mot de passe")
      ) {
        toast.info("Ce compte nécessite un mot de passe. Redirection...");
        setTimeout(() => {
          navigate('/set-password', { state: { email } });
        }, 1500);
      } else {
        setMsg(msg || 'Erreur de connexion');
      }
    }
  };

  // Inscription
  const register = async () => {
    try {
      const res = await api.post('/users/register', { email, password, nom, prenom });
      setToken(res.data.token);
      toast.success("Inscription réussie !");
      setIsRegister(false);
      setEmail('');
      setPassword('');
      setNom('');
      setPrenom('');
      setMsg('');
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Erreur lors de l'inscription");
    }
  };

  // Auth OAuth
  const loginWithGoogle = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  const loginWithGitHub = () => {
    window.location.href = 'http://localhost:5000/api/auth/github';
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{isRegister ? 'Inscription SUPRSS' : 'Connexion SUPRSS'}</h2>

      {isRegister && (
        <>
          <input
            type="text"
            placeholder="Nom"
            value={nom}
            style={styles.input}
            onChange={(e) => setNom(e.target.value)}
          />
          <input
            type="text"
            placeholder="Prénom"
            value={prenom}
            style={styles.input}
            onChange={(e) => setPrenom(e.target.value)}
          />
        </>
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        style={styles.input}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div style={{ position: 'relative' }}>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Mot de passe"
          value={password}
          style={styles.input}
          onChange={(e) => setPassword(e.target.value)}
        />
        <span
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: 15,
            top: '50%',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
            color: '#555',
            fontSize: 14
          }}
        >
          {showPassword ? '🙈' : '👁️'}
        </span>
      </div>

      <button style={styles.button} onClick={isRegister ? register : login}>
        {isRegister ? "S'inscrire" : "Se connecter"}
      </button>

      {msg && <p style={styles.error}>{msg}</p>}

      {!isRegister && (
        <>
          <div style={styles.divider}>ou</div>

          <button style={styles.oauthGoogle} onClick={loginWithGoogle}>
            <FcGoogle size={20} style={{ marginRight: 10 }} />
            Connexion avec Google
          </button>

          <button style={styles.oauthGitHub} onClick={loginWithGitHub}>
            <FaGithub size={20} style={{ marginRight: 10 }} />
            Connexion avec GitHub
          </button>
        </>
      )}

      <p style={{ marginTop: 10 }}>
        {isRegister ? 'Déjà un compte ?' : 'Pas encore de compte ?'}{' '}
        <span
          style={{ color: '#007BFF', cursor: 'pointer', textDecoration: 'underline' }}
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister ? 'Connecte-toi' : 'Inscris-toi'}
        </span>
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 420,
    margin: 'auto',
    padding: 30,
    textAlign: 'center',
    border: '1px solid #ddd',
    borderRadius: 12,
    marginTop: 60,
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 0 20px rgba(0,0,0,0.05)',
    backgroundImage: `url(${logo})`,
    backgroundRepeat: 'no-repeat',
    backgroundSize: 100,
    backgroundPosition: 'top right',
  },
  title: { marginBottom: 20 },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 10,
    borderRadius: 5,
    border: '1px solid #ccc',
    fontSize: 16,
  },
  button: {
    width: '100%',
    padding: 12,
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: 5,
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  error: { color: 'red', marginTop: 10 },
  divider: {
    margin: '20px 0',
    fontWeight: 'bold',
    fontSize: 14,
    color: '#777',
  },
  oauthGoogle: {
    backgroundColor: '#a8bbccff',
    color: 'white',
    width: '100%',
    padding: 12,
    marginBottom: 10,
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer',
  },
  oauthGitHub: {
    backgroundColor: '#333',
    color: 'white',
    width: '100%',
    padding: 12,
    border: 'none',
    borderRadius: 5,
    cursor: 'pointer',
  },
};
