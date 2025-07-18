import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // nécessaire pour OAuth si cookie
});

export default api;
