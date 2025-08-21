import axios from 'axios';

// Création de l'instance axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // nécessaire pour OAuth si cookie
});

// Intercepteur pour ajouter le token dans les headers si présent
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // ou utilise le context Auth
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// URL de base pour fetch classique
const API_URL = 'http://localhost:5000/api';

// Exemple de fonction fetch classique (peut être remplacée par axios)
export async function fetchCollections() {
  const response = await fetch(`${API_URL}/collections`, {
    credentials: 'include', // nécessaire pour OAuth si cookie
  });
  if (!response.ok) throw new Error('Erreur lors du chargement des collections');
  return response.json();
}

export default api;
