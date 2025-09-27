import React, { useState, useEffect, useCallback } from "react";
import SectionHeader from "./SectionHeader";
import Logo from "./Logo";
import BotonSecundary from "./BotonSecundary";
import ImgFondo from "./ImgFondo";
import SectionFooter from "./SectionFooter";
import useService from "../services/useService";
import Swal from "sweetalert2";

// Datos de ejemplo (remover cuando conectes con la base de datos)
const mockUsers = [
    {
        id: '001',
        nombre: 'Juan Pérez',
        email: 'juan@email.com',
        torre: 'Torre 1',
        apartamento: '101',
        estado: 'Al dia',
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
    },
        {
        id: '001',
        nombre: 'Juan velez',
        email: 'juan@email.com',
        torre: 'Torre 1',
        apartamento: '101',
        estado: 'Al dia',
        telefono: '3001234567',
        propiedad_id: 1
    },
    {
        id: '002',
        nombre: 'María correa',
        email: 'maria@email.com',
        torre: 'Torre 2',
        apartamento: '205',
        estado: 'En mora',
        telefono: '3009876543',
        propiedad_id: 2
    },
    {
        id: '003',
        nombre: 'Carlos sosa',
        email: 'carlos@email.com',
        torre: 'Torre 1',
        apartamento: '308',
        estado: 'Por vencer',
        telefono: '3005551234',
        propiedad_id: 3
    },
        {
        id: '001',
        nombre: 'Juan mesa',
        email: 'juan@email.com',
        torre: 'Torre 1',
        apartamento: '101',
        estado: 'Al dia',
        telefono: '3001234567',
        propiedad_id: 1
    },
    {
        id: '002',
        nombre: 'María lopez',
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

export default function PageAdmin() {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // ========== FUNCIONES DE COLORES ==========
    
    // Función para obtener los colores del badge según el estado
    const getBadgeColors = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'en mora':
                return "bg-red-600 text-white";
            case 'por vencer':
                return "bg-yellow-400 text-black";
            case 'al dia':
                return "bg-green-600 text-white";
            default:
                return "bg-gray-400 text-white";
        }
    };

    // Función para obtener el color de fondo de la fila según el estado
    const getRowBackgroundColor = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'en mora':
                return 'bg-red-50';
            case 'por vencer':
                return 'bg-yellow-50';
            case 'al dia':
                return 'bg-green-50';
            default:
                return '';
        }
    };

    // Función para obtener el color del borde/subrayado según el estado
    const getBorderColor = (estado) => {
        switch (estado?.toLowerCase()) {
            case 'en mora':
                return 'border-red-600';
            case 'por vencer':
                return 'border-yellow-400';
            case 'al dia':
                return 'border-green-600';
            default:
                return 'border-gray-400';
        }
    };
    
    // Función original mantenida por compatibilidad (ahora usa getBadgeColors)
    const getStatusColor = (estado) => {
        return getBadgeColors(estado);
    };
    
    // Función para cargar usuarios desde la API
    const loadUsers = useCallback(async () => {
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
    }, []);

    // Cargar usuarios al montar el componente
    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

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
                        <div className="justify-between bg-transparent p-3 rounded-lg w-350 flex flex-row items-center mt-8">
                            <p className="text-white font-bold text-xl">¡BIENVENIDO ADMIN!</p>
                            <div className="flex gap-2 justify-between">
                                <BotonSecundary textoBtn="Editar perfil" onClick={() => window.location.href = "/actualizar"} />
                                <BotonSecundary textoBtn="Ver en mora" onClick={() => window.location.href = "/mora"} />
                            </div>
                        </div>

                        {/* TABLA DE RESIDENTES */}
                        <div className="shadow-lg mt-6">
                            <div className="bg-white shadow-lg rounded">
                                <div className="flex justify-between items-center px-4 py-3 border-b">
                                    <span className="font-bold text-xltext-black-600">Información de los residentes</span>
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

                                    {loading ? (
                                        <div className="text-center py-8">
                                            <p className="text-gray-600">Cargando usuarios...</p>
                                        </div>
                                    ) : error ? (
                                        <div className="text-center py-8">
                                            <p className="text-red-600">{error}</p>
                                            <button 
                                                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                onClick={loadUsers}
                                            >
                                                Reintentar
                                            </button>
                                        </div>
                                    ) : (
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
                                                    {users.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                                                No hay usuarios registrados
                                                            </td>
                                                        </tr>
                                                    ) : (
                                                        users.map((user) => (
                                                            <tr 
                                                                key={user.id}
                                                                className={`border-t cursor-pointer transition-colors hover:bg-blue-50 ${
                                                                    selectedUsers.includes(user.id) ? 'bg-blue-200' : getRowBackgroundColor(user.estado)
                                                                }`}
                                                                onClick={() => handleRowClick(user.id)}
                                                            >
                                                                <td className="px-4 py-2">{user.id}</td>
                                                                <td className="px-4 py-2">{user.nombre}</td>
                                                                <td className="px-4 py-2">{user.email}</td>
                                                                <td className="px-4 py-2">{user.torre}</td>
                                                                <td className="px-4 py-2">{user.apartamento}</td>
                                                                <td className="px-4 py-2">
                                                                    <span className={`text-xs px-2 py-1 rounded ${getBadgeColors(user.estado)}`}>
                                                                        {user.estado}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-2 text-center">
                                                                    <button 
                                                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleEditUser(user.id);
                                                                        }}
                                                                    >
                                                                        Editar
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
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