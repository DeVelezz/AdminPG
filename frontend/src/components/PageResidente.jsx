import SectionHeader from "./SectionHeader";
import Logo from "./Logo";
import BotonSecundary from "./BotonSecundary";
import ImgFondo from "./ImgFondo";
import SectionFooter from "./SectionFooter";
import React, { useState, useEffect, useCallback } from "react";
import Swal from 'sweetalert2';
import { FaEdit, FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";
import { formatCurrency } from '../utils/estadoUtils';
import { getToken, getUsuario, clearSession } from '../utils/sessionManager';

// (Se eliminó helper de debug escapeHtml y botón 'Ver JSON' en producción)

export default function PageResidente({ residenteData, isFromMora = false }) {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showResidentPaymentModal, setShowResidentPaymentModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [serviciosDB, setServiciosDB] = useState([]);
    const [usuarioLogueado, setUsuarioLogueado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4; // 4 servicios por página para mejor visualización
    
    // Cargar usuario desde sessionStorage/localStorage
    useEffect(() => {
        const usuario = getUsuario();
        if (usuario) {
            setUsuarioLogueado(usuario);
        } else {
            console.error('❌ Error al cargar usuario');
        }
    }, []);

    // Determinar si el usuario logueado es admin (globalmente en este componente)
    const role = (usuarioLogueado?.rol || usuarioLogueado?.role || '').toString().toLowerCase();
    const isAdminGlobal = role === 'admin' || role === 'administrador' || role === 'administrator';
    
    // Función para cargar servicios desde la base de datos (reutilizable)
    const cargarServicios = useCallback(async () => {
        try {
            setLoading(true);
            const token = getToken();
            console.log('🔑 Token encontrado:', token ? 'SÍ (longitud: ' + token.length + ')' : 'NO');
            
            // Si no hay token, redirigir al login
            if (!token) {
                console.error('❌ No se encontró token. Redirigiendo al login...');
                Swal.fire({
                    icon: 'error',
                    title: 'Sesión no válida',
                    text: 'Por favor inicia sesión nuevamente',
                    confirmButtonColor: '#3b82f6'
                }).then(() => {
                    window.location.href = '/login';
                });
                return;
            }

            // Obtener el residente_id correcto
            let residenteId;
            if (residenteData?.residente_id) {
                residenteId = residenteData.residente_id;
            } else if (usuarioLogueado?.residente_id) {
                residenteId = usuarioLogueado.residente_id;
            }

            // Si no encontramos residenteId en props o usuario logueado, intentar leerlo desde la query string
            if (!residenteId) {
                try {
                    const urlParams = new URLSearchParams(window.location.search);
                    // Primero, comprobar parámetros directos ?residente_id= o ?usuario_id=
                    const directResidente = urlParams.get('residente_id') || urlParams.get('residenteId');
                    const directUsuario = urlParams.get('usuario_id') || urlParams.get('usuarioId');
                    if (directResidente) {
                        residenteId = Number(directResidente);
                    } else if (directUsuario) {
                        // usar usuario_id como fallback si no hay residente_id
                        residenteId = Number(directUsuario);
                    } else {
                        // Si no hay parámetros directos, intentar extraer del parámetro 'data' codificado
                        const dataParam = urlParams.get('data');
                        if (dataParam) {
                            const parsed = JSON.parse(decodeURIComponent(dataParam));
                            // aceptar 'id' dentro del objeto serializado (PageMora usa a veces 'id')
                            residenteId = parsed.residente_id || parsed.residenteId || parsed.id || parsed.usuario_id || parsed.usuarioId || null;
                            // Si parsed.id parece ser un usuario id pero no un residente id, intentar resolverlo
                            if (residenteId && parsed.id && !parsed.residente_id) {
                                // parsed.id puede ser usuario id; si es así, consultamos /api/usuarios/:id para obtener residente_id
                                try {
                                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                                    const token = getToken();
                                    const respUser = await fetch(`${API_URL}/usuarios/${parsed.id}`, { headers: { 'Authorization': token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' } });
                                    if (respUser.ok) {
                                        const jsonUser = await respUser.json();
                                        const u = jsonUser.data || jsonUser;
                                        if (u && (u.Residente || u.residente || u.residente_id || u.residenteId)) {
                                            residenteId = u.residente?.id || u.residente_id || u.residenteId || (u.Residente && u.Residente.id) || residenteId;
                                        }
                                    }
                                } catch (errUser) {
                                    if (typeof window !== 'undefined' && window.DEBUG) console.error('Error resolviendo usuario->residente desde PageResidente:', errUser);
                                }
                            }
                        }
                    }
                } catch (err) {
                    // ignore parse errors but capture for debugging
                    if (typeof window !== 'undefined' && window.DEBUG) console.error('Error parseando query params en PageResidente:', err);
                }
            }

            if (!residenteId) {
                // Depuración: mostrar información de la query string y data param para entender por qué no hay id
                try {
                    const rawSearch = window.location.search;
                    const urlParamsDbg = new URLSearchParams(rawSearch);
                    const dataParamDbg = urlParamsDbg.get('data');
                    if (typeof window !== 'undefined' && window.DEBUG) {
                        console.warn('No se encontró residente_id en URL — window.location.search =', rawSearch);
                        console.warn('data param (raw) =', dataParamDbg);
                        if (dataParamDbg) {
                            try { console.warn('data param (parsed) =', JSON.parse(decodeURIComponent(dataParamDbg))); } catch (e) { console.warn('data param parse error', e); }
                        }
                    }
                    // Si no hay residente_id en URL, el sistema usará el del localStorage (comportamiento normal)
                } catch (err) {
                    console.error('Error al depurar query params:', err);
                }

                setLoading(false);
                return;
            }

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            // Determinar si estamos mostrando el historial completo.
            // SIEMPRE cargar historial completo (pagos antiguos + servicios pendientes)
            const shouldLoadHistorial = true;

            let response;
            // definir contenedores en scope externo para evitar referencias a vars block-scoped
            let servicios = [];
            // Pre-declarar URLs para poder usar en debug modal
            let historialUrl = null;
            let serviciosUrl = null;
            
            if (shouldLoadHistorial) {
                // En modo historial pedimos ambos: pagos (historial) y servicios (pendientes)
                historialUrl = `${API_URL}/pagos/historial/${residenteId}`;
                serviciosUrl = `${API_URL}/servicios/residente/${residenteId}`;

                // Ejecutar ambas peticiones en paralelo
                const [resHist, resServ] = await Promise.all([
                    fetch(historialUrl, { headers: { 'Authorization': token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' } }),
                    fetch(serviciosUrl, { headers: { 'Authorization': token ? `Bearer ${token}` : '', 'Content-Type': 'application/json' } })
                ]);

                // Manejo de errores: si ambas fallan, lanzar; si una falla, usar la otra
                if (!resHist.ok && !resServ.ok) {
                    const t1 = await resHist.text().catch(()=>null);
                    const t2 = await resServ.text().catch(()=>null);
                    console.error('❌ Ambas peticiones fallaron:', { t1, t2 });
                    throw new Error(t1 || t2 || 'Error al cargar historial y servicios');
                }

                const dataHist = resHist.ok ? await resHist.json() : [];
                const dataServ = resServ.ok ? await resServ.json() : [];

                console.log('📦 Datos recibidos:', { 
                    historial: Array.isArray(dataHist) ? dataHist.length : 'no array',
                    servicios: Array.isArray(dataServ) ? dataServ.length : 'no array'
                });

                const arrHist = Array.isArray(dataHist) ? dataHist : (dataHist.data ?? []);
                const arrServ = Array.isArray(dataServ) ? dataServ : (dataServ.data ?? []);

                // Combinar y deduplicar por id (preferir datos del historial si hay conflicto)
                const mapa = new Map();
                (arrServ || []).forEach(s => { if (s && s.id !== undefined) mapa.set(String(s.id), s); });
                (arrHist || []).forEach(s => { if (s && s.id !== undefined) mapa.set(String(s.id), s); });
                servicios = Array.from(mapa.values());
            } else {
                serviciosUrl = `${API_URL}/servicios/residente/${residenteId}`;
                if (typeof window !== 'undefined' && window.DEBUG) console.log('ℹ️ Cargando servicios por residente:', residenteId, 'URL:', serviciosUrl);
                response = await fetch(serviciosUrl, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(text || 'Error al cargar servicios');
                }

                const data = await response.json();
                servicios = Array.isArray(data) ? data : (data.data ?? []);
            }
            setServiciosDB(servicios);
        } catch (error) {
            console.error('❌ Error al cargar servicios:', error);
            // Usar Swal para notificaciones consistentes
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al cargar los servicios. Por favor, intente nuevamente.' });
        } finally {
            setLoading(false);
        }
    }, [usuarioLogueado, residenteData]);

    // Llamar cargarServicios cuando cambian usuario o props
    // Llamar cargarServicios al montar y cuando cambien props/usuarioLogueado
    useEffect(() => {
        cargarServicios();
    }, [cargarServicios, usuarioLogueado, residenteData]);
    
    // Resetear página cuando cambien los servicios
    useEffect(() => {
        setCurrentPage(1);
    }, [serviciosDB.length]);
    
    // Escuchar cambios en localStorage para detectar actualizaciones de usuario
    useEffect(() => {
        const handleStorageChange = async (e) => {
            if (e.key === 'userUpdated' && e.newValue) {
                const updateData = JSON.parse(e.newValue);
                const currentUser = getUsuario();
                
                // Si el usuario actualizado es el usuario actual, recargar datos
                if (currentUser && currentUser.id === updateData.userId) {
                    
                    try {
                        // Obtener datos actualizados del usuario desde el servidor
                        const token = getToken();
                        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                        const response = await fetch(`${API_URL}/usuarios/${updateData.userId}`, {
                            headers: {
                                'Content-Type': 'application/json',
                                ...(token ? { Authorization: `Bearer ${token}` } : {})
                            }
                        });
                        
                        if (response.ok) {
                            const data = await response.json();
                            const updatedUser = data.data || data;
                            
                            // Actualizar sessionStorage con los nuevos datos
                            const { saveSession } = await import('../utils/sessionManager');
                            saveSession(token, updatedUser);
                            
                            // Actualizar el estado local
                            setUsuarioLogueado(updatedUser);
                        }
                    } catch (error) {
                        console.error('Error actualizando datos del usuario:', error);
                    }
                    
                    // Recargar servicios
                    cargarServicios();
                    
                    // Mostrar notificación
                    Swal.fire({
                        icon: 'info',
                        title: 'Datos actualizados',
                        text: 'Tu información ha sido actualizada por un administrador',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [cargarServicios]);
    
    // Escuchar cuando se crea un nuevo cobro para recargar servicios
    useEffect(() => {
        // Handler para storage event (otras pestañas)
        const handleCobroCreado = (e) => {
            if (e.key === 'cobroCreado' && e.newValue) {
                console.log('🔔 Nuevo cobro detectado (storage), recargando servicios...');
                setTimeout(() => cargarServicios(), 500); // Pequeño delay para asegurar que la BD se actualizó
            }
        };

        // Handler para custom event (misma pestaña)
        const handleCobroCreatedEvent = () => {
            console.log('🔔 Nuevo cobro detectado (custom event), recargando servicios...');
            setTimeout(() => cargarServicios(), 500); // Pequeño delay para asegurar que la BD se actualizó
        };

        window.addEventListener('storage', handleCobroCreado);
        window.addEventListener('cobroCreado', handleCobroCreatedEvent);
        
        return () => {
            window.removeEventListener('storage', handleCobroCreado);
            window.removeEventListener('cobroCreado', handleCobroCreatedEvent);
        };
    }, [cargarServicios]);
    
    
    const formatearFecha = (fecha) => {
        if (!fecha) return '';
        // Parsear fecha evitando problemas de zona horaria
        // Si la fecha viene como '2025-07-01', tratarla como fecha local, no UTC
        const fechaStr = String(fecha).trim();
        if (fechaStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Formato YYYY-MM-DD: parsear como fecha local
            const [year, month, day] = fechaStr.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric'
            });
        }
        // Para otros formatos, usar el parser estándar
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
        });
    };
    
    const calcularDiasVencimiento = (fechaVencimiento) => {
        if (!fechaVencimiento) return Infinity;
        
        // Parsear fecha de vencimiento evitando problemas de zona horaria
        let vencimiento;
        const fechaStr = String(fechaVencimiento).trim();
        if (fechaStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
            // Formato YYYY-MM-DD: parsear como fecha local
            const [year, month, day] = fechaStr.split('-').map(Number);
            vencimiento = new Date(year, month - 1, day);
        } else {
            vencimiento = new Date(fechaVencimiento);
        }
        
        // Normalizar ambas fechas a medianoche local para evitar errores por zonas horarias/horas
        const vencDate = new Date(vencimiento.getFullYear(), vencimiento.getMonth(), vencimiento.getDate());
        const hoy = new Date();
        const hoyDate = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const msPorDia = 1000 * 60 * 60 * 24;
        const diferencia = Math.floor((vencDate - hoyDate) / msPorDia);
        return diferencia;
    };
    
    const determinarEstado = (fechaVencimiento, fechaPago = null) => {
        if (fechaPago) return "Pagado";
        
        const diasRestantes = calcularDiasVencimiento(fechaVencimiento);
        if (diasRestantes < 0) return "En mora";
        // Cualquier servicio no pagado que aún no venza es "Por vencer"
        return "Por vencer";
    };
    
    // normalizeEstado viene del helper importado para consistencia

    // Colores y formateo provienen de ../utils/estadoUtils
    
    const serviciosProcesados = serviciosDB.map(servicio => {
        // Normalizar campos que pueden venir en snake_case desde el backend
        const fechaGeneracion = servicio.fechaGeneracion ?? servicio.fecha_generacion ?? servicio.createdAt ?? servicio.fecha_creacion;
        const fechaVencimiento = servicio.fechaVencimiento ?? servicio.fecha_vencimiento ?? servicio.fechaVencimiento ?? servicio.fecha_vencimiento;
        const rawFechaPago = servicio.fechaPago ?? servicio.fecha_pago ?? servicio.fechaPago ?? servicio.fecha_pago;
        // Normalizar fechaPago: tratar valores vacíos, '0000-00-00', 'null', 'NULL', '0' como null (no pagado)
        let fechaPago = null;
        if (rawFechaPago !== undefined && rawFechaPago !== null) {
            const s = String(rawFechaPago).trim();
            if (s !== '' && s !== '0000-00-00' && s.toLowerCase() !== 'null' && s !== '0') {
                // Verificar que la fecha sea válida
                const parsed = Date.parse(s);
                if (!isNaN(parsed)) {
                    fechaPago = s;
                } else {
                    // Algunas APIs devuelven objetos fecha; si es un objeto con toString que parsea, usarlo
                    try {
                        const maybeDate = new Date(rawFechaPago);
                        if (!isNaN(maybeDate.getTime())) fechaPago = rawFechaPago;
                    } catch {
                        fechaPago = null;
                    }
                }
            }
        }
    const monto = Number(servicio.monto ?? servicio.amount ?? 0) || 0;
    const numeroFactura = servicio.numeroFactura ?? servicio.numero_factura ?? servicio.numero_factura;
    // Normalizar metodo de pago y referencia para facilitar render
    const metodoPago = servicio.metodo_pago ?? servicio.metodoPago ?? servicio.metodoPago ?? null;
    const referenciaVal = servicio.referencia ?? servicio.referencia ?? servicio.referencia ?? null;

    const diasVencimiento = calcularDiasVencimiento(fechaVencimiento);
    // Determinar si está pagado usando bandera explícita o fechaPago
    const isPaid = Boolean(servicio.is_paid || fechaPago);
    // Estado derivado: Pagado solo si isPaid true, si no, usar cálculo por vencimiento
    const estado = isPaid ? 'Pagado' : determinarEstado(fechaVencimiento, null);
    if (typeof window !== 'undefined' && window.DEBUG) {
    }

        return {
            ...servicio,
            fechaGeneracion,
            fechaVencimiento,
            fechaPago,
            monto,
            numeroFactura,
            metodo_pago: metodoPago,
            metodoPago: metodoPago,
            referencia: referenciaVal,
            estado,
            diasVencimiento,
            isPaid, // ✅ AGREGAR ESTA PROPIEDAD al objeto procesado
            is_paid: isPaid, // También agregamos is_paid por consistencia
            fechaGeneracionFormateada: fechaGeneracion ? formatearFecha(fechaGeneracion) : '',
            fechaVencimientoFormateada: fechaVencimiento ? formatearFecha(fechaVencimiento) : '',
            fechaPagoFormateada: fechaPago ? formatearFecha(fechaPago) : null
        };
    });
    
    // serviciosActuales: los que no están pagados
    const serviciosActuales = serviciosProcesados.filter(s => !(s.is_paid || s.fechaPago || s.fecha_pago));
    console.log('📊 Resumen de servicios:', {
        total: serviciosProcesados.length,
        noPagados: serviciosActuales.length,
        estados: serviciosActuales.map(s => ({ id: s.id, estado: s.estado, dias: s.diasVencimiento }))
    });
    
    // históricos ya se derivan de serviciosProcesados cuando es necesario
    
    // Asegurarse de sumar números (evitar concatenación si monto es string)
    const deudaTotal = serviciosActuales.reduce((total, servicio) => total + (Number(servicio.monto) || 0), 0);
    const diasMora = serviciosActuales.length > 0 
        ? Math.max(...serviciosActuales.map(s => s.diasVencimiento < 0 ? Math.abs(s.diasVencimiento) : 0))
        : 0;
    
    // estadoGeneralResidente se calculará más abajo, después de normalizar 'residente'
    
    const handlePayment = (servicio) => {
        // Solo abrir modal admin si el usuario logueado es admin
        if (isAdminGlobal) {
            setSelectedService(servicio);
            setShowPaymentModal(true);
            return;
        }

        // Si no es admin, abrir modal de residente
        setSelectedService(servicio);
        setShowResidentPaymentModal(true);
    };

    const procesarPagoResidente = async (metodoPago, referencia, notas) => {
        try {
            const token = getToken();
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            
            const response = await fetch(`${API_URL}/pagos/residente`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    servicioId: selectedService.id,
                    metodoPago: metodoPago,
                    referencia: referencia,
                    notas: notas,
                    monto: selectedService.monto
                })
            });
            
            let bodyResp = null;
            if (!response.ok) {
                try { bodyResp = await response.json(); } catch { try { bodyResp = await response.text(); } catch { bodyResp = null; } }
                const msg = bodyResp && bodyResp.error ? bodyResp.error : (typeof bodyResp === 'string' ? bodyResp : 'Error al procesar el pago');
                throw new Error(msg);
            }

            try { bodyResp = await response.json(); } catch { bodyResp = null; }

            // Si el servidor devolvió el servicio actualizado, actualizar el estado local inmediatamente
            if (bodyResp && bodyResp.servicio) {
                const returned = bodyResp.servicio;
                setServiciosDB(prev => (Array.isArray(prev) ? prev.map(s => (String(s.id) === String(returned.id) ? { ...s, ...returned, fecha_pago: returned.fecha_pago ?? returned.fechaPago ?? s.fecha_pago, is_paid: true } : s)) : prev));
            }

            // Recargar servicios desde la API para asegurar consistencia
            await cargarServicios();
            setShowResidentPaymentModal(false);
            setSelectedService(null);
            Swal.fire({ icon: 'success', title: 'Pago procesado', text: `Servicio: ${selectedService.nombre} — Monto: $${selectedService.monto}`, timer: 2500 });
            
        } catch (error) {
            console.error('❌ Error al procesar pago:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al procesar el pago. Por favor, intente nuevamente.' });
        }
    };
    
    const procesarPago = async (metodoPago, fechaPago, notas, montoPago) => {
        if (!selectedService) return;
        
        try {
            const token = getToken();
            const usuario = getUsuario();
            
            // Decodificar el token JWT para ver qué contiene
            let tokenDecoded = null;
            if (token) {
                try {
                    const base64Url = token.split('.')[1];
                    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                    tokenDecoded = JSON.parse(window.atob(base64));
                } catch (e) {
                    console.error('Error decodificando token:', e);
                }
            }
            console.log('  - Rol (sessionStorage):', usuario?.rol || usuario?.role);
            console.log('  - Rol (en token JWT):', tokenDecoded?.rol || tokenDecoded?.role);
            
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            
            const response = await fetch(`${API_URL}/pagos/admin`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    servicioId: selectedService.id,
                    metodoPago: metodoPago,
                    fechaPago: fechaPago,
                    notas: notas,
                    monto: montoPago ? Number(montoPago) : selectedService.monto,
                    residenteId: selectedService.residente_id ?? selectedService.residenteId ?? residente?.residente_id ?? residente?.id ?? null
                })
            });
            
            let bodyResp = null;
                if (!response.ok) {
                try { bodyResp = await response.json(); } catch { try { bodyResp = await response.text(); } catch { bodyResp = null; } }
                const msg = bodyResp && bodyResp.error ? bodyResp.error : (typeof bodyResp === 'string' ? bodyResp : 'Error al registrar el pago');
                Swal.fire({ icon: 'error', title: 'Error', text: msg });
                throw new Error(msg);
            }

            try { bodyResp = await response.json(); } catch { bodyResp = null; }

            // Si el servidor devolvió el servicio actualizado, actualizar el estado local inmediatamente
            if (bodyResp && bodyResp.servicio) {
                const returned = bodyResp.servicio;
                setServiciosDB(prev => (Array.isArray(prev) ? prev.map(s => (String(s.id) === String(returned.id) ? { ...s, ...returned, fecha_pago: returned.fecha_pago ?? returned.fechaPago ?? s.fecha_pago, is_paid: true } : s)) : prev));
            }

            // Recargar servicios desde la API para asegurar consistencia
            await cargarServicios();
            setShowPaymentModal(false);
            setSelectedService(null);
            
            // Mostrar mensaje apropiado según si es pago parcial o completo
            if (bodyResp && bodyResp.pagoParcial) {
                Swal.fire({ 
                    icon: 'success', 
                    title: 'Pago parcial registrado', 
                    html: `<b>Monto pagado:</b> $${bodyResp.montoPagado?.toLocaleString('es-CO')}<br><b>Saldo pendiente:</b> $${bodyResp.saldoPendiente?.toLocaleString('es-CO')}<br><br>Se ha creado un nuevo servicio con el saldo pendiente.`,
                    timer: 4000 
                });
            } else {
                Swal.fire({ icon: 'success', title: 'Pago registrado', text: `Servicio: ${selectedService.nombre} — Monto: $${montoPago ? Number(montoPago) : selectedService.monto}`, timer: 2500 });
            }
            
        } catch (error) {
            console.error('❌ Error al registrar pago:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al registrar el pago. Por favor, intente nuevamente.' });
        }
    };

    // Función para actualizar servicio (editar)
    const actualizarServicio = async (payload) => {
        if (!selectedService) return;
        try {
            const token = getToken();
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

            const response = await fetch(`${API_URL}/servicios/${selectedService.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Error al actualizar servicio');
            }

            // Recargar lista y cerrar modal
            await cargarServicios();
            setShowEditModal(false);
            setSelectedService(null);
            Swal.fire({ icon: 'success', title: 'Actualizado', text: 'Servicio actualizado correctamente', timer: 1800 });

        } catch (error) {
            console.error('Error al actualizar servicio:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo actualizar el servicio. Intente de nuevo.' });
        }
    };
    
    const urlParams = new URLSearchParams(window.location.search);
    const fromMora = urlParams.get('fromMora') === 'true';
    const fromAdmin = urlParams.get('fromAdmin') === 'true';
    const urlData = urlParams.get('data');
    
    const generarSaludo = (nombre, genero) => {
        if (!nombre) return "Bienvenid@";
        const saludo = genero === "femenino" ? "Bienvenida" : "Bienvenido";
        return `${saludo} ${nombre}!`;
    };

    let residente = usuarioLogueado || {};
    let esDesdeMora = fromMora || isFromMora;
    let esDesdeAdmin = fromAdmin;

    if (urlData) {
        try {
            residente = JSON.parse(decodeURIComponent(urlData));
            // Si viene desde admin, no activar modo "desde mora"
            if (fromAdmin) {
                esDesdeAdmin = true;
                esDesdeMora = false;
            } else {
                esDesdeMora = true;
            }
        } catch (error) {
            console.error('Error parsing URL data:', error);
        }
    } else if (residenteData) {
        residente = residenteData;
        esDesdeMora = isFromMora;
    }
    // Si la navegación nos pasó campos con nombres distintos (p.ej. desde PageMora), normalizarlos:
    try {
        if (residente) {
            // diasVencimiento -> diasMora
            if (residente.diasVencimiento !== undefined && (residente.diasMora === undefined || residente.diasMora === null)) {
                residente.diasMora = Number(residente.diasVencimiento) || 0;
            }
            // monto -> totalDeuda
            if ((residente.monto !== undefined) && (residente.totalDeuda === undefined || residente.totalDeuda === null)) {
                residente.totalDeuda = Number(residente.monto) || 0;
            }
            // deudaTotal alias
            if ((residente.deudaTotal !== undefined) && (residente.totalDeuda === undefined || residente.totalDeuda === null)) {
                residente.totalDeuda = Number(residente.deudaTotal) || 0;
            }
            // Si se detectan días vencidos, asegurar que el estado refleje mora
            if ((Number(residente.diasMora) || 0) > 0 && !residente.estado) {
                residente.estado = 'En mora';
            }
        }
    } catch {
        // Silenciar error de normalización
    }
    
    // Actualizar datos calculados del residente
    // Si la información viene en la prop/url (por ejemplo cuando venimos desde Mora o Admin), priorizarla.
    residente = {
        ...residente,
        // Siempre usar los valores calculados actuales basados en serviciosActuales
        diasMora: diasMora,
        totalDeuda: deudaTotal
    };

    // Calcular estado general del residente ahora que 'residente' está definido / normalizado
    const estadoGeneralResidente = (() => {
        // Primero verificar si hay servicios pendientes basándose en serviciosActuales
        // Si no hay servicios actuales (no pagados), está al día
        if (serviciosActuales.length === 0) return "Al día";
        
        // Verificar estados de los servicios no pagados (prioridad: En mora > Por vencer)
        const tieneServiciosEnMora = serviciosActuales.some(s => s.estado === "En mora" || s.diasVencimiento < 0);
        const tieneServiciosPorVencer = serviciosActuales.some(s => s.estado === "Por vencer" || s.diasVencimiento >= 0);
        
        console.log('🎯 Estado general calculado:', {
            serviciosActuales: serviciosActuales.length,
            tieneEnMora: tieneServiciosEnMora,
            tienePorVencer: tieneServiciosPorVencer,
            estados: serviciosActuales.map(s => s.estado)
        });
        
        if (tieneServiciosEnMora) return "En mora";
        if (tieneServiciosPorVencer) return "Por vencer";
        
        // Si llegamos aquí, está al día (no debería pasar si hay serviciosActuales)
        return "Al día";
    })();
    
    const cerrarSesion = () => {
        clearSession();
        window.location.href = "/login";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando información...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <SectionHeader>
                <Logo redirectTo={esDesdeAdmin ? "/admin" : (esDesdeMora ? "/mora" : "/residente")} />
                <BotonSecundary 
                    textoBtn={esDesdeAdmin ? "Volver a Admin" : (esDesdeMora ? "Volver a Mora" : "Cerrar sesión")} 
                    onClick={() => {
                        if (esDesdeAdmin) {
                            window.location.href = "/admin";
                        } else if (esDesdeMora) {
                            window.location.href = "/mora";
                        } else {
                            cerrarSesion();
                        }
                    }} 
                />
            </SectionHeader>

            <main className="flex-1 relative">
                <ImgFondo>
                    <img src="/img/imagen.png" alt="Imagen de fondo" className="w-full h-full object-cover brightness-75 absolute inset-0" />

                    <div className="relative z-10 p-2 sm:p-3 md:p-5">
                        <div className="flex justify-center mb-3 sm:mb-4">
                            <div className="bg-white px-2 xxs:px-3 sm:px-4 md:px-6 py-2 xxs:py-3 md:py-4 rounded-lg shadow-lg w-full max-w-full md:max-w-6xl 2xl:max-w-7xl mx-auto">
                                {esDesdeMora ? (
                                    <div className="flex flex-col gap-2 xxs:gap-3">
                                        {/* Nombre y ubicación */}
                                        <div className="flex flex-col gap-1">
                                            <span className={`font-semibold text-sm xxs:text-base sm:text-lg text-gray-800 border-b-2 xxs:border-b-4 pb-1 w-fit ${
                                                estadoGeneralResidente.toLowerCase().includes('mora') ? 'border-red-500' :
                                                estadoGeneralResidente.toLowerCase().includes('vencer') ? 'border-amber-500' :
                                                'border-green-500'
                                            }`}>
                                                {residente.nombre}
                                            </span>
                                            <span className="text-xs sm:text-sm text-gray-600">Torre {residente.torre} - Apto {residente.apartamento}</span>
                                        </div>
                                        
                                        {/* Contacto */}
                                        <div className="flex flex-col gap-1">
                                            <div className="text-xs sm:text-sm">
                                                <span className="text-gray-600">Tel: </span>
                                                <span className="font-medium">{residente.telefono}</span>
                                            </div>
                                            <div className="text-xs sm:text-sm">
                                                <span className="text-gray-600">Email: </span>
                                                <span className="font-medium break-all">{residente.email}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Badges de estado */}
                                        <div className="flex gap-2 sm:gap-3 items-center flex-wrap">
                                            <span className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium inline-flex items-center ${
                                                estadoGeneralResidente.toLowerCase().includes('mora') || estadoGeneralResidente.toLowerCase().includes('pendiente') 
                                                    ? 'bg-red-50 text-red-700 border border-red-200' 
                                                    : estadoGeneralResidente.toLowerCase().includes('vencer') 
                                                    ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                                                    : 'bg-green-50 text-green-700 border border-green-200'
                                            }`}>{estadoGeneralResidente}</span>
                                            {((residente && Number(residente.diasMora) > 0) || diasMora > 0) && (
                                                <span className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium inline-flex items-center bg-red-50 text-red-700 border border-red-200">
                                                    Mora: { (residente && Number(residente.diasMora) > 0) ? Number(residente.diasMora) : diasMora } días
                                                </span>
                                            )}
                                            <span className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium inline-flex items-center bg-gray-50 text-gray-700 border border-gray-200">
                                                Deuda: {formatCurrency((residente && typeof residente.totalDeuda === 'number') ? residente.totalDeuda : deudaTotal)}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-2 sm:gap-4">
                                        <div className="text-center">
                                            <span className={`font-semibold text-sm xxs:text-base sm:text-xl text-gray-800 border-b-2 xxs:border-b-4 pb-1 inline-block ${
                                                estadoGeneralResidente.toLowerCase().includes('mora') ? 'border-red-500' :
                                                estadoGeneralResidente.toLowerCase().includes('vencer') ? 'border-amber-500' :
                                                'border-green-500'
                                            }`}>
                                                {generarSaludo(residente.nombre, residente.genero)}
                                            </span>
                                        </div>
                                        
                                        {/* Info básica en columna para móvil, fila para desktop */}
                                        <div className="flex flex-col sm:flex-row sm:justify-center gap-2 sm:gap-8 text-center sm:text-left">
                                            <div className="text-xs sm:text-sm">
                                                <span className="text-gray-800 font-medium">Torre {residente.torre} - Apto {residente.apartamento}</span>
                                            </div>
                                            <div className="text-xs sm:text-sm">
                                                <span className="text-gray-600">Tel: </span>
                                                <span className="font-medium">{residente.telefono}</span>
                                            </div>
                                            <div className="text-xs sm:text-sm">
                                                <span className="text-gray-600">Email: </span>
                                                <span className="font-medium break-all">{residente.email}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Badges si hay deuda/mora */}
                                        {((residente && Number(residente.diasMora) > 0) || (residente && typeof residente.totalDeuda === 'number' && residente.totalDeuda > 0) || diasMora > 0 || deudaTotal > 0) && (
                                            <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
                                                {((residente && Number(residente.diasMora) > 0) || diasMora > 0) && (
                                                    <span className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium inline-flex items-center bg-red-50 text-red-700 border border-red-200">
                                                        Mora: { (residente && Number(residente.diasMora) > 0) ? Number(residente.diasMora) : diasMora } días
                                                    </span>
                                                )}
                                                {(((residente && typeof residente.totalDeuda === 'number') ? residente.totalDeuda : deudaTotal) > 0) && (
                                                    <span className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium inline-flex items-center bg-gray-50 text-gray-700 border border-gray-200">
                                                        Deuda: {formatCurrency((residente && typeof residente.totalDeuda === 'number') ? residente.totalDeuda : deudaTotal)}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="shadow-lg mt-4 sm:mt-6 md:mt-8 w-full max-w-full">
                            <div className="bg-white shadow-lg rounded w-full overflow-hidden">
                                <div className="flex justify-between items-center px-2 sm:px-3 md:px-4 py-2 sm:py-3 border-b">
                                    <span className="font-bold text-black text-base sm:text-lg md:text-xl">
                                        {esDesdeMora ? "Historial Completo de Pagos" : "Información de los cobros"}
                                    </span>
                                </div>
                                <div className="bg-gray-100 p-2 sm:p-3 md:p-6 rounded-b">
                                    <h3 className="text-center text-blue-600 font-bold text-base sm:text-lg md:text-xl mb-2 sm:mb-3 md:mb-4">
                                        {esDesdeMora ? "Deudas y Historial de Pagos" : "Tabla con los pagos pendientes"}
                                    </h3>
                                    
                                    {serviciosProcesados.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            No hay servicios registrados
                                        </div>
                                    ) : (
                                        <>
                                        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                                            <table className="w-full bg-white">
                                                <thead className="bg-gray-50 border-b border-gray-200">
                                                    <tr>
                                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Concepto</th>
                                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden lg:table-cell">ID Cobro</th>
                                                        {esDesdeMora && <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden xl:table-cell">Fecha Emisión</th>}
                                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Monto</th>
                                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden md:table-cell">Fecha límite</th>
                                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">Días</th>
                                                        <th className="px-2 sm:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Estado</th>
                                                        {/* Mostrar columnas de pago siempre (para historial y servicios actuales) */}
                                                        <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden lg:table-cell">Fecha Pago</th>
                                                        <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden xl:table-cell">Método</th>
                                                        <th className="px-2 sm:px-4 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden xl:table-cell">Referencia</th>
                                                        <th className="px-2 sm:px-4 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(() => {
                                                        // Calcular paginación
                                                        const indexOfLastItem = currentPage * itemsPerPage;
                                                        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
                                                        const currentItems = serviciosProcesados.slice(indexOfFirstItem, indexOfLastItem);
                                                        
                                                        return currentItems.map((servicio) => {
                                                        // Usar el isPaid ya calculado en el objeto procesado
                                                        const isPaid = servicio.isPaid;
                                                        const estadoParaFondo = isPaid ? 'Pagado' : (servicio.diasVencimiento < 0 ? 'En mora' : servicio.estado);
                                                        
                                                        return (
                                                        <tr key={servicio.id} className={`hover:bg-gray-50 transition-colors border-l-2 xxs:border-l-4 ${
                                                            isPaid ? 'border-green-500' : (servicio.diasVencimiento < 0 ? 'border-red-500' : 'border-amber-500')
                                                        }`}>
                                                            <td className="px-2 sm:px-4 py-2 sm:py-3 border-b border-gray-100 font-medium text-gray-900 text-xs sm:text-sm">{servicio.nombre}</td>
                                                            <td className="px-2 sm:px-4 py-2 sm:py-3 border-b border-gray-100 text-gray-600 text-xs sm:text-sm hidden lg:table-cell">{servicio.numeroFactura}</td>
                                                            {esDesdeMora && <td className="px-2 sm:px-4 py-2 sm:py-3 border-b border-gray-100 text-gray-600 text-xs sm:text-sm hidden xl:table-cell">{servicio.fechaGeneracionFormateada}</td>}
                                                            <td className="px-2 sm:px-4 py-2 sm:py-3 border-b border-gray-100 font-semibold text-gray-900 text-xs sm:text-sm">{formatCurrency(servicio.monto)}</td>
                                                            <td className="px-2 sm:px-4 py-2 sm:py-3 border-b border-gray-100 text-gray-600 text-xs sm:text-sm hidden md:table-cell">{servicio.fechaVencimientoFormateada}</td>
                                                            {(() => {
                                                                // Usar el isPaid ya calculado
                                                                const isPaidCell = servicio.isPaid;
                                                                const dias = servicio.diasVencimiento;
                                                                // Si está pagado: gris; Si en mora (dias < 0): rojo; Si por vencer (dias >= 0): amarillo
                                                                const cls = isPaidCell ? 'text-gray-500' : (dias < 0 ? 'text-red-600' : 'text-amber-600');
                                                                return (
                                                                    <td className={`px-2 sm:px-4 py-2 sm:py-3 border-b border-gray-100 font-semibold text-xs sm:text-sm hidden sm:table-cell ${cls}`}>
                                                                        {isPaidCell ? '—' : (dias < 0 ? `${Math.abs(dias)} días` : `${dias} días`) }
                                                                    </td>
                                                                );
                                                            })()}
                                                            <td className="px-2 sm:px-4 py-2 sm:py-3 border-b border-gray-100">
                                                                {(() => {
                                                                    // Usar el isPaid ya calculado
                                                                    const isPaid = servicio.isPaid;
                                                                    if (isPaid) {
                                                                        return <span className="text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium inline-flex items-center bg-green-50 text-green-700 border border-green-200">Pagado</span>;
                                                                    }
                                                                    // Si no está pagado, determinar estado según días de vencimiento
                                                                    const displayedEstado = servicio.diasVencimiento < 0 ? 'En mora' : servicio.estado;
                                                                    const badgeClass = displayedEstado.toLowerCase().includes('mora') 
                                                                        ? 'bg-red-50 text-red-700 border border-red-200' 
                                                                        : 'bg-amber-50 text-amber-700 border border-amber-200';
                                                                    return <span className={`text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-medium inline-flex items-center ${badgeClass}`}>{displayedEstado}</span>;
                                                                })()}
                                                            </td>

                                                            {/* Columnas de pago: mostrar siempre, con valores o guión si vacío */}
                                                            <td className="px-2 sm:px-4 py-2 sm:py-3 border-b border-gray-100 text-gray-600 text-xs sm:text-sm hidden lg:table-cell">{servicio.fechaPagoFormateada || servicio.fecha_pago || servicio.fechaPago || '—'}</td>
                                                            <td className="px-2 sm:px-4 py-2 sm:py-3 border-b border-gray-100 text-gray-600 text-xs sm:text-sm hidden xl:table-cell">{servicio.metodo_pago || servicio.metodoPago || '—'}</td>
                                                            <td className="px-2 sm:px-4 py-2 sm:py-3 border-b border-gray-100 text-gray-600 text-xs sm:text-sm hidden xl:table-cell">{servicio.referencia || '—'}</td>

                                                            <td className="px-2 sm:px-4 py-2 sm:py-3 border-b border-gray-100 text-center">
                                                                <div className="flex items-center justify-center gap-1 sm:gap-2">
                                                                                        {(() => {
                                                                                            // Usar el isPaid ya calculado en el objeto procesado
                                                                                            const isPaid = servicio.isPaid;
                                                                                            const isOverdue = servicio.diasVencimiento < 0;
                                                                                            const isPorVencer = !isPaid && servicio.diasVencimiento >= 0;

                                                                                            // Si ya está pagado, mostrar icono
                                                                                            if (isPaid) return <span className="text-sm text-green-600 font-medium flex items-center gap-1"><FaCheckCircle className="w-4 h-4" /> Pagado</span>;

                                                                                            // ADMIN: Puede registrar pago para cualquier servicio no pagado (abre modal)
                                                                                            if (!isPaid && isAdminGlobal) {
                                                                                                return (
                                                                                                    <button 
                                                                                                        className="px-4 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-800 transition-colors shadow-sm" 
                                                                                                        onClick={() => handlePayment(servicio)}
                                                                                                    >
                                                                                                        {esDesdeMora || esDesdeAdmin ? 'Registrar pago' : 'Pagar'}
                                                                                                    </button>
                                                                                                );
                                                                                            }

                                                                                            // RESIDENTE: Puede pagar servicios en mora o por vencer (botón sin acción por ahora)
                                                                                            if (!isPaid && !isAdminGlobal && (isOverdue || isPorVencer)) {
                                                                                                return (
                                                                                                    <button 
                                                                                                        className="px-3 py-1 bg-green-600 text-white text-sm rounded shadow hover:bg-green-700" 
                                                                                                        onClick={() => {
                                                                                                            // TODO: Integrar con pasarela de pagos
                                                                                                            Swal.fire({
                                                                                                                icon: 'info',
                                                                                                                title: 'Próximamente',
                                                                                                                text: 'La pasarela de pagos estará disponible pronto',
                                                                                                                confirmButtonColor: '#16a34a'
                                                                                                            });
                                                                                                        }}
                                                                                                    >
                                                                                                        Pagar
                                                                                                    </button>
                                                                                                );
                                                                                            }

                                                                                            // Si es residente (no admin) y el servicio no está en mora, no mostrar botón
                                                                                            if (!isAdminGlobal && !isOverdue) {
                                                                                                return <span className="text-sm text-gray-600">—</span>;
                                                                                            }

                                                                                            // Fallback: no debería llegar aquí, pero por si acaso
                                                                                            return <span className="text-sm text-gray-600">—</span>;
                                                                                        })()}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        );
                                                        });
                                                    })()}
                                                </tbody>
                                            </table>
                                        </div>
                                        
                                        {/* Controles de Paginación */}
                                        {serviciosProcesados.length > itemsPerPage && (
                                            <div className="flex flex-col sm:flex-row justify-between items-center mt-2 sm:mt-4 px-2 sm:px-4 gap-2 sm:gap-3">
                                                <div className="text-xs sm:text-sm text-gray-600 text-center">
                                                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, serviciosProcesados.length)} de {serviciosProcesados.length} servicios
                                                </div>
                                                <div className="flex flex-wrap gap-1 sm:gap-2 justify-center">
                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                        disabled={currentPage === 1}
                                                        className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                                            currentPage === 1
                                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                : 'bg-slate-700 text-white hover:bg-slate-800'
                                                        }`}
                                                    >
                                                        Anterior
                                                    </button>
                                                    <div className="flex items-center gap-2">
                                                        {(() => {
                                                            const totalPages = Math.ceil(serviciosProcesados.length / itemsPerPage);
                                                            const pages = [];
                                                            for (let i = 1; i <= totalPages; i++) {
                                                                pages.push(
                                                                    <button
                                                                        key={i}
                                                                        onClick={() => setCurrentPage(i)}
                                                                        className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                                                            currentPage === i
                                                                                ? 'bg-slate-700 text-white'
                                                                                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                                                                        }`}
                                                                    >
                                                                        {i}
                                                                    </button>
                                                                );
                                                            }
                                                            return pages;
                                                        })()}
                                                    </div>
                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(serviciosProcesados.length / itemsPerPage)))}
                                                        disabled={currentPage === Math.ceil(serviciosProcesados.length / itemsPerPage)}
                                                        className={`px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                                            currentPage === Math.ceil(serviciosProcesados.length / itemsPerPage)
                                                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                                                : 'bg-slate-700 text-white hover:bg-slate-800'
                                                        }`}
                                                    >
                                                        Siguiente
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </ImgFondo>
            </main>
           
            
            {/* MODAL ADMIN */}
            {showPaymentModal && selectedService && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-cover bg-center brightness-75" style={{ backgroundImage: `url('${new URL('/img/imagen.png', import.meta.url).href}')`, backgroundColor: '#0b1220' }} aria-hidden="true" />
                    <div className="relative z-10 bg-white rounded-lg p-6 w-96 shadow-2xl">
                        <h3 className="text-lg font-semibold mb-4">Registrar Pago</h3>
                        <div className="mb-4 p-3 bg-gray-100 rounded">
                            <p><strong>Servicio:</strong> {selectedService.nombre}</p>
                            <p><strong>Monto:</strong> {formatCurrency(selectedService.monto)}</p>
                        </div>
                        <div className="space-y-4">
                            <select id="metodoPago" className="w-full border rounded px-3 py-2">
                                <option value="efectivo">Efectivo</option>
                                <option value="transferencia">Transferencia</option>
                            </select>
                            <input id="fechaPago" type="date" className="w-full border rounded px-3 py-2" defaultValue={new Date().toISOString().split('T')[0]} />
                            <input id="montoPagoAdmin" type="number" step="0.01" className="w-full border rounded px-3 py-2" defaultValue={selectedService?.monto ?? ''} />
                            <textarea id="notasPago" className="w-full border rounded px-3 py-2 h-20" placeholder="Notas..."/>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" 
                                onClick={() => {
                                    const metodo = document.getElementById('metodoPago').value;
                                    const valid = ['efectivo','transferencia'];
                                    if (!valid.includes(metodo)) { Swal.fire({ icon: 'error', title: 'Método no permitido', text: 'Solo transferencia o efectivo están permitidos desde admin.'}); return; }
                                    procesarPago(metodo, document.getElementById('fechaPago').value, document.getElementById('notasPago').value, document.getElementById('montoPagoAdmin').value);
                                }}>
                                Registrar
                            </button>
                            <button className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" onClick={() => {setShowPaymentModal(false); setSelectedService(null);}}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL RESIDENTE */}
            {showResidentPaymentModal && selectedService && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-cover bg-center brightness-75" style={{ backgroundImage: `url('${new URL('/img/imagen.png', import.meta.url).href}')`, backgroundColor: '#0b1220' }} aria-hidden="true" />
                    <div className="relative z-10 bg-white rounded-lg p-6 w-96 shadow-2xl">
                        <h3 className="text-lg font-semibold mb-4">Realizar Pago</h3>
                        <div className="mb-4 p-3 bg-gray-100 rounded">
                            <p><strong>Servicio:</strong> {selectedService.nombre}</p>
                            <p><strong>Monto:</strong> <span className="text-green-600 font-bold">{formatCurrency(selectedService.monto)}</span></p>
                        </div>
                        <div className="space-y-4">
                            <select id="metodoPagoR" className="w-full border rounded px-3 py-2">
                                <option value="tarjeta">Tarjeta</option>
                                <option value="pse">PSE</option>
                                <option value="nequi">Nequi</option>
                            </select>
                            <input id="referenciaR" type="text" className="w-full border rounded px-3 py-2" placeholder="Referencia" />
                            <textarea id="notasR" className="w-full border rounded px-3 py-2 h-16" placeholder="Notas..."/>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" 
                                onClick={() => {
                                    const ref = document.getElementById('referenciaR').value;
                                    if (!ref.trim()) { alert('Ingrese referencia'); return; }
                                    procesarPagoResidente(document.getElementById('metodoPagoR').value, ref, document.getElementById('notasR').value);
                                }}>
                                Confirmar
                            </button>
                            <button className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" onClick={() => {setShowResidentPaymentModal(false); setSelectedService(null);}}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL EDITAR SERVICIO */}
            {showEditModal && selectedService && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0 bg-cover bg-center brightness-75" style={{ backgroundImage: `url('${new URL('/img/imagen.png', import.meta.url).href}')`, backgroundColor: '#0b1220' }} aria-hidden="true" />
                    <div className="relative z-10 bg-white rounded-lg p-6 w-96 shadow-2xl">
                        <h3 className="text-lg font-semibold mb-4">Editar Cobro</h3>
                        <div className="mb-4 p-3 bg-gray-100 rounded">
                            <p><strong>ID:</strong> {selectedService.id}</p>
                        </div>
                        <div className="space-y-3">
                            <label className="text-sm">Nombre</label>
                            <input id="editNombre" defaultValue={selectedService.nombre} className="w-full border rounded px-3 py-2" />

                            <label className="text-sm">Monto</label>
                            <input id="editMonto" type="number" step="0.01" defaultValue={selectedService.monto} className="w-full border rounded px-3 py-2" />

                            <label className="text-sm">Fecha Vencimiento</label>
                            <input id="editVencimiento" type="date" defaultValue={selectedService.fechaVencimiento ? new Date(selectedService.fechaVencimiento).toISOString().split('T')[0] : ''} className="w-full border rounded px-3 py-2" />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700" onClick={() => {
                                const payload = {
                                    nombre: document.getElementById('editNombre').value,
                                    monto: Number(document.getElementById('editMonto').value) || 0,
                                    fecha_vencimiento: document.getElementById('editVencimiento').value || null
                                };
                                actualizarServicio(payload);
                            }}>Guardar</button>
                            <button className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600" onClick={() => { setShowEditModal(false); setSelectedService(null); }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}