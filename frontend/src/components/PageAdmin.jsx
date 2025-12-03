import React, {useState, useEffect, useCallback} from "react";
import Swal from "sweetalert2";
import SectionHeader from "./SectionHeader"
import Logo  from "./Logo";
import BotonSecundary from "./BotonSecundary";
import ImgFondo from "./ImgFondo";
import SectionFooter from "./SectionFooter";
import ModalCrearCobro from "./ModalCrearCobro";
import { FaPhone, FaEdit, FaTrash, FaEnvelope, FaFilePdf, FaUserPlus } from "react-icons/fa";
import { SiGmail, SiWhatsapp } from "react-icons/si";
import { MdNotifications } from "react-icons/md";
import { formatCurrency } from '../utils/estadoUtils';
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
                                <span className="font-semibold text-lg text-gray-700">
                                    Información de los residentes ({filteredUsers.length})
                                </span>
                                <div className="flex gap-2">
                                    <button 
                                        className="px-4 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-sm"
                                        onClick={async () => {
                                            if (selectedUsers.length === 0) {
                                                Swal.fire({
                                                    icon: 'warning',
                                                    title: 'Ningún usuario seleccionado',
                                                    text: 'Selecciona al menos un usuario para generar reporte PDF',
                                                    confirmButtonColor: '#3b82f6'
                                                });
                                                return;
                                            }
                                            
                                            const usuariosSeleccionados = users.filter(u => selectedUsers.includes(u.id));
                                            
                                            // Mostrar loading
                                            Swal.fire({
                                                title: 'Generando informe...',
                                                text: 'Cargando historial de pagos',
                                                allowOutsideClick: false,
                                                didOpen: () => {
                                                    Swal.showLoading();
                                                }
                                            });
                                            
                                            // Obtener historial de pagos para cada residente
                                            const token = getToken();
                                            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                                            
                                            const usuariosConHistorial = await Promise.all(
                                                usuariosSeleccionados.map(async (usuario) => {
                                                    try {
                                                        const residenteId = usuario.residente_id || usuario.id;
                                                        
                                                        // Obtener historial y servicios pendientes
                                                        const [resHist, resServ] = await Promise.all([
                                                            fetch(`${API_URL}/pagos/historial/${residenteId}`, {
                                                                headers: {
                                                                    'Authorization': token ? `Bearer ${token}` : '',
                                                                    'Content-Type': 'application/json'
                                                                }
                                                            }),
                                                            fetch(`${API_URL}/servicios/residente/${residenteId}`, {
                                                                headers: {
                                                                    'Authorization': token ? `Bearer ${token}` : '',
                                                                    'Content-Type': 'application/json'
                                                                }
                                                            })
                                                        ]);
                                                        
                                                        const dataHist = resHist.ok ? await resHist.json() : [];
                                                        const dataServ = resServ.ok ? await resServ.json() : [];
                                                        
                                                        const arrHist = Array.isArray(dataHist) ? dataHist : (dataHist.data ?? []);
                                                        const arrServ = Array.isArray(dataServ) ? dataServ : (dataServ.data ?? []);
                                                        
                                                        // Combinar historial y servicios
                                                        const mapa = new Map();
                                                        (arrServ || []).forEach(s => { if (s && s.id !== undefined) mapa.set(String(s.id), s); });
                                                        (arrHist || []).forEach(s => { if (s && s.id !== undefined) mapa.set(String(s.id), s); });
                                                        const servicios = Array.from(mapa.values());
                                                        
                                                        // Ordenar por fecha de vencimiento descendente
                                                        servicios.sort((a, b) => {
                                                            const dateA = new Date(a.fecha_vencimiento || 0);
                                                            const dateB = new Date(b.fecha_vencimiento || 0);
                                                            return dateB - dateA;
                                                        });
                                                        
                                                        return { ...usuario, servicios };
                                                    } catch (error) {
                                                        console.error('Error cargando historial para', usuario.nombre, error);
                                                        return { ...usuario, servicios: [] };
                                                    }
                                                })
                                            );
                                            
                                            Swal.close();
                                            
                                            // Generar HTML para PDF con estilos de impresión
                                            const htmlContent = `
                                                <!DOCTYPE html>
                                                <html>
                                                <head>
                                                    <meta charset="UTF-8">
                                                    <title>Informe de Residentes</title>
                                                    <style>
                                                        @page { margin: 1cm; }
                                                        @media print {
                                                            body { margin: 0; font-family: Arial, sans-serif; font-size: 10pt; }
                                                            .page-break { page-break-before: always; }
                                                            h1 { color: #2563eb; text-align: center; margin: 10px 0 20px; font-size: 24pt; }
                                                            h2 { color: #1e40af; margin: 30px 0 15px; font-size: 14pt; page-break-after: avoid; }
                                                            .info { text-align: center; margin-bottom: 25px; color: #666; font-size: 10pt; }
                                                            .resumen-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 9pt; }
                                                            .resumen-table th { background-color: #2563eb; color: white; padding: 8px; text-align: left; font-size: 9pt; }
                                                            .resumen-table td { padding: 6px 8px; border-bottom: 1px solid #ddd; }
                                                            .resumen-table tr:nth-child(even) { background-color: #f9fafb; }
                                                            .historial-table { width: 100%; border-collapse: collapse; margin: 15px 0 30px; font-size: 8pt; }
                                                            .historial-table th { background-color: #6366f1; color: white; padding: 6px 4px; text-align: left; font-size: 8pt; }
                                                            .historial-table td { padding: 5px 4px; border-bottom: 1px solid #e5e7eb; }
                                                            .historial-table tr:nth-child(even) { background-color: #fafafa; }
                                                            .residente-section { margin-bottom: 40px; page-break-inside: avoid; }
                                                            .residente-header { background-color: #eff6ff; padding: 10px; border-left: 4px solid #2563eb; margin-bottom: 15px; }
                                                            .footer { margin-top: 20px; text-align: center; color: #666; font-size: 8pt; border-top: 1px solid #ddd; padding-top: 10px; }
                                                            .estado-badge { padding: 3px 6px; border-radius: 3px; font-size: 8pt; display: inline-block; font-weight: bold; }
                                                            .al-dia, .pagado { background-color: #dcfce7; color: #166534; }
                                                            .por-vencer { background-color: #fef3c7; color: #92400e; }
                                                            .en-mora, .pendiente { background-color: #fee2e2; color: #991b1b; }
                                                            .vencido { background-color: #fecaca; color: #7f1d1d; }
                                                        }
                                                        body { margin: 20px; font-family: Arial, sans-serif; font-size: 11pt; }
                                                        h1 { color: #2563eb; text-align: center; margin-bottom: 20px; }
                                                        h2 { color: #1e40af; margin: 30px 0 15px; }
                                                        .info { text-align: center; margin-bottom: 30px; color: #666; }
                                                        .resumen-table, .historial-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                                                        .resumen-table th, .historial-table th { background-color: #2563eb; color: white; padding: 10px; text-align: left; }
                                                        .historial-table th { background-color: #6366f1; }
                                                        .resumen-table td, .historial-table td { padding: 8px; border-bottom: 1px solid #ddd; }
                                                        .resumen-table tr:nth-child(even), .historial-table tr:nth-child(even) { background-color: #f9fafb; }
                                                        .residente-section { margin-bottom: 50px; }
                                                        .residente-header { background-color: #eff6ff; padding: 15px; border-left: 5px solid #2563eb; margin-bottom: 20px; }
                                                        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 10pt; border-top: 2px solid #ddd; padding-top: 15px; }
                                                        .estado-badge { padding: 4px 8px; border-radius: 4px; font-size: 10pt; display: inline-block; font-weight: bold; }
                                                        .al-dia, .pagado { background-color: #dcfce7; color: #166534; }
                                                        .por-vencer { background-color: #fef3c7; color: #92400e; }
                                                        .en-mora, .pendiente { background-color: #fee2e2; color: #991b1b; }
                                                        .vencido { background-color: #fecaca; color: #7f1d1d; }
                                                    </style>
                                                </head>
                                                <body>
                                                    <h1>Informe Detallado de Residentes</h1>
                                                    <div class="info">
                                                        <p><strong>Fecha de generación:</strong> ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                                        <p><strong>Total de residentes:</strong> ${usuariosConHistorial.length}</p>
                                                        <p><strong>Deuda total:</strong> ${formatCurrency(usuariosConHistorial.reduce((sum, u) => sum + u.deudaTotal, 0))}</p>
                                                    </div>
                                                    
                                                    <h2>Resumen de Residentes</h2>
                                                    <table class="resumen-table">
                                                        <thead>
                                                            <tr>
                                                                <th>Nombre</th>
                                                                <th>Torre/Apto</th>
                                                                <th>Email</th>
                                                                <th>Teléfono</th>
                                                                <th>Estado</th>
                                                                <th>Deuda</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            ${usuariosConHistorial.map(u => {
                                                                const estadoClass = u.estado.toLowerCase().replace(/\s+/g, '-');
                                                                return `
                                                                    <tr>
                                                                        <td><strong>${u.nombre}</strong></td>
                                                                        <td>${u.torre}-${u.apartamento}</td>
                                                                        <td>${u.email}</td>
                                                                        <td>${u.telefono || 'N/A'}</td>
                                                                        <td><span class="estado-badge ${estadoClass}">${u.estado}</span></td>
                                                                        <td><strong>${formatCurrency(u.deudaTotal)}</strong></td>
                                                                    </tr>
                                                                `;
                                                            }).join('')}
                                                        </tbody>
                                                    </table>
                                                    
                                                    ${usuariosConHistorial.map((usuario, index) => {
                                                        // Determinar si un servicio está pagado usando la misma lógica que PageResidente
                                                        const serviciosPagados = usuario.servicios.filter(s => {
                                                            // Un servicio está pagado si tiene is_paid=true o tiene fecha_pago
                                                            const tieneFechaPago = s.fecha_pago || s.fechaPago;
                                                            return s.is_paid === true || s.pagado === true || Boolean(tieneFechaPago);
                                                        });
                                                        const serviciosPendientes = usuario.servicios.filter(s => {
                                                            const tieneFechaPago = s.fecha_pago || s.fechaPago;
                                                            return s.is_paid !== true && s.pagado !== true && !tieneFechaPago;
                                                        });
                                                        
                                                        return `
                                                            <div class="residente-section ${index > 0 ? 'page-break' : ''}">
                                                                <div class="residente-header">
                                                                    <h2 style="margin: 0; color: #1e40af;">
                                                                        ${usuario.nombre} - Torre ${usuario.torre}, Apto ${usuario.apartamento}
                                                                    </h2>
                                                                    <p style="margin: 5px 0 0; color: #666; font-size: 10pt;">
                                                                        Email: ${usuario.email} | Tel: ${usuario.telefono || 'N/A'} | 
                                                                        Estado: <span class="estado-badge ${usuario.estado.toLowerCase().replace(/\s+/g, '-')}">${usuario.estado}</span>
                                                                    </p>
                                                                </div>
                                                                
                                                                ${serviciosPendientes.length > 0 ? `
                                                                    <h3 style="color: #dc2626; margin: 20px 0 10px;">⚠️ Pagos Pendientes (${serviciosPendientes.length})</h3>
                                                                    <table class="historial-table">
                                                                        <thead>
                                                                            <tr>
                                                                                <th>Concepto</th>
                                                                                <th>ID Cobro</th>
                                                                                <th>Monto</th>
                                                                                <th>Fecha Límite</th>
                                                                                <th>Estado</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            ${serviciosPendientes.map(s => {
                                                                                // Calcular estado real basado en fecha de vencimiento
                                                                                let estadoReal = 'Pendiente';
                                                                                if (s.fecha_vencimiento || s.fechaVencimiento) {
                                                                                    const fechaVenc = s.fecha_vencimiento || s.fechaVencimiento;
                                                                                    const vencimiento = new Date(fechaVenc);
                                                                                    const hoy = new Date();
                                                                                    const vencDate = new Date(vencimiento.getFullYear(), vencimiento.getMonth(), vencimiento.getDate());
                                                                                    const hoyDate = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
                                                                                    const diasRestantes = Math.floor((vencDate - hoyDate) / (1000 * 60 * 60 * 24));
                                                                                    
                                                                                    if (diasRestantes < 0) {
                                                                                        estadoReal = 'En mora';
                                                                                    } else {
                                                                                        estadoReal = 'Por vencer';
                                                                                    }
                                                                                }
                                                                                const estadoClass = estadoReal.toLowerCase().replace(/\s+/g, '-');
                                                                                return `
                                                                                    <tr>
                                                                                        <td><strong>${s.concepto || 'N/A'}</strong></td>
                                                                                        <td>${s.id_cobro || s.id || 'N/A'}</td>
                                                                                        <td><strong>${formatCurrency(s.monto || 0)}</strong></td>
                                                                                        <td>${formatDate(s.fecha_vencimiento || s.fechaVencimiento)}</td>
                                                                                        <td><span class="estado-badge ${estadoClass}">${estadoReal}</span></td>
                                                                                    </tr>
                                                                                `;
                                                                            }).join('')}
                                                                        </tbody>
                                                                    </table>
                                                                ` : '<p style="color: #059669; margin: 20px 0;">✓ No tiene pagos pendientes</p>'}
                                                                
                                                                ${serviciosPagados.length > 0 ? `
                                                                    <h3 style="color: #059669; margin: 20px 0 10px;">✓ Historial de Pagos (${serviciosPagados.length})</h3>
                                                                    <table class="historial-table">
                                                                        <thead>
                                                                            <tr>
                                                                                <th>Concepto</th>
                                                                                <th>ID Cobro</th>
                                                                                <th>Monto</th>
                                                                                <th>Fecha Límite</th>
                                                                                <th>Fecha Pago</th>
                                                                                <th>Método</th>
                                                                                <th>Referencia</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            ${serviciosPagados.map(s => `
                                                                                <tr>
                                                                                    <td>${s.concepto || 'N/A'}</td>
                                                                                    <td>${s.id_cobro || s.id || 'N/A'}</td>
                                                                                    <td>${formatCurrency(s.monto || 0)}</td>
                                                                                    <td>${formatDate(s.fecha_vencimiento)}</td>
                                                                                    <td>${formatDate(s.fecha_pago)}</td>
                                                                                    <td>${s.metodo_pago || '—'}</td>
                                                                                    <td>${s.referencia_pago || '—'}</td>
                                                                                </tr>
                                                                            `).join('')}
                                                                        </tbody>
                                                                    </table>
                                                                ` : '<p style="color: #6b7280; margin: 20px 0;">Sin historial de pagos</p>'}
                                                            </div>
                                                        `;
                                                    }).join('')}
                                                    
                                                    <div class="footer">
                                                        <p><strong>Informe generado por AdminPG</strong> - Sistema de Gestión de Propiedades</p>
                                                        <p>Este documento contiene información confidencial - ${new Date().toLocaleString('es-ES')}</p>
                                                    </div>
                                                </body>
                                                </html>
                                            `;
                                            
                                            // Abrir en nueva ventana para imprimir/guardar como PDF
                                            const printWindow = window.open('', '_blank');
                                            printWindow.document.write(htmlContent);
                                            printWindow.document.close();
                                            
                                            // Dar tiempo para que cargue y luego abrir diálogo de impresión
                                            setTimeout(() => {
                                                printWindow.print();
                                            }, 250);
                                            
                                            Swal.fire({
                                                icon: 'success',
                                                title: 'PDF generado',
                                                text: 'Se abrió una ventana para imprimir o guardar como PDF',
                                                timer: 2000,
                                                showConfirmButton: false
                                            });
                                        }}
                                    >
                                        <FaFilePdf className="w-4 h-4" />
                                        Informe PDF
                                    </button>
                                    <button 
                                        className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm"
                                        onClick={handleDeleteSelected}
                                    >
                                        <FaTrash className="w-3.5 h-3.5" />
                                        Eliminar ({selectedUsers.length})
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-1.5 xxs:p-2 sm:p-3 md:p-4">
                                <div className="flex flex-col sm:flex-row lg:flex-row gap-1.5 xxs:gap-2 sm:gap-3 md:gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="Buscar..."
                                            className="w-full px-1 xxs:px-2 sm:px-3 py-0.5 xxs:py-1.5 sm:py-2 text-[9px] xxs:text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    
                                    <div className="w-full sm:w-40 md:w-48">
                                        <select
                                            className="w-full px-1 xxs:px-2 sm:px-3 py-0.5 xxs:py-1.5 sm:py-2 text-[9px] xxs:text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value)}
                                        >
                                            <option value="todos">Todos los estados</option>
                                            <option value="al dia">Al día</option>
                                            <option value="por vencer">Por vencer</option>
                                            <option value="en mora">En mora</option>
                                        </select>
                                    </div>
                                    
                                    <div className="w-full sm:w-40 md:w-48">
                                        <select
                                            className="w-full px-1.5 xxs:px-2 sm:px-3 py-1 xxs:py-1.5 sm:py-2 text-xxs xxs:text-xs sm:text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                                            <table className="w-full bg-white text-[9px] xxs:text-xs sm:text-sm 2xl:text-base">
                                                <thead className="bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left">
                                                            <input
                                                                type="checkbox"
                                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden md:table-cell">Email</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Deuda</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden sm:table-cell">Vencimiento</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden lg:table-cell">Torre</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 hidden lg:table-cell">Apto</th>
                                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Acciones</th>
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
                                                            className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedUsers.includes(user.id) ? 'bg-blue-50 border-l-4 border-blue-500' : 'border-l-4 border-transparent'}`}
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
                                                            <td className="px-4 py-3 border-b border-gray-100">
                                                                <input
                                                                    type="checkbox"
                                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                                                            <td className="px-4 py-3 border-b border-gray-100 font-medium text-gray-900 cursor-pointer" onClick={() => {
                                                                // Navegar a la vista del residente pasando los datos por query string
                                                                const data = encodeURIComponent(JSON.stringify(user));
                                                                window.location.href = `/residente?data=${data}&fromAdmin=true`;
                                                            }}>{user.nombre}</td>
                                                            <td className="px-4 py-3 border-b border-gray-100 text-gray-600 hidden md:table-cell">{user.email}</td>
                                                            <td className="px-4 py-3 border-b border-gray-100 font-semibold text-gray-900">{formatCurrency(user.deudaTotal)}</td>
                                                            <td className="px-4 py-3 border-b border-gray-100 text-gray-600 text-sm hidden sm:table-cell">{formatDate(user.ultimoVencimiento)}</td>
                                                            <td className="px-4 py-3 border-b border-gray-100 text-gray-700 hidden lg:table-cell">{user.torre}</td>
                                                            <td className="px-4 py-3 border-b border-gray-100 text-gray-700 hidden lg:table-cell">{user.apartamento}</td>
                                                            <td className="px-4 py-3 border-b border-gray-100">
                                                                <span className={`text-xs sm:text-sm 2xl:text-base px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium inline-flex items-center ${
                                                                    user.estado.toLowerCase().includes('mora') || user.estado.toLowerCase().includes('pendiente') 
                                                                        ? 'bg-red-50 text-red-700 border border-red-200' 
                                                                        : user.estado.toLowerCase().includes('vencer') 
                                                                        ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                                                        : 'bg-green-50 text-green-700 border border-green-200'
                                                                }`}>
                                                                    {user.estado}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-3 border-b border-gray-100 text-center">
                                                                <div className="flex flex-row flex-nowrap gap-1.5 justify-center items-center">
                                                                    {/* Botón Editar */}
                                                                    <button 
                                                                        className="p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleEditUser(user);
                                                                        }}
                                                                        title="Editar usuario"
                                                                    >
                                                                        <FaEdit className="w-3.5 h-3.5 sm:w-4 sm:h-4 2xl:w-5 2xl:h-5" />
                                                                    </button>
                                                                    
                                                                    {/* Botón Contactar */}
                                                                    <button
                                                                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
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
                                                                        <FaPhone className="w-4 h-4" />
                                                                    </button>
                                                                    
                                                                    {/* Menú desplegable de contacto */}
                                                                    {showContactMenu === `contact-${user.id}` && (
                                                                        <ContactMenu user={user} />
                                                                    )}
                                                                    
                                                                    {/* Botón Eliminar */}
                                                                    <button
                                                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
                                                                        <FaTrash className="w-4 h-4" />
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
                                <button disabled={!validateEditForm()} className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" onClick={saveEditedUser}>Guardar</button>
                                <button className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors" onClick={() => { setShowEditModal(false); setEditForm(null); }}>Cancelar</button>
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