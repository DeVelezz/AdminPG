import SectionHeader from "./SectionHeader";
import Logo from "./Logo";
import BotonSecundary from "./BotonSecundary";
import ImgFondo from "./ImgFondo";
import SectionFooter from "./SectionFooter";
import React, { useState, useEffect, useCallback } from "react";
import Swal from 'sweetalert2';
import { getBadgeColors, getRowBackgroundColor, getUnderlineColor, formatCurrency } from '../utils/estadoUtils';

export default function PageResidente({ residenteData, isFromMora = false }) {
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showResidentPaymentModal, setShowResidentPaymentModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [serviciosDB, setServiciosDB] = useState([]);
    const [usuarioLogueado, setUsuarioLogueado] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Cargar usuario desde localStorage
    useEffect(() => {
        const usuarioGuardado = localStorage.getItem('Usuario');
        if (usuarioGuardado) {
            try {
                const usuario = JSON.parse(usuarioGuardado);
                setUsuarioLogueado(usuario);
                console.log('✅ Usuario cargado desde localStorage:', usuario);
            } catch (error) {
                console.error('❌ Error al cargar usuario:', error);
            }
        }
    }, []);
    
    // Función para cargar servicios desde la base de datos (reutilizable)
    const cargarServicios = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Obtener el residente_id correcto
            let residenteId;
            if (residenteData?.residente_id) {
                residenteId = residenteData.residente_id;
            } else if (usuarioLogueado?.residente_id) {
                residenteId = usuarioLogueado.residente_id;
            }

            // Si no encontramos residenteId en props o usuario logueado, intentar leerlo desde la query string (navegación desde /mora)
            if (!residenteId) {
                try {
                    const urlParams = new URLSearchParams(window.location.search);
                    const dataParam = urlParams.get('data');
                    if (dataParam) {
                        const parsed = JSON.parse(decodeURIComponent(dataParam));
                        residenteId = parsed.residente_id || parsed.residenteId || parsed.residenteId || parsed.usuario_id || parsed.usuarioId || null;
                    }
                } catch {
                    // ignore parse errors
                }
            }

            if (!residenteId) {
                console.error('No se encontró residente_id');
                setLoading(false);
                return;
            }

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_URL}/servicios/residente/${residenteId}`, {
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
            const servicios = Array.isArray(data) ? data : (data.data ?? []);
            // LOG de depuración: mostrar los primeros servicios y sus campos 'estado' para verificar cómo vienen desde el backend
            if (Array.isArray(servicios) && servicios.length > 0) {
                console.log('DEBUG servicios sample:', servicios.slice(0, 10).map(s => ({ id: s.id, nombre: s.nombre, estado: s.estado, fecha_vencimiento: s.fecha_vencimiento ?? s.fechaVencimiento ?? s.fechaVencimiento })))
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
    
    
    const formatearFecha = (fecha) => {
        return new Date(fecha).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
        });
    };
    
    const calcularDiasVencimiento = (fechaVencimiento) => {
        if (!fechaVencimiento) return Infinity;
        const vencimiento = new Date(fechaVencimiento);
        // Normalizar ambas fechas a medianoche local para evitar errores por zonas horarias/horas
        const vencDate = new Date(vencimiento.getFullYear(), vencimiento.getMonth(), vencimiento.getDate());
        const hoyDate = new Date((new Date()).getFullYear(), (new Date()).getMonth(), (new Date()).getDate());
        const msPorDia = 1000 * 60 * 60 * 24;
        const diferencia = Math.floor((vencDate - hoyDate) / msPorDia);
        return diferencia;
    };
    
    const determinarEstado = (fechaVencimiento, fechaPago = null) => {
        if (fechaPago) return "Pagado";
        
        const diasRestantes = calcularDiasVencimiento(fechaVencimiento);
        if (diasRestantes < 0) return "Pendiente";
        if (diasRestantes <= 5) return "Por vencer";
        return "Al día";
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

        const diasVencimiento = calcularDiasVencimiento(fechaVencimiento);
        // Estado derivado: Pagado solo si fechaPago válida, si no, usar cálculo por vencimiento
        const estado = determinarEstado(fechaVencimiento, fechaPago);

        return {
            ...servicio,
            fechaGeneracion,
            fechaVencimiento,
            fechaPago,
            monto,
            numeroFactura,
            estado,
            diasVencimiento,
            fechaGeneracionFormateada: fechaGeneracion ? formatearFecha(fechaGeneracion) : '',
            fechaVencimientoFormateada: fechaVencimiento ? formatearFecha(fechaVencimiento) : '',
            fechaPagoFormateada: fechaPago ? formatearFecha(fechaPago) : null
        };
    });
    
    // serviciosActuales: los que no tienen fecha de pago válida (null)
    const serviciosActuales = serviciosProcesados.filter(s => !s.fechaPago);
    // históricos ya se derivan de serviciosProcesados cuando es necesario
    
    // Asegurarse de sumar números (evitar concatenación si monto es string)
    const deudaTotal = serviciosActuales.reduce((total, servicio) => total + (Number(servicio.monto) || 0), 0);
    const diasMora = serviciosActuales.length > 0 
        ? Math.max(...serviciosActuales.map(s => s.diasVencimiento < 0 ? Math.abs(s.diasVencimiento) : 0))
        : 0;
    
    // estadoGeneralResidente se calculará más abajo, después de normalizar 'residente'
    
    const handlePayment = (servicio) => {
        if (esDesdeMora) {
            setSelectedService(servicio);
            setShowPaymentModal(true);
        } else {
            setSelectedService(servicio);
            setShowResidentPaymentModal(true);
        }
    };

    const procesarPagoResidente = async (metodoPago, referencia, notas) => {
        try {
            const token = localStorage.getItem('token');
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
            
            if (!response.ok) {
                throw new Error('Error al procesar el pago');
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
    
    const procesarPago = async (metodoPago, fechaPago, notas) => {
        if (!selectedService) return;
        
        try {
            const token = localStorage.getItem('token');
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
                    monto: selectedService.monto
                })
            });
            
            if (!response.ok) {
                throw new Error('Error al registrar el pago');
            }
            
            // Recargar servicios desde la API para asegurar consistencia
            await cargarServicios();
            setShowPaymentModal(false);
            setSelectedService(null);
            Swal.fire({ icon: 'success', title: 'Pago registrado', text: `Servicio: ${selectedService.nombre} — Monto: $${selectedService.monto}`, timer: 2500 });
            
        } catch (error) {
            console.error('❌ Error al registrar pago:', error);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Error al registrar el pago. Por favor, intente nuevamente.' });
        }
    };

    // Función para actualizar servicio (editar)
    const actualizarServicio = async (payload) => {
        if (!selectedService) return;
        try {
            const token = localStorage.getItem('token');
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
    const urlData = urlParams.get('data');
    
    const generarSaludo = (nombre, genero) => {
        if (!nombre) return "Bienvenid@";
        const saludo = genero === "femenino" ? "Bienvenida" : "Bienvenido";
        return `${saludo} ${nombre}!`;
    };

    let residente = usuarioLogueado || {};
    let esDesdeMora = fromMora || isFromMora;
    
    if (urlData) {
        try {
            residente = JSON.parse(decodeURIComponent(urlData));
            esDesdeMora = true;
        } catch (error) {
            console.error('Error parsing URL data:', error);
        }
    } else if (residenteData) {
        residente = residenteData;
        esDesdeMora = isFromMora;
    }
    // Si la navegación nos pasó campos con nombres distintos (p.ej. desde PageMora), normalizarlos:
    // PageMora usa 'diasVencimiento' y 'monto' mientras que en esta pantalla usamos 'diasMora' y 'totalDeuda'.
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
    } catch (err) {
        console.warn('Error normalizando datos del residente desde URL/props', err);
    }
    
    // Actualizar datos calculados del residente
    // Si la información viene en la prop/url (por ejemplo cuando venimos desde Mora o Admin), priorizarla.
    residente = {
        ...residente,
        diasMora: (typeof residente.diasMora === 'number' && residente.diasMora > 0) ? residente.diasMora : diasMora,
        totalDeuda: (typeof residente.totalDeuda === 'number' && residente.totalDeuda > 0) ? residente.totalDeuda : deudaTotal
    };

    // Calcular estado general del residente ahora que 'residente' está definido / normalizado
    const estadoGeneralResidente = (() => {
        // Si el backend o la navegación nos pasó un estado ya calculado (ej. 'En mora'), respetarlo.
        if (residente && residente.estado) return residente.estado;

        if (serviciosActuales.length === 0) return "Pagado";
        const tieneServiciosPendientes = serviciosActuales.some(s => s.estado === "Pendiente");
        const tieneServiciosPorVencer = serviciosActuales.some(s => s.estado === "Por vencer");
        if (tieneServiciosPendientes) return "Pendiente";
        if (tieneServiciosPorVencer) return "Por vencer";
        return "Al día";
    })();
    
    const cerrarSesion = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('Usuario');
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
                <Logo redirectTo={esDesdeMora ? "/mora" : "/residente"} />
                <BotonSecundary 
                    textoBtn={esDesdeMora ? "Volver a Mora" : "Cerrar sesión"} 
                    onClick={() => esDesdeMora ? window.location.href = "/mora" : cerrarSesion()} 
                />
            </SectionHeader>

            <main className="flex-1 relative">
                <ImgFondo>
                    <img src="/img/imagen.png" alt="Imagen de fondo" className="w-full h-full object-cover brightness-75 absolute inset-0" />

                    <div className="relative z-10 p-5">
                        <div className="flex justify-center mb-4">
                            <div className="bg-white px-6 py-4 rounded-lg shadow-lg" style={{width: 'fit-content', minWidth: '1000px'}}>
                                {esDesdeMora ? (
                                    <div className="flex items-center gap-8">
                                        <div className="flex items-center gap-2">
                                            <span className={`font-semibold text-xl text-gray-800 border-b-4 ${getUnderlineColor(estadoGeneralResidente)} pb-1`}>
                                                {residente.nombre}
                                            </span>
                                            <span className="text-gray-600">Torre {residente.torre} - Apto {residente.apartamento}</span>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Teléfono: </span>
                                            <span className="font-medium ml-1">{residente.telefono}</span>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Email: </span>
                                            <span className="font-medium ml-1">{residente.email}</span>
                                        </div>
                                        <div className="flex gap-3 items-center">
                                            {/* Badge de estado (usa colores centralizados) */}
                                            <span className={`${getBadgeColors(estadoGeneralResidente)} text-xs px-2 py-1 rounded`}>{estadoGeneralResidente}</span>
                                            {/* Mostrar mora siempre si existe (priorizar valores pasados por navegación) */}
                                            {((residente && Number(residente.diasMora) > 0) || diasMora > 0) && (
                                                <span className={`${Number((residente && residente.diasMora) || diasMora) > 0 ? 'bg-red-100 text-red-700' : getBadgeColors('Pendiente')} text-xs px-2 py-1 rounded`}>Mora: { (residente && Number(residente.diasMora) > 0) ? Number(residente.diasMora) : diasMora } días</span>
                                            )}
                                            {/* Deuda siempre visible, preferir residente.totalDeuda si viene en la navegación */}
                                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Deuda: {formatCurrency((residente && typeof residente.totalDeuda === 'number') ? residente.totalDeuda : deudaTotal)}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="flex justify-center">
                                            <span className={`font-semibold text-xl text-gray-800 border-b-4 ${getUnderlineColor(estadoGeneralResidente)} pb-1`}>
                                                {generarSaludo(residente.nombre, residente.genero)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-center gap-8">
                                            <div>
                                                <span className="text-gray-800 font-medium">Torre {residente.torre} - Apto {residente.apartamento}</span>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-600">Teléfono: </span>
                                                <span className="font-medium ml-1">{residente.telefono}</span>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-600">Email: </span>
                                                <span className="font-medium ml-1">{residente.email}</span>
                                            </div>
                                            {((residente && Number(residente.diasMora) > 0) || (residente && typeof residente.totalDeuda === 'number' && residente.totalDeuda > 0) || diasMora > 0 || deudaTotal > 0) && (
                                                <div className="flex gap-3">
                                                    {/* Priorizar valores pasados por navegación; si hay mora, destacar en rojo */}
                                                    {((residente && Number(residente.diasMora) > 0) || diasMora > 0) && (
                                                        <span className={`${Number((residente && residente.diasMora) || diasMora) > 0 ? 'bg-red-100 text-red-700' : getBadgeColors('Pendiente')} text-xs px-2 py-1 rounded`}>Mora: { (residente && Number(residente.diasMora) > 0) ? Number(residente.diasMora) : diasMora } días</span>
                                                    )}
                                                    {(((residente && typeof residente.totalDeuda === 'number') ? residente.totalDeuda : deudaTotal) > 0) && (
                                                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Deuda: {formatCurrency((residente && typeof residente.totalDeuda === 'number') ? residente.totalDeuda : deudaTotal)}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="shadow-lg mt-8">
                            <div className="bg-white shadow-lg rounded" style={{minWidth: '1000px'}}>
                                <div className="flex justify-between items-center px-4 py-3 border-b">
                                    <span className="font-bold text-black text-xl">
                                        {esDesdeMora ? "Historial Completo de Pagos" : "Información de los cobros"}
                                    </span>
                                </div>
                                <div className="bg-gray-100 p-6 rounded-b">
                                    <h3 className="text-center text-blue-600 font-bold text-xl mb-4">
                                        {esDesdeMora ? "Deudas y Historial de Pagos" : "Tabla con los pagos pendientes"}
                                    </h3>
                                    
                                    {serviciosProcesados.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            No hay servicios registrados
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full bg-white border rounded shadow">
                                                <thead className="bg-gray-200 text-black">
                                                    <tr>
                                                        <th className="px-4 py-2 text-left font-semibold">Concepto</th>
                                                        <th className="px-4 py-2 text-left font-semibold">ID Cobro</th>
                                                        {esDesdeMora && <th className="px-4 py-2 text-left font-semibold">Fecha Emisión</th>}
                                                        <th className="px-4 py-2 text-left font-semibold">Monto</th>
                                                        <th className="px-4 py-2 text-left font-semibold">Fecha límite</th>
                                                        <th className="px-4 py-2 text-left font-semibold">Días Mora</th>
                                                        <th className="px-4 py-2 text-left font-semibold">Estado</th>
                                                        <th className="px-4 py-2 text-center font-semibold">Acción</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {((esDesdeMora ? serviciosProcesados : serviciosActuales) || []).map((servicio) => (
                                                        <tr key={servicio.id} className={`border-t ${getRowBackgroundColor(servicio.estado)}`}>
                                                            <td className="px-4 py-2">{servicio.nombre}</td>
                                                            <td className="px-4 py-2">{servicio.numeroFactura}</td>
                                                            {esDesdeMora && <td className="px-4 py-2">{servicio.fechaGeneracionFormateada}</td>}
                                                            <td className="px-4 py-2">{formatCurrency(servicio.monto)}</td>
                                                            <td className="px-4 py-2">{servicio.fechaVencimientoFormateada}</td>
                                                            <td className={`px-4 py-2 font-semibold ${servicio.diasVencimiento < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                                {servicio.diasVencimiento < 0 ? `${Math.abs(servicio.diasVencimiento)} días` : `${servicio.diasVencimiento} días`}
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                {(() => {
                                                                    const displayedEstado = (!servicio.is_paid && servicio.diasVencimiento < 0) ? 'En mora' : servicio.estado;
                                                                    return <span className={`${getBadgeColors(displayedEstado)} text-xs px-2 py-1 rounded`}>{displayedEstado}</span>;
                                                                })()}
                                                            </td>
                                                            <td className="px-4 py-2 text-center flex items-center justify-center gap-2">
                                                                                        {(() => {
                                                                                            // Determinar si está pagado: preferir bandera backend, luego fechaPago normalizada
                                                                                            const isPaid = Boolean(servicio.is_paid || servicio.fechaPago || servicio.fecha_pago);
                                                                                            const isOverdue = servicio.diasVencimiento < 0;
                                                                                            // Normalizar rol del usuario logueado
                                                                                            const role = (usuarioLogueado?.rol || usuarioLogueado?.role || '').toString().toLowerCase();
                                                                                            const isAdmin = role === 'admin' || role === 'administrador' || role === 'administrator';

                                                                                            // Mostrar botones solo si está en mora (vencido) y no está pagado
                                                                                            if (!isPaid && isOverdue) {
                                                                                                return (
                                                                                                    <>
                                                                                                        <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700" onClick={() => handlePayment(servicio)}>
                                                                                                            {esDesdeMora ? "Registrar pago" : "Pagar"}
                                                                                                        </button>
                                                                                                        {isAdmin && (
                                                                                                            <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded shadow hover:bg-gray-700" onClick={() => { setSelectedService(servicio); setShowEditModal(true); }}>
                                                                                                                Editar
                                                                                                            </button>
                                                                                                        )}
                                                                                                    </>
                                                                                                );
                                                                                            }

                                                                                            // Si ya está pagado, mostrar etiqueta mínima
                                                                                            if (isPaid) return <span className="text-sm text-green-600 font-medium">Pagado</span>;
                                                                                            // Si no está en mora ni pagado, permitir pago normal
                                                                                            return (
                                                                                                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700" onClick={() => handlePayment(servicio)}>
                                                                                                    Pagar
                                                                                                </button>
                                                                                            );
                                                                                        })()}
                                                            </td>
                                                        </tr>
                                                    ))}
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
                            <textarea id="notasPago" className="w-full border rounded px-3 py-2 h-20" placeholder="Notas..."/>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" 
                                onClick={() => procesarPago(document.getElementById('metodoPago').value, document.getElementById('fechaPago').value, document.getElementById('notasPago').value)}>
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