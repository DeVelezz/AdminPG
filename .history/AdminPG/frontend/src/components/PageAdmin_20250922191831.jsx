import React, { useState, useEffect, useCallback } from "react";
import SectionHeader from "./SectionHeader";
import Logo from "./Logo";
import BotonSecundary from "./BotonSecundary";
import ImgFondo from "./ImgFondo";
import SectionFooter from "./SectionFooter";
import useService from "../services/useService";
import Swal from "sweetalert2";

// Datos de ejemplo expandidos
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
        id: '004',
        nombre: 'Juan Vélez',
        email: 'jvelez@email.com',
        torre: 'Torre 1',
        apartamento: '102',
        estado: 'Al dia',
        telefono: '3001234568',
        propiedad_id: 4
    },
    {
        id: '005',
        nombre: 'María Correa',
        email: 'mcorrea@email.com',
        torre: 'Torre 2',
        apartamento: '206',
        estado: 'En mora',
        telefono: '3009876544',
        propiedad_id: 5
    },
    {
        id: '006',
        nombre: 'Carlos Sosa',
        email: 'csosa@email.com',
        torre: 'Torre 1',
        apartamento: '309',
        estado: 'Por vencer',
        telefono: '3005551235',
        propiedad_id: 6
    },
    {
        id: '007',
        nombre: 'Juan Mesa',
        email: 'jmesa@email.com',
        torre: 'Torre 3',
        apartamento: '401',
        estado: 'Al dia',
        telefono: '3001234569',
        propiedad_id: 7
    },
    {
        id: '008',
        nombre: 'María López',
        email: 'mlopez@email.com',
        torre: 'Torre 2',
        apartamento: '207',
        estado: 'En mora',
        telefono: '3009876545',
        propiedad_id: 8
    },
    {
        id: '009',
        nombre: 'Carlos Usuga',
        email: 'cusuga@email.com',
        torre: 'Torre 1',
        apartamento: '310',
        estado: 'En mora',
        telefono: '3005551236',
        propiedad_id: 9
    },
    {
        id: '010',
        nombre: 'Ana Rodríguez',
        email: 'arodriguez@email.com',
        torre: 'Torre 3',
        apartamento: '402',
        estado: 'Al dia',
        telefono: '3001234570',
        propiedad_id: 10
    },
    {
        id: '011',
        nombre: 'Pedro Martínez',
        email: 'pmartinez@email.com',
        torre: 'Torre 2',
        apartamento: '208',
        estado: 'Por vencer',
        telefono: '3009876546',
        propiedad_id: 11
    },
    {
        id: '012',
        nombre: 'Laura Gómez',
        email: 'lgomez@email.com',
        torre: 'Torre 1',
        apartamento: '311',
        estado: 'En mora',
        telefono: '3005551237',
        propiedad_id: 12
    }
];

