
import SectionHeader from "./SectionHeader";
import Logo from "./Logo";
import BotonSecundary from "./BotonSecundary";
import ImgFondo from "./ImgFondo";
import SectionFooter from "./SectionFooter";
import React, { useState } from "react";

export default function PageResidente({ residenteData, isFromMora = false }) {
    // Estado para el modal de registro de pago
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showResidentPaymentModal, setShowResidentPaymentModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [serviciosActualizados, setServiciosActualizados] = useState(null);
    
    // ========== SISTEMA DE DATOS AUTOMÁTICO ==========
    
    // Obtener fecha actual para cálculos automáticos
    const hoy = new Date();
    const formatearFecha = (fecha) => {
        return fecha.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit', 
            year: 'numeric'
        });
    };
    
    // Función para calcular días de diferencia
    const calcularDiasVencimiento = (fechaVencimiento) => {
        const vencimiento = new Date(fechaVencimiento);
        const diferencia = Math.floor((vencimiento - hoy) / (1000 * 60 * 60 * 24));
        return diferencia;
    };
    
    // Función para determinar estado automáticamente
    const determinarEstado = (fechaVencimiento, fechaPago = null) => {
        if (fechaPago) return "Pagado";
        
        const diasRestantes = calcularDiasVencimiento(fechaVencimiento);
        if (diasRestantes < 0) return "Pendiente";
        if (diasRestantes <= 5) return "Por vencer";
        return "Al día";
    };
    
    // Función para obtener los colores del badge según el estado
    const getBadgeColors = (estado) => {
        switch (estado) {
            case "Pendiente":
                return "bg-red-600 text-white";
            case "Por vencer":
                return "bg-yellow-400 text-black";
            case "Pagado":
                return "bg-green-600 text-white";
            case "Al día":
                return "bg-blue-600 text-white";
            default:
                return "bg-gray-400 text-white";
        }
    };

    // Función para obtener el color de fondo de la fila según el estado
    const getRowBackgroundColor = (estado) => {
        switch (estado) {
            case "Pendiente":
                return 'bg-red-50';
            case "Por vencer":
                return 'bg-yellow-50';
            case "Pagado":
                return 'bg-green-50';
            case "Al día":
                return 'bg-blue-50';
            default:
                return '';
        }
    };
    
    // Función para obtener el color del subrayado del nombre según el estado
    const getUnderlineColor = (estado) => {
        switch (estado) {
            case "Pendiente":
                return 'border-red-600';
            case "Por vencer":
                return 'border-yellow-400';
            case "Pagado":
                return 'border-green-600';
            case "Al día":
                return 'border-blue-600';
            default:
                return 'border-gray-400';
        }
    };
    
    // ========== DATOS DINÁMICOS DE SERVICIOS ==========
    
    // Esta estructura sería reemplazada por datos de la base de datos
    const serviciosData = [
        {
            id: 1,
            nombre: "Cuota de mantenimiento",
            numeroFactura: "123456",
            fechaGeneracion: "2025-08-01",
            monto: 50,
            fechaVencimiento: "2025-09-15",
            fechaPago: null // null = no pagado
        },
        {
            id: 2,
            nombre: "Agua",
            numeroFactura: "789012", 
            fechaGeneracion: "2025-08-15",
            monto: 30,
            fechaVencimiento: "2025-09-20",
            fechaPago: null
        },
        {
            id: 3,
            nombre: "Cuota de mantenimiento",
            numeroFactura: "111222",
            fechaGeneracion: "2025-07-01", 
            monto: 50,
            fechaVencimiento: "2025-08-15",
            fechaPago: "2025-08-10" // Pagado
        },
        {
            id: 4,
            nombre: "Agua",
            numeroFactura: "333444",
            fechaGeneracion: "2025-07-15",
            monto: 25,
            fechaVencimiento: "2025-08-20", 
            fechaPago: "2025-08-18" // Pagado
        }
    ];
    
    // Procesar servicios con cálculos automáticos
    const serviciosProcesados = (serviciosActualizados || serviciosData).map(servicio => {
        const estado = determinarEstado(servicio.fechaVencimiento, servicio.fechaPago);
        const diasVencimiento = calcularDiasVencimiento(servicio.fechaVencimiento);
        
        return {
            ...servicio,
            estado,
            diasVencimiento,
            fechaGeneracionFormateada: formatearFecha(new Date(servicio.fechaGeneracion)),
            fechaVencimientoFormateada: formatearFecha(new Date(servicio.fechaVencimiento)),
            fechaPagoFormateada: servicio.fechaPago ? formatearFecha(new Date(servicio.fechaPago)) : null
        };
    });
    
    // Separar servicios actuales y históricos
    const serviciosActuales = serviciosProcesados.filter(s => !s.fechaPago);
    const serviciosHistoricos = serviciosProcesados.filter(s => s.fechaPago);
    
    // ========== CÁLCULOS AUTOMÁTICOS ==========
    
    // Calcular deuda total automáticamente
    const deudaTotal = serviciosActuales.reduce((total, servicio) => total + servicio.monto, 0);
    
    // Calcular días en mora automáticamente (mayor mora de servicios pendientes)
    const diasMora = serviciosActuales.length > 0 
        ? Math.max(...serviciosActuales.map(s => s.diasVencimiento < 0 ? Math.abs(s.diasVencimiento) : 0))
        : 0;
    
    // Determinar estado general del residente para el subrayado del nombre
    const estadoGeneralResidente = (() => {
        if (serviciosActuales.length === 0) return "Pagado"; // Todo pagado
        
        const tieneServiciosPendientes = serviciosActuales.some(s => s.estado === "Pendiente");
        const tieneServiciosPorVencer = serviciosActuales.some(s => s.estado === "Por vencer");
        
        if (tieneServiciosPendientes) return "Pendiente";
        if (tieneServiciosPorVencer) return "Por vencer";
        return "Al día";
    })();
    
    // Función para manejar el registro de pago (admin) o pago (residente)
    const handlePayment = (servicio) => {
        if (esDesdeMora) {
            // Admin: Abrir modal para registrar pago
            setSelectedService(servicio);
            setShowPaymentModal(true);
        } else {
            // Residente: Abrir modal de pago
            setSelectedService(servicio);
            setShowResidentPaymentModal(true);
        }
    };

    // Función para procesar pago del residente
    const procesarPagoResidente = (metodoPago, referencia, notas) => {
        // Simular procesamiento de pago
        const serviciosConPago = serviciosActualizados.map(servicio => {
            if (servicio.id === selectedService.id) {
                return {
                    ...servicio,
                    estado: 'Pagado',
                    fechaPago: new Date().toLocaleDateString('es-ES'),
                    metodoPago: metodoPago,
                    referencia: referencia || 'N/A'
                };
            }
            return servicio;
        });
        
        // Actualizar el estado con los servicios modificados
        setServiciosActualizados(serviciosConPago);
        
        // Cerrar modal
        setShowResidentPaymentModal(false);
        setSelectedService(null);
        
        // Mostrar confirmación
        alert(`✅ Pago procesado exitosamente!\n\nServicio: ${selectedService.nombre}\nMonto: $${selectedService.monto}\nMétodo: ${metodoPago}\nReferencia: ${referencia || 'N/A'}`);
    };
    
    // Función para procesar el pago registrado por el admin
    const procesarPago = (metodoPago, fechaPago, notas) => {
        if (!selectedService) return;
        
        // Crear servicios actualizados con el pago registrado
        const serviciosConPago = (serviciosActualizados || serviciosData).map(servicio => {
            if (servicio.id === selectedService.id) {
                return {
                    ...servicio,
                    fechaPago: fechaPago,
                    metodoPago: metodoPago,
                    notasPago: notas,
                    fechaPagoRegistrada: new Date().toISOString() // Para auditoría
                };
            }
            return servicio;
        });
        
        // Actualizar el estado con los servicios modificados
        setServiciosActualizados(serviciosConPago);
        
        // Cerrar modal
        setShowPaymentModal(false);
        setSelectedService(null);
        
        // Mostrar confirmación
        alert(`✅ Pago registrado exitosamente!\n\nServicio: ${selectedService.nombre}\nMonto: $${selectedService.monto}\nMétodo: ${metodoPago}\nFecha: ${fechaPago}`);
    };
    
    // Leer parámetros de la URL para detectar si viene desde mora
    const urlParams = new URLSearchParams(window.location.search);
    const fromMora = urlParams.get('fromMora') === 'true';
    const urlData = urlParams.get('data');
    
    // Datos por defecto para residente normal
    const defaultData = {
        nombre: "BIENVENID@S NOMBRE!",
        apartamento: "101",
        torre: "1",
        telefono: "321-555-0100",
        email: "residente@email.com",
        diasMora: 0,
        totalDeuda: 0,
        genero: "masculino" // "masculino" o "femenino" - vendría de la base de datos
    };
    
    // Función para generar saludo personalizado según género
    const generarSaludo = (nombre, genero) => {
        if (nombre.includes("BIENVENID@S")) {
            // Si es el nombre por defecto, usar el saludo genérico
            return nombre;
        }
        
        // Saludo personalizado según género
        const saludo = genero === "femenino" ? "Bienvenida" : "Bienvenido";
        return `${saludo} ${nombre}!`;
    };

    // Usar datos de URL, props o datos por defecto
    let residente = defaultData;
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
    return (
        <div className="min-h-screen flex flex-col">
            {/* HEADER */}
            <SectionHeader>
                <Logo redirectTo={esDesdeMora ? "/mora" : "/residente"} />
                <BotonSecundary 
                    textoBtn={esDesdeMora ? "Volver a Mora" : "Cerrar sesión"} 
                    onClick={() => window.location.href = esDesdeMora ? "/mora" : "/login"} 
                />
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
                        {/* INFORMACIÓN COMPLETA DEL RESIDENTE */}
                        <div className="flex justify-center mb-4">
                            <div className="bg-white px-6 py-4 rounded-lg shadow-lg" style={{width: 'fit-content', minWidth: '1000px'}}>
                                {esDesdeMora ? (
                                    /* Layout para admin desde mora - Todo en una sola fila */
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
                                        
                                        <div className="flex gap-3">
                                            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                                                Mora: {diasMora} días
                                            </span>
                                            <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded">
                                                Deuda: ${deudaTotal}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    /* Layout para residente normal - Dos filas: Saludo arriba, info abajo */
                                    <div className="space-y-4">
                                        {/* Primera fila: Solo el saludo personalizado */}
                                        <div className="flex justify-center">
                                            <span className={`font-semibold text-xl text-gray-800 border-b-4 ${getUnderlineColor(estadoGeneralResidente)} pb-1`}>
                                                {generarSaludo(residente.nombre, residente.genero || "masculino")}
                                            </span>
                                        </div>
                                        
                                        {/* Segunda fila: Resto de información horizontal */}
                                        <div className="flex items-center justify-center gap-8">
                                            <div>
                                                <span className="text-gray-800 font-medium">Torre {residente.torre} - Apto {residente.apartamento}</span>
                                            </div>
                                            {/* BADGES MORA Y DEUDA justo después de torre/apto */}
                                            {(diasMora > 0 || deudaTotal > 0) && (
                                                <div className="flex gap-3">
                                                    {diasMora > 0 && (
                                                        <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                                                            Mora: {diasMora} días
                                                        </span>
                                                    )}
                                                    {deudaTotal > 0 && (
                                                        <span className="bg-orange-600 text-white text-xs px-2 py-1 rounded">
                                                            Deuda: ${deudaTotal}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-sm text-gray-600">Teléfono: </span>
                                                <span className="font-medium ml-1">{residente.telefono}</span>
                                            </div>
                                            <div>
                                                <span className="text-sm text-gray-600">Email: </span>
                                                <span className="font-medium ml-1">{residente.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* TABLA DE COBROS - Con más separación */}
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

                                    <div className="overflow-x-auto">
                                        <table className="w-full bg-white border rounded shadow">
                                            <thead className="bg-gray-200 text-black">
                                                <tr>
                                                    <th className="px-4 py-2 text-left font-semibold">Concepto</th>
                                                    <th className="px-4 py-2 text-left font-semibold">ID Cobro</th>
                                                    {esDesdeMora && <th className="px-4 py-2 text-left font-semibold">Fecha Emisión</th>}
                                                    <th className="px-4 py-2 text-left font-semibold">Monto</th>
                                                    <th className="px-4 py-2 text-left font-semibold">Fecha límite</th>
                                                    {esDesdeMora && <th className="px-4 py-2 text-left font-semibold">Días Mora</th>}
                                                    <th className="px-4 py-2 text-left font-semibold">Estado</th>
                                                    <th className="px-4 py-2 text-center font-semibold">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {/* SERVICIOS ACTUALES (No pagados) */}
                                                {serviciosActuales.map((servicio) => (
                                                    <tr key={servicio.id} className={`border-t ${getRowBackgroundColor(servicio.estado)}`}>
                                                        <td className="px-4 py-2">{servicio.nombre}</td>
                                                        <td className="px-4 py-2">{servicio.numeroFactura}</td>
                                                        {esDesdeMora && <td className="px-4 py-2">{servicio.fechaGeneracionFormateada}</td>}
                                                        <td className="px-4 py-2">${servicio.monto}</td>
                                                        <td className="px-4 py-2">{servicio.fechaVencimientoFormateada}</td>
                                                        {esDesdeMora && (
                                                            <td className={`px-4 py-2 font-semibold ${
                                                                servicio.diasVencimiento < 0 ? 'text-red-600' : 'text-green-600'
                                                            }`}>
                                                                {servicio.diasVencimiento < 0 
                                                                    ? `${Math.abs(servicio.diasVencimiento)} días` 
                                                                    : `${servicio.diasVencimiento} días`
                                                                }
                                                            </td>
                                                        )}
                                                        <td className="px-4 py-2">
                                                            <span className={`${getBadgeColors(servicio.estado)} text-xs px-2 py-1 rounded`}>
                                                                {servicio.estado}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            <button 
                                                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700"
                                                                onClick={() => handlePayment(servicio)}
                                                            >
                                                                {esDesdeMora ? "Registrar pago" : "Pagar"}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                
                                                {/* SERVICIOS HISTÓRICOS (Solo si viene desde mora) */}
                                                {esDesdeMora && serviciosHistoricos.map((servicio) => (
                                                    <tr key={`hist-${servicio.id}`} className={`border-t ${getRowBackgroundColor(servicio.estado)}`}>
                                                        <td className="px-4 py-2">{servicio.nombre}</td>
                                                        <td className="px-4 py-2">{servicio.numeroFactura}</td>
                                                        <td className="px-4 py-2">{servicio.fechaGeneracionFormateada}</td>
                                                        <td className="px-4 py-2">${servicio.monto}</td>
                                                        <td className="px-4 py-2">{servicio.fechaVencimientoFormateada}</td>
                                                        <td className="px-4 py-2 text-gray-500">-</td>
                                                        <td className="px-4 py-2">
                                                            <span className={`${getBadgeColors(servicio.estado)} text-xs px-2 py-1 rounded`}>
                                                                {servicio.estado}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-center">
                                                            <span className="text-gray-400 text-sm">Completado</span>
                                                        </td>
                                                    </tr>
                                                ))}
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
            
            {/* MODAL DE REGISTRO DE PAGO (Solo para admin) */}
            {showPaymentModal && selectedService && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    {/* Fondo con imagen igual que la aplicación */}
                    <div className="absolute inset-0">
                        <img
                            src="/img/imagen.png"
                            alt="Fondo modal"
                            className="w-full h-full object-cover brightness-75"
                        />
                    </div>
                    
                    {/* Contenido del modal */}
                    <div className="relative z-10 bg-white rounded-lg p-6 w-96 max-w-md mx-4 shadow-2xl">
                        <h3 className="text-lg font-semibold mb-4">Registrar Pago</h3>
                        
                        {/* Información del servicio */}
                        <div className="mb-4 p-3 bg-gray-100 rounded">
                            <p><strong>Servicio:</strong> {selectedService.nombre}</p>
                            <p><strong>Monto:</strong> ${selectedService.monto}</p>
                            <p><strong>Factura:</strong> {selectedService.numeroFactura}</p>
                        </div>
                        
                        {/* Formulario de registro */}
                        <div className="space-y-4">
                            {/* Método de pago */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Método de pago
                                </label>
                                <select 
                                    id="metodoPago"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="efectivo">Efectivo</option>
                                    <option value="transferencia">Transferencia bancaria</option>
                                    <option value="cheque">Cheque</option>
                                    <option value="tarjeta">Tarjeta de crédito/débito</option>
                                </select>
                            </div>
                            
                            {/* Fecha del pago */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha del pago
                                </label>
                                <input 
                                    id="fechaPago"
                                    type="date" 
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            
                            {/* Notas */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notas (opcional)
                                </label>
                                <textarea 
                                    id="notasPago"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                                    placeholder="Ej: Pago en efectivo verificado, comprobante de transferencia recibido..."
                                />
                            </div>
                        </div>
                        
                        {/* Botones */}
                        <div className="flex gap-3 mt-6">
                            <button 
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium"
                                onClick={() => {
                                    const metodoPago = document.getElementById('metodoPago').value;
                                    const fechaPago = document.getElementById('fechaPago').value;
                                    const notas = document.getElementById('notasPago').value;
                                    
                                    procesarPago(metodoPago, fechaPago, notas);
                                }}
                            >
                                Registrar Pago
                            </button>
                            <button 
                                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 font-medium"
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    setSelectedService(null);
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE PAGO PARA RESIDENTES */}
            {showResidentPaymentModal && selectedService && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    {/* Fondo con imagen igual que la aplicación */}
                    <div className="absolute inset-0">
                        <img
                            src="/img/imagen.png"
                            alt="Fondo modal"
                            className="w-full h-full object-cover brightness-75"
                        />
                    </div>
                    
                    {/* Contenido del modal */}
                    <div className="relative z-10 bg-white rounded-lg p-6 w-96 max-w-md mx-4 shadow-2xl">
                        <h3 className="text-lg font-semibold mb-4 text-black">Realizar Pago</h3>
                        
                        {/* Información del servicio */}
                        <div className="mb-4 p-3 bg-gray-100 rounded">
                            <p><strong className="text-black">Servicio:</strong> {selectedService.nombre}</p>
                            <p><strong className="text-black">Monto:</strong> <span className="text-green-600 font-bold">${selectedService.monto}</span></p>
                            <p><strong className="text-black">Factura:</strong> {selectedService.numeroFactura}</p>
                        </div>
                        
                        {/* Formulario de pago */}
                        <div className="space-y-4">
                            {/* Método de pago */}
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">
                                    Método de pago
                                </label>
                                <select 
                                    id="metodoPagoResidente"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="tarjeta">Tarjeta de crédito/débito</option>
                                    <option value="pse">PSE (Pagos Seguros en Línea)</option>
                                    <option value="nequi">Nequi</option>
                                    <option value="bancolombia">Bancolombia</option>
                                    <option value="transferencia">Transferencia bancaria</option>
                                </select>
                            </div>
                            
                            {/* Número de referencia/confirmación */}
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">
                                    Número de referencia/confirmación
                                </label>
                                <input 
                                    id="referenciaResidente"
                                    type="text" 
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ej: 1234567890"
                                />
                            </div>
                            
                            {/* Notas adicionales */}
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">
                                    Notas adicionales (opcional)
                                </label>
                                <textarea 
                                    id="notasResidente"
                                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-16"
                                    placeholder="Comentarios adicionales sobre el pago..."
                                />
                            </div>
                        </div>
                        
                        {/* Botones */}
                        <div className="flex gap-3 mt-6">
                            <button 
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition-colors"
                                onClick={() => {
                                    const metodoPago = document.getElementById('metodoPagoResidente').value;
                                    const referencia = document.getElementById('referenciaResidente').value;
                                    const notas = document.getElementById('notasResidente').value;
                                    
                                    if (!referencia.trim()) {
                                        alert('Por favor ingrese el número de referencia del pago');
                                        return;
                                    }
                                    
                                    procesarPagoResidente(metodoPago, referencia, notas);
                                }}
                            >
                                Confirmar Pago
                            </button>
                            <button 
                                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 font-medium transition-colors"
                                onClick={() => {
                                    setShowResidentPaymentModal(false);
                                    setSelectedService(null);
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                        
                        {/* Nota informativa */}
                        <div className="mt-4 p-2 bg-blue-50 rounded text-xs text-blue-700">
                            <strong>Nota:</strong> Asegúrese de tener el comprobante de pago antes de confirmar la transacción.
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
