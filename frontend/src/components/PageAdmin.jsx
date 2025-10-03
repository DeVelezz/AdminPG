import React, {useState, useEffect, useCallback} from "react";
import Swal from "sweetalert2";
import SectionHeader from "./SectionHeader"
import Logo  from "./Logo";
import BotonSecundary from "./BotonSecundary";
import ImgFondo from "./ImgFondo";
import SectionFooter from "./SectionFooter";
import ModalCrearCobro from "./ModalCrearCobro";
import { FaPhone } from "react-icons/fa";
import { SiGmail, SiWhatsapp } from "react-icons/si";
import { getBadgeColors, getRowBackgroundColor, formatCurrency } from '../utils/estadoUtils';
import { getToken, isAdmin, clearSession } from '../utils/sessionManager';

// Los datos ahora provienen de la API (base de datos)

export default function PageAdmin() {
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState(null); // {id,nombre,email,telefono,torre,apartamento,genero,password}
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModalCobro, setShowModalCobro] = useState(false);
    const [showContactMenu, setShowContactMenu] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    
    // Verificar que el usuario sea administrador
    useEffect(() => {
        if (!isAdmin()) {
            Swal.fire({
                icon: 'error',
                title: 'Acceso denegado',
                html: 'Esta página es solo para administradores.<br><br><small>Cada pestaña mantiene su propia sesión. Si necesitas cambiar de rol, abre una nueva pestaña.</small>',
                confirmButtonColor: '#ef4444'
            }).then(() => {
                clearSession();
                window.location.href = '/login';
            });
        }
    }, []);
    
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
            const token = getToken();
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
                    id: u.residente_id || u.propiedad_id || u.id, // ✅ Usar residente_id como ID principal
                    usuario_id: u.id, // ID del usuario (tabla usuarios)
                    nombre: u.nombre || '',
                    email: u.email || '',
                    torre: u.torre || '',
                    apartamento: u.apartamento || '',
                    telefono: u.telefono || '',
                    genero: u.genero || 'masculino', // ✅ Agregar genero
                    estado: u.estado || 'Al dia',
                    deudaTotal: typeof u.deudaTotal === 'number' ? u.deudaTotal : parseFloat(u.deudaTotal || 0),
                    ultimoVencimiento: u.ultimoVencimiento || null,
                    propiedad_id: u.propiedad_id || null,
                    residente_id: u.residente_id || u.propiedad_id || null // ✅ ID real de la tabla residentes
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

    // Nota: la selección por clic en la fila fue reemplazada por checkboxes.
    
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
                const token = getToken();
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

                for (const id of selectedUsers) {
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
                    id: u.usuario_id || u.id, // ✅ Usar usuario_id para editar en la tabla usuarios
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
            const token = getToken();
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
        if (!editForm.nombre || editForm.nombre.trim().length < 3) return false; // ✅ Validar nombre
        if (!editForm.email || !emailRegex.test(editForm.email)) return false;
        if (!editForm.telefono || String(editForm.telefono).trim().length < 6) return false;
        return true;
    };

    const saveEditedUser = async () => {
        if (!editForm || !editForm.id) return;
        
        // ✅ Validar formulario antes de enviar
        if (!validateEditForm()) {
            Swal.fire({ 
                icon: 'warning', 
                title: 'Datos incompletos', 
                text: 'Por favor completa todos los campos correctamente.' 
            });
            return;
        }
        
        try {
            const token = getToken();
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const payload = {
                nombre: editForm.nombre.trim(),
                email: editForm.email.trim(),
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
            
            // Notificar a otras pestañas que se ha actualizado un usuario
            localStorage.setItem('userUpdated', JSON.stringify({
                userId: editForm.id,
                timestamp: Date.now()
            }));
            
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

    // Funciones para manejar el menú de contacto
    const handleContactar = (nombre, telefono, email, accion) => {
        switch(accion) {
            case 'llamar':
                window.open(`tel:${telefono}`);
                break;
            case 'email':
                window.open(`mailto:${email}?subject=Recordatorio de pago pendiente&body=Estimado/a ${nombre},%0A%0ATiene un pago pendiente. Por favor póngase al día con sus cuotas.%0A%0ASaludos,%0AAdministración`);
                break;
            case 'whatsapp': {
                const mensaje = encodeURIComponent(`Hola ${nombre}, te contactamos desde AdminPG.`);
                window.open(`https://wa.me/57${telefono.replace(/[^0-9]/g, '')}?text=${mensaje}`, '_blank');
                break;
            }
        }
        setShowContactMenu(null);
    };

    const handleShowMenu = (menuId, event) => {
        event.stopPropagation();
        const rect = event.target.getBoundingClientRect();
        setMenuPosition({
            x: rect.left + (rect.width / 2) - 60,
            y: rect.top + (rect.height / 2) - 60
        });
        setShowContactMenu(showContactMenu === menuId ? null : menuId);
    };

    const ContactMenu = ({ user }) => (
        <div 
            className="fixed bg-white border border-gray-300 rounded shadow-lg p-2 z-50" 
            style={{ 
                left: menuPosition.x, 
                top: menuPosition.y 
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <button
                className="flex items-center w-full text-left px-3 py-2 hover:bg-gray-300 rounded text-sm"
                onClick={() => handleContactar(user.nombre, user.telefono, user.email, 'llamar')}
            >
                <FaPhone className="mr-2 text-blue-600" />
                Llamar
            </button>
            <button
                className="flex items-center w-full text-left px-3 py-2 hover:bg-gray-300 rounded text-sm"
                onClick={() => handleContactar(user.nombre, user.telefono, user.email, 'email')}
            >
                <SiGmail className="mr-2 text-red-500" />
                Gmail
            </button>
            <button
                className="flex items-center w-full text-left px-3 py-2 hover:bg-gray-300 rounded text-sm"
                onClick={() => handleContactar(user.nombre, user.telefono, user.email, 'whatsapp')}
            >
                <SiWhatsapp className="mr-2 text-green-500" />
                WhatsApp
            </button>
        </div>
    );

    return (
        <div className="w-full flex flex-col min-h-screen relative" onClick={() => setShowContactMenu(null)}>
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
                                textoBtn="Enviar notificación" 
                                onClick={async () => {
                                    if (selectedUsers.length === 0) {
                                        Swal.fire({
                                            icon: 'warning',
                                            title: 'Ningún usuario seleccionado',
                                            text: 'Selecciona al menos un usuario para enviar notificación',
                                            confirmButtonColor: '#3b82f6'
                                        });
                                        return;
                                    }
                                    
                                    const usuariosSeleccionados = users.filter(u => selectedUsers.includes(u.id));
                                    const nombresUsuarios = usuariosSeleccionados.map(u => u.nombre).join(', ');
                                    
                                    const { value: mensaje } = await Swal.fire({
                                        title: 'Enviar notificación',
                                        html: `
                                            <p class="mb-3">Enviar notificación a:</p>
                                            <div class="max-h-32 overflow-y-auto bg-gray-100 p-2 rounded mb-3">
                                                <p class="text-sm"><strong>${usuariosSeleccionados.length}</strong> usuario(s) seleccionado(s):</p>
                                                <p class="text-xs text-gray-600">${nombresUsuarios}</p>
                                            </div>
                                        `,
                                        input: 'textarea',
                                        inputLabel: 'Mensaje',
                                        inputPlaceholder: 'Escribe el mensaje a enviar...',
                                        inputAttributes: {
                                            'aria-label': 'Mensaje de notificación'
                                        },
                                        showCancelButton: true,
                                        confirmButtonText: 'Enviar a todos',
                                        cancelButtonText: 'Cancelar',
                                        confirmButtonColor: '#3b82f6',
                                        inputValidator: (value) => {
                                            if (!value) {
                                                return 'Debes escribir un mensaje';
                                            }
                                        }
                                    });
                                    
                                    if (mensaje) {
                                        // Aquí iría la lógica para enviar la notificación masiva
                                        Swal.fire({
                                            icon: 'success',
                                            title: 'Notificaciones enviadas',
                                            text: `Se enviaron ${usuariosSeleccionados.length} notificación(es) exitosamente`,
                                            timer: 2000,
                                            showConfirmButton: false
                                        });
                                        console.log('Notificación enviada a:', usuariosSeleccionados.map(u => u.email), 'Mensaje:', mensaje);
                                    }
                                }} 
                            />
                            <BotonSecundary 
                                textoBtn="Editar admin" 
                                onClick={() => window.location.href = "/actualizar"} 
                            />
                        </div>
                    </div>

                    <div className="shadow-lg mt-6">
                        <div className="bg-white shadow-lg rounded">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 py-3 gap-3">
                                <span className="font-bold text-lg text-gray-800">
                                    Información de los residentes ({filteredUsers.length})
                                </span>
                                <div className="flex gap-2">
                                    <button 
                                        className="px-3 py-1 bg-purple-600 text-white text-sm rounded shadow hover:bg-purple-700 transition-colors"
                                        onClick={() => {
                                            if (selectedUsers.length === 0) {
                                                Swal.fire({
                                                    icon: 'warning',
                                                    title: 'Ningún usuario seleccionado',
                                                    text: 'Selecciona al menos un usuario para generar reporte',
                                                    confirmButtonColor: '#3b82f6'
                                                });
                                                return;
                                            }
                                            
                                            const usuariosSeleccionados = users.filter(u => selectedUsers.includes(u.id));
                                            
                                            // Generar HTML con tabla de usuarios seleccionados
                                            const tablaHTML = `
                                                <div class="text-left max-h-96 overflow-y-auto">
                                                    <p class="mb-3 text-center"><strong>${usuariosSeleccionados.length}</strong> usuario(s) seleccionado(s)</p>
                                                    <table class="w-full text-sm">
                                                        <thead class="bg-gray-100">
                                                            <tr>
                                                                <th class="p-2 text-left">Nombre</th>
                                                                <th class="p-2 text-left">Torre/Apto</th>
                                                                <th class="p-2 text-left">Deuda</th>
                                                                <th class="p-2 text-left">Estado</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            ${usuariosSeleccionados.map(u => `
                                                                <tr class="border-t">
                                                                    <td class="p-2">${u.nombre}</td>
                                                                    <td class="p-2">${u.torre}-${u.apartamento}</td>
                                                                    <td class="p-2">${formatCurrency(u.deudaTotal)}</td>
                                                                    <td class="p-2">${u.estado}</td>
                                                                </tr>
                                                            `).join('')}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            `;
                                            
                                            Swal.fire({
                                                title: 'Generar reporte en Excel',
                                                html: tablaHTML,
                                                showCancelButton: true,
                                                confirmButtonText: 'Descargar Excel',
                                                cancelButtonText: 'Cerrar',
                                                confirmButtonColor: '#3b82f6',
                                                width: '800px'
                                            }).then((result) => {
                                                if (result.isConfirmed) {
                                                    Swal.fire({
                                                        icon: 'info',
                                                        title: 'Descarga de Excel',
                                                        text: 'La función de descarga de Excel estará disponible próximamente',
                                                        timer: 2000
                                                    });
                                                }
                                            });
                                        }}
                                    >
                                        Reporte en Excel
                                    </button>
                                    <button 
                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded shadow hover:bg-red-700 transition-colors"
                                        onClick={handleDeleteSelected}
                                    >
                                        Eliminar seleccionados ({selectedUsers.length})
                                    </button>
                                </div>
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
                                                        <th className="px-4 py-2 text-left">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedUsers.length > 0 && selectedUsers.length === filteredUsers.length}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setSelectedUsers(filteredUsers.map(u => u.id));
                                                                    } else {
                                                                        setSelectedUsers([]);
                                                                    }
                                                                }}
                                                            />
                                                        </th>
                                                        <th className="px-4 py-2 text-left">Nombre Completo</th>
                                                        <th className="px-4 py-2 text-left hidden md:table-cell">Email</th>
                                                        <th className="px-4 py-2 text-left">Deuda</th>
                                                        <th className="px-4 py-2 text-left">Últ. vencimiento</th>
                                                        <th className="px-4 py-2 text-left">Torre</th>
                                                        <th className="px-4 py-2 text-left">Apartamento</th>
                                                        <th className="px-4 py-2 text-left">Estado</th>
                                                        <th className="px-4 py-2 text-center">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {currentUsers.length === 0 ? (
                                                        <tr>
                                                            <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                                                                {filteredUsers.length === 0 ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
                                                            </td>
                                                        </tr>
                                                    ) : currentUsers.map((user) => (
                                                        <tr 
                                                            key={`${user.id}-${user.nombre}`}
                                                            className={` hover:bg-blue-50 cursor-pointer transition-colors ${selectedUsers.includes(user.id) ? 'bg-blue-200' : getRowBackgroundColor(user.estado)}`}
                                                            onClick={() => {
                                                                // Navegar a la vista del residente pasando los datos por query string
                                                                const residenteData = {
                                                                    ...user,
                                                                    estado: user.estado || 'Al dia'
                                                                };
                                                                const data = encodeURIComponent(JSON.stringify(residenteData));
                                                                window.location.href = `/residente?data=${data}&fromAdmin=true`;
                                                            }}
                                                        >
                                                            <td className="px-4 py-2">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={selectedUsers.includes(user.id)}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    onChange={(e) => {
                                                                        if (e.target.checked) {
                                                                            setSelectedUsers(prev => [...prev, user.id]);
                                                                        } else {
                                                                            setSelectedUsers(prev => prev.filter(id => id !== user.id));
                                                                        }
                                                                    }}
                                                                />
                                                            </td>
                                                            <td className="px-4 py-2 font-medium cursor-pointer" onClick={() => {
                                                                // Navegar a la vista del residente pasando los datos por query string
                                                                const data = encodeURIComponent(JSON.stringify(user));
                                                                window.location.href = `/residente?data=${data}&fromAdmin=true`;
                                                            }}>{user.nombre}</td>
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
                                                                <div className="flex flex-row flex-nowrap gap-1 justify-center items-center">
                                                                    {/* Botón Editar */}
                                                                    <button 
                                                                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded shadow hover:bg-blue-700 transition-colors whitespace-nowrap"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleEditUser(user);
                                                                        }}
                                                                        title="Editar usuario"
                                                                    >
                                                                        Editar
                                                                    </button>
                                                                    
                                                                    {/* Botón Contactar */}
                                                                    <button
                                                                        className="px-2 py-1 bg-yellow-300 text-gray-900 text-xs rounded shadow hover:bg-yellow-400 transition-colors font-semibold whitespace-nowrap"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            const telefono = user.telefono || '';
                                                                            const email = user.email || '';
                                                                            
                                                                            if (!telefono && !email) {
                                                                                Swal.fire({
                                                                                    icon: 'warning',
                                                                                    title: 'Sin datos de contacto',
                                                                                    text: `${user.nombre} no tiene teléfono ni email registrado`,
                                                                                    confirmButtonColor: '#3b82f6'
                                                                                });
                                                                                return;
                                                                            }
                                                                            
                                                                            // Mostrar menú de contacto
                                                                            handleShowMenu(`contact-${user.id}`, e);
                                                                        }}
                                                                        title="Contactar residente"
                                                                    >
                                                                        Contactar
                                                                    </button>
                                                                    
                                                                    {/* Menú desplegable de contacto */}
                                                                    {showContactMenu === `contact-${user.id}` && (
                                                                        <ContactMenu user={user} />
                                                                    )}
                                                                    
                                                                    {/* Botón Eliminar */}
                                                                    <button
                                                                        className="px-2 py-1 bg-red-600 text-white text-xs rounded shadow hover:bg-red-700 transition-colors whitespace-nowrap"
                                                                        onClick={async (e) => {
                                                                            e.stopPropagation();
                                                                            const result = await Swal.fire({
                                                                                title: '¿Eliminar usuario?',
                                                                                text: `¿Estás seguro de eliminar a ${user.nombre}?`,
                                                                                icon: 'warning',
                                                                                showCancelButton: true,
                                                                                confirmButtonColor: '#d33',
                                                                                cancelButtonColor: '#3085d6',
                                                                                confirmButtonText: 'Sí, eliminar',
                                                                                cancelButtonText: 'Cancelar'
                                                                            });

                                                                            if (result.isConfirmed) {
                                                                                try {
                                                                                    const token = getToken();
                                                                                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                                                                                    const resp = await fetch(`${API_URL}/usuarios/${user.id}`, {
                                                                                        method: 'DELETE',
                                                                                        headers: {
                                                                                            'Content-Type': 'application/json',
                                                                                            ...(token ? { Authorization: `Bearer ${token}` } : {})
                                                                                        }
                                                                                    });

                                                                                    if (!resp.ok) {
                                                                                        const body = await resp.text().catch(() => '');
                                                                                        throw new Error(body || `Status ${resp.status}`);
                                                                                    }

                                                                                    // If row was selected, remove from selectedUsers
                                                                                    setSelectedUsers(prev => prev.filter(id => id !== user.id));
                                                                                    await loadUsers();
                                                                                    Swal.fire({ icon: 'success', title: 'Eliminado', text: `${user.nombre} eliminado correctamente`, timer: 1800 });
                                                                                } catch (err) {
                                                                                    console.error('Error eliminando usuario individual:', err);
                                                                                    Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo eliminar el usuario. Revisa la consola.' });
                                                                                }
                                                                            }
                                                                        }}
                                                                        title="Eliminar usuario"
                                                                    >
                                                                        Eliminar
                                                                    </button>
                                                                </div>
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
                        <div className="relative z-10 bg-white rounded-lg p-6 w-full max-w-xl shadow-2xl">
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