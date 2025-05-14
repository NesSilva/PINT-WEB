// services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api' // ou a URL definida no backend
});

export default api;
