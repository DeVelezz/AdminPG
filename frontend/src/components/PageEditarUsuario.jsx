import React, { useState, useEffect } from "react";
import useService from '../services/useService';
import Swal from 'sweetalert2';
import SectionHeader from "./SectionHeader";
import Logo from "./Logo";
import BotonSecundary from "./BotonSecundary";
import ImgFondo from "./ImgFondo";
import SectionFooter from "./SectionFooter";
import { getToken } from '../utils/sessionManager';

export default function PageEditarUsuario() {
    const [userData, setUserData] = useState({
        id: '',
        nombre: '',
        email: '',
        torre: '',
        apartamento: '',
        telefono: '',
        estado: 'Activo'
    });

    // Obtener el ID del usuario desde la URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const userId = urlParams.get('id');
        const cargarUsuario = async () => {
            if (!userId) return;
            try {
                const token = getToken();
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                const resp = await fetch(`${API_URL}/usuarios/${userId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {})
                    }
                });
                if (!resp.ok) {
                    const txt = await resp.text();
                    throw new Error(txt || 'No se pudo obtener el usuario');
                }
                const json = await resp.json();
                const u = json.data || json;
                setUserData({
                    id: u.id || userId,
                    nombre: u.nombre || '',
                    email: u.email || '',
                    torre: u.torre || '',
                    apartamento: u.apartamento || '',
                    telefono: u.telefono || '',
                    estado: u.estado || 'Activo'
                });
            } catch (err) {
                console.error('Error cargando usuario:', err);
                // dejar el formulario vacío y notificar
                window.alert('No se pudo cargar la información del usuario.');
            }
        };

        cargarUsuario();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const body = {
                nombre: userData.nombre,
                email: userData.email,
                telefono: userData.telefono,
                torre: userData.torre,
                apartamento: userData.apartamento,
                estado: userData.estado
            };

            // Llamada al servicio
            await useService.updateUser(userData.id, body);

            await Swal.fire({ icon: 'success', title: 'Listo', text: `Usuario ${userData.nombre} actualizado correctamente` });
            window.location.href = "/admin";
        } catch (err) {
            console.error('Error actualizando usuario:', err);
            Swal.fire({ icon: 'error', title: 'Error', text: typeof err === 'string' ? err : 'No se pudo actualizar el usuario' });
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* HEADER */}
            <SectionHeader>
                <Logo redirectTo="/admin" />
                <BotonSecundary textoBtn="Volver" onClick={() => window.location.href = "/admin"} />
            </SectionHeader>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 relative">
                <ImgFondo>
                    <img
                        src="/img/imagen.png"
                        alt="Imagen de fondo"
                        className="w-full h-full object-cover brightness-75 absolute inset-0"
                    />

                    {/* FORMULARIO CENTRADO */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="bg-white p-10 rounded-lg shadow-lg w-120 overflow-hidden">
                            <h2 className="text-2xl font-semibold text-center text-gray-700 mb-8">
                                Editar Usuario - ID: {userData.id}
                            </h2>
                            
                            <form onSubmit={handleSave}>
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre Completo</label>
                                        <input 
                                            type="text" 
                                            name="nombre"
                                            value={userData.nombre}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input 
                                            type="email" 
                                            name="email"
                                            value={userData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Torre</label>
                                        <select 
                                            name="torre"
                                            value={userData.torre}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">Seleccionar Torre</option>
                                            <option value="Torre 1">Torre 1</option>
                                            <option value="Torre 2">Torre 2</option>
                                            <option value="Torre 3">Torre 3</option>
                                            <option value="Torre 4">Torre 4</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Apartamento</label>
                                        <input 
                                            type="text" 
                                            name="apartamento"
                                            value={userData.apartamento}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="Ej: 101, 205, 308"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                                        <input 
                                            type="tel" 
                                            name="telefono"
                                            value={userData.telefono}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="3001234567"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                                        <select 
                                            name="estado"
                                            value={userData.estado}
                                            onChange={handleInputChange}
                                            className="w-48 px-4 py-3 border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-300"
                                        >
                                            <option value="Activo">Activo</option>
                                            <option value="En mora">En mora</option>
                                            <option value="Por vencer">Por vencer</option>
                                            <option value="Suspendido">Suspendido</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex justify-center">
                                        <button
                                            type="submit"
                                            className="w-36 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 font-medium border border-transparent text-sm"
                                        >
                                            Guardar Cambios
                                        </button>
                                    </div>
                                    <div className="flex justify-center">
                                        <button
                                            type="button"
                                            className="w-36 px-4 py-2 bg-gray-500 text-white rounded shadow hover:bg-gray-600 font-medium border border-transparent text-sm"
                                            onClick={() => window.location.href = "/admin"}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </ImgFondo>
            </main>

            {/* FOOTER */}
            <SectionFooter />
        </div>
    );
}