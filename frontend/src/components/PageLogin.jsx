import BotonSecundary from './BotonSecundary'
import SectionHeader from './SectionHeader'
import SectionImg from './SectionImg'
import Logo from './Logo'
import ImgFondo from './ImgFondo'
import SectionFooter from './SectionFooter'
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import Form from './Form';
import { saveSession } from '../utils/sessionManager';

export default function PageLogin({ onLogin }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [contrasena, setContrasena] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación básica
    if (!email || !contrasena) {
            Swal.fire({
                icon: 'warning',
                title: 'Campos vacíos',
                text: 'Por favor completa todos los campos',
                timer: 3000,
                timerProgressBar: true,
            });
            return;
        }

        try {
            // Enviar con headers correctos
            const res = await axios.post('http://localhost:5000/api/login', 
                { 
                    email: email.trim(), 
                    contrasena: contrasena.trim() 
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Guardar datos usando el gestor de sesiones
            saveSession(res.data.token, res.data.usuario);

            // Mostrar mensaje de éxito
            await Swal.fire({
                icon: 'success',
                title: '¡Bienvenido!',
                text: 'Inicio de sesión exitoso',
                timer: 1500,
                showConfirmButton: false,
                timerProgressBar: true,
            });

            // Actualizar estado del padre
            if (onLogin) {
                onLogin(res.data.usuario);
            }

            // Redirigir según el rol del usuario
            setTimeout(() => {
                if (res.data.usuario.rol === 'administrador') {
                    navigate("/admin");
                } else {
                    navigate("/residente");
                }
            }, 100);

        } catch (error) {
            console.error('Error completo:', error);
            
            // Manejar diferentes tipos de errores
            if (error.response) {
                // El servidor respondió con un error
                const errorMsg = error.response?.data?.error || error.response?.data?.message;
                
                if (errorMsg === 'Usuario no encontrado') {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Usuario no encontrado',
                        text: 'No existe una cuenta con este correo electrónico',
                        timer: 3000,
                        timerProgressBar: true,
                    });
                } else if (errorMsg === 'Contraseña incorrecta') {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Contraseña incorrecta',
                        text: 'La contraseña que ingresaste es incorrecta',
                        timer: 3000,
                        timerProgressBar: true,
                    });
                } else if (errorMsg === 'Faltan campos requeridos') {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Campos incompletos',
                        text: 'Por favor completa todos los campos',
                        timer: 3000,
                        timerProgressBar: true,
                    });
                } else {
                    await Swal.fire({
                        icon: 'error',
                        title: 'Error de inicio de sesión',
                        text: errorMsg || 'Credenciales incorrectas',
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            } else if (error.request) {
                // La petición se hizo pero no hubo respuesta
                await Swal.fire({
                    icon: 'error',
                    title: 'Error de conexión',
                    text: 'No se pudo conectar con el servidor. Verifica tu conexión.',
                    timer: 3000,
                    timerProgressBar: true,
                });
            } else {
                // Otro tipo de error
                await Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error inesperado',
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* HEADER */}
            <SectionHeader>
                <div className="ml-2">
                    <Logo redirectTo="/" />
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <BotonSecundary textoBtn="Inicio" onClick={() => navigate("/")} />
                    <BotonSecundary textoBtn="Registrate" onClick={() => navigate("/registro")} />
                </div>
            </SectionHeader>
            
            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 relative">
                <ImgFondo>
                    <img src="/img/imagen.png" alt="Imagen de fondo" className="w-full h-full object-cover brightness-75 absolute inset-0" />
                    
                    {/* FORMULARIO DE LOGIN CENTRADO Y MEDIANO */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full px-1 xxs:px-3 sm:px-0">
                        <div className="bg-white p-2 xxs:p-4 sm:p-6 md:p-8 rounded-lg shadow-lg w-full max-w-[260px] xxs:max-w-sm sm:max-w-md mx-auto">
                            <h2 className="text-sm xxs:text-lg sm:text-xl md:text-2xl font-semibold text-center text-gray-700 mb-2 xxs:mb-4 sm:mb-6 md:mb-8">Iniciar Sesión</h2>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="mb-2 xxs:mb-4 sm:mb-6">
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="correo@ejemplo.com"
                                        required
                                    />
                                </div>

                                <div className="mb-2 xxs:mb-6 sm:mb-8">
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Contraseña</label>
                                    <input
                                        type="password"
                                        value={contrasena}
                                        onChange={(e) => setContrasena(e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-slate-700 text-white rounded-lg hover:bg-slate-800 font-medium transition-colors shadow-sm"
                                >
                                    Iniciar Sesión
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    ¿No tienes cuenta? 
                                    <a href="/registro" className="text-blue-600 hover:text-blue-800 ml-1">Regístrate</a>
                                </p>
                            </div>
                        </div>
                    </div>
                </ImgFondo>
            </main>

            {/* FOOTER */}
            <SectionFooter />
        </div>
    )
}