import React, { useState, useEffect } from "react";
import SectionHeader from "./SectionHeader";
import Logo from "./Logo";
import BotonSecundary from "./BotonSecundary";
import ImgFondo from "./ImgFondo";
import SectionFooter from "./SectionFooter";

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
        
        // Datos de ejemplo (en producción vendrían de la base de datos)
        const usuarios = {
            '001': {
                id: '001',
                nombre: 'Juan Pérez',
                email: 'juan@email.com',
                torre: 'Torre 1',
                apartamento: '101',
                telefono: '3001234567',
                estado: 'Activo'
            },
            '002': {
                id: '002',
                nombre: 'María García',
                email: 'maria@email.com',
                torre: 'Torre 2',
                apartamento: '205',
                telefono: '3007654321',
                estado: 'En mora'
            },
            '003': {
                id: '003',
                nombre: 'Carlos López',
                email: 'carlos@email.com',
                torre: 'Torre 1',
                apartamento: '308',
                telefono: '3009876543',
                estado: 'Por vencer'
            }
        };

        if (userId && usuarios[userId]) {
            setUserData(usuarios[userId]);
        }
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        // Aquí implementarías la lógica para guardar en la base de datos
        alert(`Usuario ${userData.nombre} actualizado correctamente`);
        window.location.href = "/admin";
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