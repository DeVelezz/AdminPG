import React, { useState, useEffect } from "react";
import SectionHeader from "./SectionHeader";
import Logo from "./Logo";
import BotonSecundary from "./BotonSecundary";
import ImgFondo from "./ImgFondo";
import SectionFooter from "./SectionFooter";
import useService from "../services/useService";
import Swal from "sweetalert2";

export default function PageAdmin() {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Datos de ejemplo (remover cuando conectes con la base de datos)
    const mockUsers = [
        {
            id: '001',
            nombre: 'Juan Pérez',
            email: 'juan@email.com',
            torre: 'Torre 1',
            apartamento: '101',
            estado: 'Activo',
            telefono: '3001234567',
            propiedad_id: 1
        },
        {
            id: '002',
            nombre: 'María García',
            email: 'maria@email.com',
            torre: 'Torre 2',
            apartamento: '205',
            estado: 'En mora',
            telefono: '3009876543',
            propiedad_id: 2
        },
        {
            id: '003',
            nombre: 'Carlos López',
            email: 'carlos@email.com',
            torre: 'Torre 1',
            apartamento: '308',
            estado: 'Por vencer',
            telefono: '3005551234',
            propiedad_id: 3
        }
    ];

    // Función para cargar usuarios desde la API
    const loadUsers = async () => {
        try {
            setLoading(true);
            // Cuando tengas la API real, descomenta estas líneas:
            // const data = await useService.getUsers();
            // setUsers(data);
            
            // Por ahora usa datos de ejemplo:
            setTimeout(() => {
                setUsers(mockUsers);
                setLoading(false);
            }, 500);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            setError('Error al cargar los usuarios');
            setLoading(false);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudieron cargar los usuarios',
                timer: 3000,
                timerProgressBar: true,
            });
        }
    };

    // Cargar usuarios al montar el componente
    useEffect(() => {
        loadUsers();
    }, []);

    const handleRowClick = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };
    
    const handleDeleteSelected = async () => {
        if (selectedUsers.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                text: 'No hay usuarios seleccionados',
                timer: 2000,
                timerProgressBar: true,
            });
            return;
        }

        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Eliminar ${selectedUsers.length} usuario(s) seleccionado(s)?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });

        if (result.isConfirmed) {
            try {
                // Cuando tengas la API real, descomenta y modifica:
                // for (const userId of selectedUsers) {
                //     await useService.deleteUser(userId);
                // }
                
                // Por ahora simula la eliminación:
                setUsers(prev => prev.filter(user => !selectedUsers.includes(user.id)));
                setSelectedUsers([]);
                
                Swal.fire({
                    icon: 'success',
                    title: 'Eliminado',
                    text: `${selectedUsers.length} usuario(s) eliminado(s) exitosamente`,
                    timer: 2000,
                    timerProgressBar: true,
                });
            } catch (error) {
                console.error('Error eliminando usuarios:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al eliminar los usuarios',
                    timer: 3000,
                    timerProgressBar: true,
                });
            }
        }
    };

    const handleEditUser = (userId) => {
        // Cuando tengas las rutas de edición, descomenta:
        // window.location.href = `/editar-usuario/${userId}`;
        
        // Por ahora muestra un mensaje:
        Swal.fire({
            icon: 'info',
            title: 'Función en desarrollo',
            text: `Editar usuario ID: ${userId}`,
            timer: 2000,
            timerProgressBar: true,
        });
    };

    const getStatusColor = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'activo':
                return 'bg-green-100 text-green-700';
            case 'en mora':
                return 'bg-red-100 text-red-700';
            case 'por vencer':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-gray-100 text-gray-700';
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
                            <p className="text-black-600 font-bold text-xl mb-4">¡BIENVENID@ ADMIN!</p>
                            <div className="flex gap-2 justify-between">
                                <BotonSecundary textoBtn="Editar perfil" onClick={() => window.location.href = "/actualizar"} />
                                <BotonSecundary textoBtn="ver en mora" onClick={() => window.location.href = "/mora"} />
                            </div>
                        </div>

                        {/* TABLA DE RESIDENTES */}
                        <div className="shadow-lg mt-6">
                            <div className="bg-white shadow-lg rounded">
                                <div className="flex justify-between items-center px-4 py-3 border-b">
                                    <span className="font-semibold text-black-600">Información de los residentes completa(tabla usuarios +tabla residente)</span>
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
