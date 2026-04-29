// Cliente HTTP configurado com axios — injeta a API Key em todas as requisições
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 15000,
});

// Interceptor de requisição — adiciona a API Key interna
api.interceptors.request.use((config) => {
  config.headers['X-API-Key'] = import.meta.env.VITE_API_KEY || '';
  return config;
});

// Interceptor de resposta — extrai a mensagem de erro amigável
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const mensagem =
      error.response?.data?.erro ||
      error.response?.data?.erros?.[0] ||
      'Erro de comunicação com o servidor. Tente novamente.';
    return Promise.reject(new Error(mensagem));
  }
);

export default api;
