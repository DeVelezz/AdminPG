import React, { useState } from "react";
import SectionHeader from "./SectionHeader";
import Logo from "./Logo";
import BotonSecundary from "./BotonSecundary";
import ImgFondo from "./ImgFondo";
import SectionFooter from "./SectionFooter";

export default function PageAdmin() {
    const [selectedUsers, setSelectedUsers] = useState([]);
    // Usuarios hardcodeados
    const users = [
        {
            id: '001', nombre: 'Juan Pérez', email: 'juan@email.com', torre: 'Torre 1', apto: '101', estado: 'Activo', estadoColor: 'green', estadoLabel: 'Activo'
        },
        {
            id: '002', nombre: 'María García', email: 'maria@email.com', torre: 'Torre 2', apto: '205', estado: 'En mora', estadoColor: 'red', estadoLabel: 'En mora'
        },
        {
            id: '003', nombre: 'Carlos López', email: 'carlos@email.com', torre: 'Torre 1', apto: '308', estado: 'Por vencer', estadoColor: 'yellow', estadoLabel: 'Por vencer'
        },
        // Puedes agregar más usuarios aquí
    ];

    // Paginación
    const USERS_PER_PAGE = 2;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(users.length / USERS_PER_PAGE);
    const paginatedUsers = users.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

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

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
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

                    <div className="relative z-10 p-5">
                        <div className="justify-between bg-white p-3 rounded-lg shadow-lg w-350 flex flex-row items-center">
                            <p>¡BIENVENID@ ADMIN!</p>
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
                                                {paginatedUsers.map(user => (
                                                    <tr
                                                        key={user.id}
                                                        className={`border-t cursor-pointer transition-colors hover:bg-blue-50 ${selectedUsers.includes(user.id) ? 'bg-blue-200' : ''}`}
                                                        onClick={() => handleRowClick(user.id)}
                                                    >
                                                        <td className="px-4 py-2">{user.id}</td>
                                                        <td className="px-4 py-2">{user.nombre}</td>
                                                        <td className="px-4 py-2">{user.email}</td>
                                                        <td className="px-4 py-2">{user.torre}</td>
                                                        <td className="px-4 py-2">{user.apto}</td>
                                                        <td className="px-4 py-2">
                                                            <span className={`bg-${user.estadoColor}-100 text-${user.estadoColor}-700 text-xs px-2 py-1 rounded`}>
                                                                {user.estadoLabel}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            <button
                                                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700"
                                                                onClick={e => {
                                                                    e.stopPropagation();
                                                                    window.location.href = `/editar-usuario?id=${user.id}`;
                                                                }}
                                                            >
                                                                Editar
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {/* Controles de paginación */}
                                        <div className="flex justify-center items-center gap-2 mt-4">
                                            <button
                                                className="px-3 py-1 bg-gray-300 text-gray-700 rounded shadow hover:bg-gray-400"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage === 1}
                                            >
                                                Anterior
                                            </button>
                                            <span className="font-semibold">Página {currentPage} de {totalPages}</span>
                                            <button
                                                className="px-3 py-1 bg-gray-300 text-gray-700 rounded shadow hover:bg-gray-400"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                            >
                                                Siguiente
                                            </button>
                                        </div>
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
