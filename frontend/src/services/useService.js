import axios from 'axios';

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

            if (response.data && response.data.success) {
                // Guardar token y usuario
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('Usuario', JSON.stringify(response.data.usuario));
            }

            return response.data;
        } catch (error) {
            console.error('Error en login:', error);
            throw error.response?.data?.message || error.message || 'Error al iniciar sesión';
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
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/usuarios`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            return response.data.data;
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            throw error.response?.data?.message || 'Error al obtener usuarios';
        }
    },

    // Obtener usuario por ID
    getUserById: async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/usuarios/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            return response.data.data;
        } catch (error) {
            console.error('Error al obtener usuario:', error);
            throw error.response?.data?.message || 'Error al obtener usuario';
        }
    },

    // Actualizar usuario
    updateUser: async (id, userData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_URL}/usuarios/${id}`, userData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            return response.data;
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            throw error.response?.data?.message || 'Error al actualizar usuario';
        }
    },

    // Eliminar usuario
    deleteUser: async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${API_URL}/usuarios/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

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