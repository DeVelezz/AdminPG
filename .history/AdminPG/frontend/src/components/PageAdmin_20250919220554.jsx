import React, { useState } from "react";
import SectionHeader from "./SectionHeader";
import Logo from "./Logo";
import BotonSecundary from "./BotonSecundary";
import ImgFondo from "./ImgFondo";
import SectionFooter from "./SectionFooter";

export default function PageAdmin() {
    const [selectedUsers, setSelectedUsers] = useState([]);
    
    const handleRowClick = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };
    
    const handleDeleteSelected = () => {
        if (selectedUsers.length === 0) {
            alert('No hay usuarios seleccionados');
            return;
        }
        const confirmed = confirm(`¿Eliminar ${selectedUsers.length} usuario(s) seleccionado(s)?`);
        if (confirmed) {
            alert(`Eliminados usuarios: ${selectedUsers.join(', ')}`);
            setSelectedUsers([]);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* HEADER */}
            <SectionHeader>
                <Logo />
                <BotonSecundary textoBtn="Cerrar sesión" onClick={() => window.location.href = "/login"} />
            </SectionHeader>

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 relative">
                <ImgFondo>
                    <img
                        src="/img/imagen.png"
                        alt="Imagen de fondo"
                        className="w-full h-full object-cover brightness-75 absolute inset-0"
                    />

                    <div className="relative z-10 px-5 pt-0 pb-5 -mt-30">
                        <div className="justify-between bg-white p-3 rounded-lg shadow-lg w-350 flex flex-row items-center">
                            <pc>¡BIENVENID@ ADMIN!</pc>
                            <div className="flex gap-2 justify-between">
                                <BotonSecundary textoBtn="Editar perfil" onClick={() => window.location.href = "/actualizar"} />
                                <BotonSecundary textoBtn="ver en mora" onClick={() => window.location.href = "/mora"} />
                            </div>
                        </div>

                        {/* TABLA DE RESIDENTES */}
                        <div className="shadow-lg mt-6">
                            <div className="bg-white shadow-lg rounded">
                                <div className="flex justify-between items-center px-4 py-3 border-b">
                                    <span className="font-semibold text-gray-700">Información de los residentes completa(tabla usuarios +tabla residente)</span>
                                    <div className="flex gap-2">
                                        <button 
                                            className="px-3 py-1 bg-red-600 text-white text-sm rounded shadow hover:bg-red-700"
                                            onClick={handleDeleteSelected}
                                        >
                                            Eliminar seleccionados ({selectedUsers.length})
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-gray-100 p-6 rounded-b">
                                    <h3 className="text-center text-blue-600 font-bold text-xl mb-4">Tabla con los usuarios</h3>

                                    <div className="overflow-x-auto">
                                        <table className="w-full bg-white border rounded shadow">
                                            <thead className="bg-gray-200 text-gray-700">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">ID Usuario</th>
                                                    <th className="px-4 py-2 text-left">Nombre Completo</th>
                                                    <th className="px-4 py-2 text-left">Email</th>
                                                    <th className="px-4 py-2 text-left">Torre</th>
                                                    <th className="px-4 py-2 text-left">Apartamento</th>
                                                    <th className="px-4 py-2 text-left">Estado</th>
                                                    <th className="px-4 py-2 text-center">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr 
                                                    className={`border-t cursor-pointer transition-colors hover:bg-blue-50 ${
                                                        selectedUsers.includes('001') ? 'bg-blue-200' : ''
                                                    }`}
                                                    onClick={() => handleRowClick('001')}
                                                >
                                                    <td className="px-4 py-2">001</td>
                                                    <td className="px-4 py-2">Juan Pérez</td>
                                                    <td className="px-4 py-2">juan@email.com</td>
                                                    <td className="px-4 py-2">Torre 1</td>
                                                    <td className="px-4 py-2">101</td>
                                                    <td className="px-4 py-2">
                                                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Activo</span>
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button 
                                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.location.href = "/editar-usuario?id=001";
                                                            }}
                                                        >
                                                            Editar
                                                        </button>
                                                    </td>
                                                </tr>
                                                <tr 
                                                    className={`border-t cursor-pointer transition-colors hover:bg-blue-50 ${
                                                        selectedUsers.includes('002') ? 'bg-blue-200' : ''
                                                    }`}
                                                    onClick={() => handleRowClick('002')}
                                                >
                                                    <td className="px-4 py-2">002</td>
                                                    <td className="px-4 py-2">María García</td>
                                                    <td className="px-4 py-2">maria@email.com</td>
                                                    <td className="px-4 py-2">Torre 2</td>
                                                    <td className="px-4 py-2">205</td>
                                                    <td className="px-4 py-2">
                                                        <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">En mora</span>
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button 
                                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.location.href = "/editar-usuario?id=002";
                                                            }}
                                                        >
                                                            Editar
                                                        </button>
                                                    </td>
                                                </tr>
                                                <tr 
                                                    className={`border-t cursor-pointer transition-colors hover:bg-blue-50 ${
                                                        selectedUsers.includes('003') ? 'bg-blue-200' : ''
                                                    }`}
                                                    onClick={() => handleRowClick('003')}
                                                >
                                                    <td className="px-4 py-2">003</td>
                                                    <td className="px-4 py-2">Carlos López</td>
                                                    <td className="px-4 py-2">carlos@email.com</td>
                                                    <td className="px-4 py-2">Torre 1</td>
                                                    <td className="px-4 py-2">308</td>
                                                    <td className="px-4 py-2">
                                                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">Por vencer</span>
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button 
                                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.location.href = "/editar-usuario?id=003";
                                                            }}
                                                        >
                                                            Editar
                                                        </button>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </ImgFondo>
            </main>

            {/* FOOTER */}
            <SectionFooter />
        </div>
    );
}
