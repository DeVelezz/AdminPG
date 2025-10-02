import axios from 'axios';
import api from './api';

// En Vite las variables de entorno públicas deben empezar con VITE_
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const useService = {
    // Login: espera (email, contrasena)
    login: async (email, contrasena) => {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                contrasena,
            });

            // El backend devuelve { msg, token, usuario } (sin campo `success`),
            // así que guardamos el token siempre que exista.
            if (response.data && response.data.token) {
                // Guardar token y usuario
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('Usuario', JSON.stringify(response.data.usuario || {}));
            }

            return response.data;
        } catch (error) {
            console.error('Error en login:', error);
            // El backend puede devolver { error: '...', msg: '...' }
            const backendMsg = error.response?.data?.message || error.response?.data?.error || error.response?.data?.msg;
            throw backendMsg || error.message || 'Error al iniciar sesión';
        }
    },

    // Registro de usuario
    createUser: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/registro`, userData);

            return response.data;
        } catch (error) {
            console.error('Error en createUser:', error);
            throw error.response?.data?.message || error.message || 'Error al registrar usuario';
        }
    },

    // Obtener todos los usuarios
    getAllUsers: async () => {
        try {
            const response = await api.get('/usuarios');
            return response.data.data;
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            throw error.response?.data?.message || 'Error al obtener usuarios';
        }
    },

    // Obtener usuario por ID
    getUserById: async (id) => {
        try {
            const response = await api.get(`/usuarios/${id}`);
            return response.data.data;
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            throw error.response?.data?.message || 'Error al obtener usuario';
        }
    },

    // Actualizar usuario
    updateUser: async (id, userData) => {
        try {
            const response = await api.put(`/usuarios/${id}`, userData);
            return response.data;
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw error.response?.data?.message || 'Error al actualizar usuario';
        }
    },

    // Eliminar usuario
    deleteUser: async (id) => {
        try {
            const response = await api.delete(`/usuarios/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            throw error.response?.data?.message || 'Error al eliminar usuario';
        }
    },

    // Cerrar sesión
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('Usuario');
    },
};

export default useService;