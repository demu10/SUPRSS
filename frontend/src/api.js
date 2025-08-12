import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // nécessaire pour OAuth si cookie
});

const API_URL = 'http://localhost:5000/api'; // adapte si besoin

export async function fetchCollections() {
  const response = await fetch(`${API_URL}/collections`);
  if (!response.ok) throw new Error('Erreur lors du chargement des collections');
  return response.json();
}

export default api;
