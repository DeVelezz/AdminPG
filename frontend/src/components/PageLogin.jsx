import BotonSecundary from './BotonSecundary'
import SectionHeader from './SectionHeader'
import SectionImg from './SectionImg'
import Logo from './Logo'
import ImgFondo from './ImgFondo'
import SectionFooter from './SectionFooter'
import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import Form from './Form';

export default function PageLogin({ onLogin }) {
    const [email, setEmail] = useState('');
    const [contraseña, setContraseña] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post('http://localhost:3000/api/login', { email, contraseña });
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('Usuario', JSON.stringify(res.data.usuario));

            onLogin(res.data.usuario);

            // Redirigir según el tipo de usuario
            if (res.data.usuario.tipo === 'admin') {
                window.location.href = "/admin";
            } else {
                window.location.href = "/residente";
            }

        } catch (error) {
            if (error.response?.data?.msg === 'Usuario no encontrado') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de login',
                    text: 'Usuario no encontrado',
                    timer: 3000,
                    timerProgressBar: true,
                });
            } else if (error.response?.data?.msg === 'Faltan campos requeridos') {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de login',
                    text: 'Faltan campos requeridos',
                    timer: 3000,
                    timerProgressBar: true,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error de login',
                    text: 'Credenciales incorrectas',
                    timer: 3000,
                    timerProgressBar: true,
                });
            }

            console.error(error.response?.data?.msg || "Error en login");
        }
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* HEADER */}
            <SectionHeader>
                <div className="ml-2">
                    <Logo redirectTo="/" />
                </div>
                <div className="flex space-x-2">
                    <BotonSecundary textoBtn="Inicio" onClick={() => window.location.href = "/"} />
                    <BotonSecundary textoBtn="Registrate" onClick={() => window.location.href = "/registro"} />
                </div>
            </SectionHeader>
            
            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 relative">
                <ImgFondo>
                    <img src="/img/imagen.png" alt="Imagen de fondo" className="w-full h-full object-cover brightness-75 absolute inset-0" />
                    
                    {/* FORMULARIO DE LOGIN CENTRADO Y MEDIANO */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-white p-8 rounded-lg shadow-lg w-96">
                            <h2 className="text-2xl font-semibold text-center text-gray-700 mb-8">Iniciar Sesión</h2>
                            
                            <form onSubmit={handleSubmit}>
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Tu correo electrónico"
                                        required
                                    />
                                </div>

                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                                    <input
                                        type="password"
                                        value={contraseña}
                                        onChange={(e) => setContraseña(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Tu contraseña"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full px-4 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700 font-medium"
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