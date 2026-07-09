import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080', // A porta onde o seu Java está rodando
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;