export default function PageAdmin() {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados para paginación y filtros
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(5); // Usuarios por página
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('todos');
    const [filterTower, setFilterTower] = useState('todas');
    
    // ========== FUNCIONES DE COLORES ==========
    
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
    
    // ========== FUNCIONES DE FILTRADO Y PAGINACIÓN ==========
    
    // Filtrar usuarios según búsqueda y filtros
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.apartamento.includes(searchTerm);
        
        const matchesStatus = filterStatus === 'todos' || user.estado.toLowerCase() === filterStatus.toLowerCase();
        const matchesTower = filterTower === 'todas' || user.torre === filterTower;
        
        return matchesSearch && matchesStatus && matchesTower;
    });
    
    // Calcular índices para paginación
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    
    // Obtener torres únicas para el filtro
    const uniqueTowers = [...new Set(users.map(user => user.torre))];
    
    // ========== FUNCIONES PRINCIPALES ==========
    
    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
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

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    // Reset página cuando cambian los filtros
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterTower]);

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
        Swal.fire({
            icon: 'info',
            title: 'Función en desarrollo',
            text: `Editar usuario ID: ${userId}`,
            timer: 2000,
            timerProgressBar: true,
        });
    };

    // Función para cambiar de página
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Función para ir a la página anterior
    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Función para ir a la página siguiente
    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
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

                    <div className="relative px-4 sm:px-5 pt-24 pb-20">
                        {/* HEADER CON RESPONSIVE */}
                        <div className="bg-transparent p-3 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <p className="text-white font-bold text-lg sm:text-xl mb-4">¡BIENVENIDO ADMIN!</p>
                            <div className="flex flex-col sm:flex-row gap-2 mb-2">
                                <BotonSecundary textoBtn="Editar perfil" onClick={() => window.location.href = "/actualizar"} />
                                <BotonSecundary textoBtn="Ver en mora" onClick={() => window.location.href = "/mora"} />
                            </div>
                        </div>

                        {/* TABLA DE RESIDENTES */}
                        <div className="shadow-lg mt-6">
                            <div className="bg-white shadow-lg rounded">
                                {/* HEADER DE TABLA CON ACCIONES */}
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 py-3 border-b gap-3">
                                    <span className="font-bold text-lg text-gray-800">
                                        Información de los residentes ({filteredUsers.length})
                                    </span>
                                    <button 
                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded shadow hover:bg-red-700 transition-colors"
                                        onClick={handleDeleteSelected}
                                    >
                                        Eliminar seleccionados ({selectedUsers.length})
                                    </button>
                                </div>

                                {/* FILTROS Y BÚSQUEDA */}
                                <div className="bg-gray-50 p-4 border-b">
                                    <div className="flex flex-col lg:flex-row gap-4">
                                        {/* Búsqueda */}
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                placeholder="Buscar por nombre, email o apartamento..."
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>
                                        
                                        {/* Filtro por estado */}
                                        <div className="sm:w-48">
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                            >
                                                <option value="todos">Todos los estados</option>
                                                <option value="al dia">Al día</option>
                                                <option value="por vencer">Por vencer</option>
                                                <option value="en mora">En mora</option>
                                            </select>
                                        </div>
                                        
                                        {/* Filtro por torre */}
                                        <div className="sm:w-48">
                                            <select
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                value={filterTower}
                                                onChange={(e) => setFilterTower(e.target.value)}
                                            >
                                                <option value="todas">Todas las torres</option>
                                                {uniqueTowers.map(tower => (
                                                    <option key={tower} value={tower}>{tower}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-100 p-6 rounded-b min-h-[400px]">
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
                                        <div>
                                            {/* TABLA RESPONSIVE */}
                                            <div className="overflow-x-auto">
                                                <table className="w-full bg-white border rounded shadow">
                                                    <thead className="bg-gray-200 text-gray-700">
                                                        <tr>
                                                            <th className="px-4 py-2 text-left">ID Usuario</th>
                                                            <th className="px-4 py-2 text-left">Nombre Completo</th>
                                                            <th className="px-4 py-2 text-left hidden md:table-cell">Email</th>
                                                            <th className="px-4 py-2 text-left">Torre</th>
                                                            <th className="px-4 py-2 text-left">Apartamento</th>
                                                            <th className="px-4 py-2 text-left">Estado</th>
                                                            <th className="px-4 py-2 text-center">Acción</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {currentUsers.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                                                    {filteredUsers.length === 0 ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                                                                </td>
                                                            </tr>
                                                        ) : currentUsers.map((user) => (
                                                            <tr 
                                                                key={`${user.id}-${user.nombre}`}
                                                                className={`border-t cursor-pointer transition-colors hover:bg-blue-50 ${
                                                                    selectedUsers.includes(user.id) ? 'bg-blue-200' : getRowBackgroundColor(user.estado)
                                                                }`}
                                                                onClick={() => handleRowClick(user.id)}
                                                            >
                                                                <td className="px-4 py-2">{user.id}</td>
                                                                <td className="px-4 py-2 font-medium">{user.nombre}</td>
                                                                <td className="px-4 py-2 hidden md:table-cell">{user.email}</td>
                                                                <td className="px-4 py-2">{user.torre}</td>
                                                                <td className="px-4 py-2">{user.apartamento}</td>
                                                                <td className="px-4 py-2">
                                                                    <span className={`text-xs px-2 py-1 rounded ${getBadgeColors(user.estado)}`}>
                                                                        {user.estado}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-2 text-center">
                                                                    <button 
                                                                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700 transition-colors"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleEditUser(user.id);
                                                                        }}
                                                                    >
                                                                        Editar
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* PAGINACIÓN */}
                                            {totalPages > 1 && (
                                                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                                                    <div className="text-sm text-gray-600">
                                                        Mostrando {indexOfFirstUser + 1} - {Math.min(indexOfLastUser, filteredUsers.length)} de {filteredUsers.length} usuarios
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={goToPrevPage}
                                                            disabled={currentPage === 1}
                                                            className={`px-3 py-2 text-sm rounded border transition-colors ${
                                                                currentPage === 1 
                                                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            Anterior
                                                        </button>
                                                        
                                                        <div className="flex gap-1">
                                                            {Array.from({ length: totalPages }, (_, i) => {
                                                                const pageNumber = i + 1;
                                                                const showPage = totalPages <= 5 || 
                                                                                pageNumber === 1 || 
                                                                                pageNumber === totalPages || 
                                                                                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1);
                                                                
                                                                if (!showPage) {
                                                                    if (pageNumber === currentPage - 2 || pageNumber === currentPage + 2) {
                                                                        return <span key={pageNumber} className="px-3 py-2 text-sm text-gray-500">...</span>;
                                                                    }
                                                                    return null;
                                                                }
                                                                
                                                                return (
                                                                    <button
                                                                        key={pageNumber}
                                                                        onClick={() => paginate(pageNumber)}
                                                                        className={`px-3 py-2 text-sm rounded border transition-colors ${
                                                                            currentPage === pageNumber
                                                                                ? 'bg-blue-600 text-white border-blue-600'
                                                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                                        }`}
                                                                    >
                                                                        {pageNumber}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        
                                                        <button
                                                            onClick={goToNextPage}
                                                            disabled={currentPage === totalPages}
                                                            className={`px-3 py-2 text-sm rounded border transition-colors ${
                                                                currentPage === totalPages 
                                                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                        >
                                                            Siguiente
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
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