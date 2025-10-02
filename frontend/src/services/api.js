import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor: añadir Authorization si hay token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => Promise.reject(error));

// Response interceptor: manejar 401/403 centralmente
api.interceptors.response.use(
    resp => resp,
    error => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
            // limpiar token y forzar login
                localStorage.removeItem('token');
                localStorage.removeItem('Usuario');
            // redirigir a login para refrescar credenciales
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
