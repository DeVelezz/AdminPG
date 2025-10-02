import React, {useState, useEffect, useCallback} from "react";
import Swal from "sweetalert2";
import SectionHeader from "./SectionHeader"
import Logo  from "./Logo";
import BotonSecundary from "./BotonSecundary";
import ImgFondo from "./ImgFondo";
import SectionFooter from "./SectionFooter";
import ModalCrearCobro from "./ModalCrearCobro";
import { getBadgeColors, getRowBackgroundColor, formatCurrency } from '../utils/estadoUtils';

// Los datos ahora provienen de la API (base de datos)

export default function PageAdmin() {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState(null); // {id,nombre,email,telefono,torre,apartamento,genero,password}
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModalCobro, setShowModalCobro] = useState(false);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('todos');
    const [filterTower, setFilterTower] = useState('todas');
    
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             user.apartamento.includes(searchTerm);
        
        const matchesStatus = filterStatus === 'todos' || user.estado.toLowerCase() === filterStatus.toLowerCase();
        const matchesTower = filterTower === 'todas' || user.torre === filterTower;
        
        return matchesSearch && matchesStatus && matchesTower;
    });
    
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    
    const uniqueTowers = [...new Set(users.map(user => user.torre))];
    const uniqueTowersFiltered = uniqueTowers.filter(t => t !== null && t !== undefined && String(t).trim() !== '');

    // formatCurrency proviene de ../utils/estadoUtils

    const formatDate = (iso) => {
        if (!iso) return '-';
        try {
            return new Date(iso).toLocaleDateString('es-ES');
        } catch (error) {
            console.warn('formatDate parse error', error);
            return iso;
        }
    };
    
    const loadUsers = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            const res = await fetch(`${API_URL}/usuarios/resumen`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Error al obtener usuarios');
            }

            const json = await res.json();
            let usersFromApi = Array.isArray(json) ? json : (json.data ?? []);

            // Filtrar administradores y cuentas sin propiedad asociada (no son residentes)
            usersFromApi = usersFromApi.filter(u => {
                const role = (u.rol || u.role || '').toString().toLowerCase();
                const propiedad = u.propiedad_id ?? u.propiedadId ?? null;
                if (role === 'admin' || role === 'administrador') return false;
                if (propiedad === null || propiedad === undefined) return false;
                return true;
            });

            const normalized = usersFromApi.map(u => {
                // This endpoint already returns consolidated fields (deudaTotal, estado, ultimoVencimiento)
                return {
                    id: u.id,
                    nombre: u.nombre || '',
                    email: u.email || '',
                    torre: u.torre || '',
                    apartamento: u.apartamento || '',
                    telefono: u.telefono || '',
                    estado: u.estado || 'Al dia',
                    deudaTotal: typeof u.deudaTotal === 'number' ? u.deudaTotal : parseFloat(u.deudaTotal || 0),
                    ultimoVencimiento: u.ultimoVencimiento || null,
                    propiedad_id: u.propiedad_id || null
                };
            });

            setUsers(normalized);
            setLoading(false);
        } catch (error) {
            console.error('Error cargando usuarios', error);
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

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterStatus, filterTower]);

    // Paginación estándar (10 por página). La paginación se mantiene para el filtro 'en mora'.

    const handleCobroCreado = () => {
        loadUsers();
    };

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
                const token = localStorage.getItem('token');
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

                for (const id of selectedUsers) {
                    console.log('[DELETE] Enviando solicitud para id=', id, 'url=', `${API_URL}/usuarios/${id}`);
                    const resp = await fetch(`${API_URL}/usuarios/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            ...(token ? { Authorization: `Bearer ${token}` } : {})
                        }
                    });

                    if (!resp.ok) {
                        let bodyText = '';
                        try {
                            bodyText = await resp.text();
                        } catch (readErr) {
                            console.error('Error leyendo body de respuesta:', readErr);
                        }

                        console.error('[DELETE] Falló para id=', id, 'status=', resp.status, 'body=', bodyText);
                        const userMessage = bodyText ? `Error eliminando usuario ${id}: ${bodyText}` : `Error eliminando usuario ${id} (status ${resp.status})`;
                        await Swal.fire('Error', userMessage, 'error');
                        throw new Error(userMessage);
                    } else {
                        console.log('[DELETE] Éxito para id=', id);
                    }
                }

                await loadUsers();
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
                // Si ya se mostró detalle dentro del loop, no duplicar
                if (!error.message || !error.message.includes('Error eliminando usuario')) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Error al eliminar los usuarios. Revisa la consola para más detalles.',
                        timer: 3000,
                        timerProgressBar: true,
                    });
                }
            }
        }
    };

    // handleEditUser acepta un user object o un userId. Si recibe objeto, abre modal inmediatamente.
    const handleEditUser = async (userOrId) => {
        try {
            // Si nos pasaron directamente el objeto user (desde la lista), lo usamos como fallback inmediato
            if (userOrId && typeof userOrId === 'object') {
                const u = userOrId;
                setEditForm({
                    id: u.id,
                    nombre: u.nombre || '',
                    email: u.email || '',
                    telefono: u.telefono || '',
                    torre: u.torre || '',
                    apartamento: u.apartamento || '',
                    genero: u.genero || 'masculino',
                    password: ''
                });
                setShowEditModal(true);
                return;
            }

            const userId = userOrId;
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const resp = await fetch(`${API_URL}/usuarios/${userId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            });
            if (!resp.ok) throw new Error('No se pudo obtener el usuario');
            const json = await resp.json();
            const u = json.data || json;

            const residente = u.Residente || u.residente || {};

            setEditForm({
                id: u.id,
                nombre: u.nombre || '',
                email: u.email || '',
                telefono: residente.telefono || '',
                torre: residente.torre || '',
                apartamento: residente.apartamento || '',
                genero: residente.genero || 'masculino',
                password: ''
            });
            setShowEditModal(true);
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cargar el usuario para edición.' });
        }
    };

    const handleEditChange = (field, value) => {
        setEditForm(prev => ({ ...(prev || {}), [field]: value }));
    };

    const validateEditForm = () => {
        if (!editForm) return false;
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!editForm.email || !emailRegex.test(editForm.email)) return false;
        if (!editForm.telefono || String(editForm.telefono).trim().length < 6) return false;
        return true;
    };

    const saveEditedUser = async () => {
        if (!editForm || !editForm.id) return;
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const payload = {
                nombre: editForm.nombre,
                email: editForm.email,
                telefono: editForm.telefono,
                torre: editForm.torre,
                apartamento: editForm.apartamento,
                genero: editForm.genero
            };
            if (editForm.password && editForm.password.trim() !== '') {
                payload.password = editForm.password;
            }

            const resp = await fetch(`${API_URL}/usuarios/${editForm.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify(payload)
            });

            if (!resp.ok) {
                const text = await resp.text();
                throw new Error(text || 'Error actualizando usuario');
            }
            await resp.json();

            await loadUsers();
            setShowEditModal(false);
            setEditForm(null);
            Swal.fire({ icon: 'success', title: 'Guardado', text: 'Usuario actualizado correctamente', timer: 1600 });

        } catch (error) {
            console.error('Error guardando usuario:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el usuario.' });
        }
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    return (
        <div className="w-full flex flex-col min-h-screen relative">
            <ImgFondo>
                <img
                    src="/img/imagen.png"
                    alt="Imagen de fondo"
                    className="w-full h-full object-cover brightness-75 absolute inset-0"
                />
            </ImgFondo>

            <SectionHeader>
                <div className="max-w-[1450px] mx-auto flex justify-between items-center w-full px-4">
                    <Logo />
                    <BotonSecundary textoBtn="Cerrar sesión" onClick={() => window.location.href = "/login"} />
                </div>
            </SectionHeader>

            <main className="h-full relative pb-2.5">
                <div className="relative px- sm:px-5 pt-2 max-w-[1450px] mx-auto h-full">
                    <div className="bg-transparent py-3 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 ">
                        <p className="text-white font-bold text-lg sm:text-xl">¡BIENVENIDO ADMIN!</p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <BotonSecundary 
                                textoBtn="Crear cobro" 
                                onClick={() => setShowModalCobro(true)} 
                            />
                            <BotonSecundary 
                                textoBtn="Editar perfil" 
                                onClick={() => window.location.href = "/actualizar"} 
                            />
                            <BotonSecundary 
                                textoBtn="Ver en mora" 
                                onClick={() => window.location.href = "/mora"} 
                            />
                        </div>
                    </div>

                    <div className="shadow-lg mt-6">
                        <div className="bg-white shadow-lg rounded">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 py-3 gap-3">
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

                            <div className="bg-gray-50 p-4">
                                <div className="flex flex-col lg:flex-row gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="Buscar por nombre, email o apartamento..."
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    
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
                                    
                                    <div className="sm:w-48">
                                        <select
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={filterTower}
                                            onChange={(e) => setFilterTower(e.target.value)}
                                        >
                                            <option value="todas">Todas las torres</option>
                                            {uniqueTowersFiltered.map(tower => (
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
                                        <div className="overflow-x-auto rounded-lg border-gray-300 border shadow-lg p-2">
                                            <table className="w-full bg-white rounded ">
                                                <thead className="bg-gray-200 text-gray-700">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left">ID Usuario</th>
                                                        <th className="px-4 py-2 text-left">Nombre Completo</th>
                                                        <th className="px-4 py-2 text-left hidden md:table-cell">Email</th>
                                                        <th className="px-4 py-2 text-left">Deuda</th>
                                                        <th className="px-4 py-2 text-left">Últ. vencimiento</th>
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
                                                            className={` cursor-pointer transition-colors hover:bg-blue-50 ${
                                                                selectedUsers.includes(user.id) ? 'bg-blue-200' : getRowBackgroundColor(user.estado)
                                                            }`}
                                                            onClick={() => handleRowClick(user.id)}
                                                        >
                                                            <td className="px-4 py-2">{user.id}</td>
                                                            <td className="px-4 py-2 font-medium">{user.nombre}</td>
                                                            <td className="px-4 py-2 hidden md:table-cell">{user.email}</td>
                                                            <td className="px-4 py-2">{formatCurrency(user.deudaTotal)}</td>
                                                            <td className="px-4 py-2">{formatDate(user.ultimoVencimiento)}</td>
                                                            <td className="px-4 py-2">{user.torre}</td>
                                                            <td className="px-4 py-2">{user.apartamento}</td>
                                                            <td className="px-4 py-2">
                                                                <span className={`text-xs px-2 py-1 rounded w-20 flex justify-center ${getBadgeColors(user.estado)}`}>
                                                                    {user.estado}
                                                                </span>
                                                            </td>
                                                            {/* Opcional: mostrar fecha de vencimiento */}
                                                            {/* <td className="px-4 py-2">{user.ultimoVencimiento ? new Date(user.ultimoVencimiento).toLocaleDateString() : '-'}</td> */}
                                                            <td className="px-4 py-2 text-center">
                                                                <button 
                                                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700 transition-colors"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditUser(user);
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
                    {/* MODAL EDITAR USUARIO */}
                    

                                                            
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
            </main>

                {/* MODAL EDITAR USUARIO (fuera del flujo de tablas) */}
                {showEditModal && editForm && (
                    <div className="fixed inset-0 flex items-center justify-center z-50">
                        <div className="absolute inset-0 bg-cover bg-center brightness-75" style={{ backgroundImage: `url('${new URL('/img/imagen.png', import.meta.url).href}')`, backgroundColor: '#0b1220' }} aria-hidden="true" />
                        <div className="relative z-10 bg-white rounded-lg p-6 w-96 shadow-2xl">
                            <h3 className="text-lg font-semibold mb-4">Editar Usuario</h3>

                            <div className="space-y-3">
                                <label className="text-sm">Nombre</label>
                                <input value={editForm.nombre} onChange={(e) => handleEditChange('nombre', e.target.value)} className="w-full border rounded px-3 py-2" />

                                <label className="text-sm">Email</label>
                                <input value={editForm.email} onChange={(e) => handleEditChange('email', e.target.value)} className="w-full border rounded px-3 py-2" />
                                {!(/^\S+@\S+\.\S+$/.test(editForm.email || '')) && (
                                    <p className="text-sm text-red-600 mt-1">Ingrese un email válido</p>
                                )}

                                <label className="text-sm">Teléfono</label>
                                <input value={editForm.telefono} onChange={(e) => handleEditChange('telefono', e.target.value)} className="w-full border rounded px-3 py-2" />
                                {(!editForm.telefono || String(editForm.telefono).trim().length < 6) && (
                                    <p className="text-sm text-red-600 mt-1">Ingrese un teléfono válido</p>
                                )}

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-sm">Torre</label>
                                        <input value={editForm.torre} onChange={(e) => handleEditChange('torre', e.target.value)} className="w-full border rounded px-3 py-2" />
                                    </div>
                                    <div>
                                        <label className="text-sm">Apartamento</label>
                                        <input value={editForm.apartamento} onChange={(e) => handleEditChange('apartamento', e.target.value)} className="w-full border rounded px-3 py-2" />
                                    </div>
                                </div>

                                <label className="text-sm">Género</label>
                                <select value={editForm.genero} onChange={(e) => handleEditChange('genero', e.target.value)} className="w-full border rounded px-3 py-2">
                                    <option value="masculino">Masculino</option>
                                    <option value="femenino">Femenino</option>
                                </select>

                                <label className="text-sm">Contraseña (dejar en blanco para no cambiar)</label>
                                <input type="password" value={editForm.password} onChange={(e) => handleEditChange('password', e.target.value)} className="w-full border rounded px-3 py-2" />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button disabled={!validateEditForm()} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60" onClick={saveEditedUser}>Guardar</button>
                                <button className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" onClick={() => { setShowEditModal(false); setEditForm(null); }}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                )}

                <ModalCrearCobro 
                    isOpen={showModalCobro}
                    onClose={() => setShowModalCobro(false)}
                    residentes={users}
                    onCobroCreado={handleCobroCreado}
                />
        </div>
    );
}