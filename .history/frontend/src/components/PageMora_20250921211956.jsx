import React, { useState } from "react";
import SectionHeader from "./SectionHeader";
import Logo from "./Logo";
import BotonSecundary from "./BotonSecundary";
import ImgFondo from "./ImgFondo";
import SectionFooter from "./SectionFooter";
import { FaPhone } from "react-icons/fa";
import { SiGmail, SiWhatsapp } from "react-icons/si";

export default function PageMora() {
    // ========== SISTEMA DE DATOS AUTOMÁTICO ==========
    
    // Obtener fecha actual para cálculos automáticos
    const hoy = new Date();
    
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
    
    // Función para obtener colores de fila automáticamente
    const getRowBackgroundColor = (estado) => {
        switch (estado) {
            case "Pendiente":
                return 'bg-red-50';
            case "Por vencer":
                return 'bg-yellow-50';
            default:
                return '';
        }
    };
    
    // ========== DATOS AUTOMÁTICOS DE RESIDENTES ==========
    
    // Esta estructura sería reemplazada por datos de la base de datos
    const todosResidenetes = [
        {
            id: 1,
            nombre: "Ana García",
            apartamento: "101",
            torre: "1",
            telefono: "321-555-0101",
            email: "ana.garcia@email.com",
            servicios: [
                {
                    nombre: "Cuota de mantenimiento",
                    monto: 50,
                    fechaVencimiento: "2025-09-15"
                },
                {
                    nombre: "Agua",
                    monto: 30,
                    fechaVencimiento: "2025-09-10"
                }
            ]
        },
        {
            id: 2,
            nombre: "Carlos López",
            apartamento: "205",
            torre: "2",
            telefono: "321-555-0205",
            email: "carlos.lopez@email.com",
            servicios: [
                {
                    nombre: "Cuota de mantenimiento",
                    monto: 50,
                    fechaVencimiento: "2025-09-05"
                }
            ]
        },
        {
            id: 3,
            nombre: "María Rodríguez",
            apartamento: "303",
            torre: "3",
            telefono: "321-555-0303",
            email: "maria.rodriguez@email.com",
            servicios: [
                {
                    nombre: "Cuota de mantenimiento",
                    monto: 50,
                    fechaVencimiento: "2025-09-01"
                },
                {
                    nombre: "Agua",
                    monto: 25,
                    fechaVencimiento: "2025-08-25"
                },
                {
                    nombre: "Gas",
                    monto: 35,
                    fechaVencimiento: "2025-08-30"
                }
            ]
        }
    ];
    
    // Procesar residentes con cálculos automáticos
    const residentesProcesados = todosResidenetes.map(residente => {
        // Calcular automáticamente para cada servicio
        const serviciosProcesados = residente.servicios.map(servicio => ({
            ...servicio,
            estado: determinarEstado(servicio.fechaVencimiento),
            diasVencimiento: calcularDiasVencimiento(servicio.fechaVencimiento)
        }));
        
        // Calcular totales automáticamente
        const serviciosPendientes = serviciosProcesados.filter(s => s.estado !== "Pagado");
        const deudaTotal = serviciosPendientes.reduce((total, s) => total + s.monto, 0);
        const diasMora = serviciosPendientes.length > 0 
            ? Math.max(...serviciosPendientes.map(s => s.diasVencimiento < 0 ? Math.abs(s.diasVencimiento) : 0))
            : 0;
        
        // Determinar estado general del residente
        const tieneServiciosPendientes = serviciosPendientes.some(s => s.estado === "Pendiente");
        const estadoGeneral = tieneServiciosPendientes ? "Pendiente" : "Por vencer";
        
        return {
            ...residente,
            serviciosProcesados,
            deudaTotal,
            diasMora,
            estadoGeneral
        };
    });
    
    // Filtrar solo residentes que tienen servicios en mora o por vencer
        const [residentesEnMora, setResidentesEnMora] = useState([]);
        const [loading, setLoading] = useState(true);
        const hoy = new Date();
    
    const [showContactMenu, setShowContactMenu] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    // PAGINACIÓN
    // Unificar todos los registros de la tabla en un solo array plano
    const tablaResidentes = [
        ...residentesEnMora.flatMap(residente =>
            residente.serviciosProcesados
                .filter(servicio => servicio.estado !== "Pagado")
                .map((servicio, index) => ({
                    key: `${residente.id}-${index}`,
                    nombre: residente.nombre,
                    torre: residente.torre,
                    apartamento: residente.apartamento,
                    concepto: servicio.nombre,
                    monto: servicio.monto,
                    fechaVencimiento: servicio.fechaVencimiento,
                    diasVencimiento: servicio.diasVencimiento,
                    estado: servicio.estado,
                    telefono: residente.telefono,
                    email: residente.email
                }))
        ),
        // Hardcodeados
        {
            key: 'pedro', nombre: 'Pedro Rodríguez', torre: '1', apartamento: '102', concepto: 'Agua', monto: 75, fechaVencimiento: '2025-09-05', diasVencimiento: 13, estado: 'Pendiente', telefono: '321-555-0102', email: 'pedro@email.com'
        },
        {
            key: 'ana', nombre: 'Ana Martínez', torre: '3', apartamento: '301', concepto: 'Energía', monto: 120, fechaVencimiento: '2025-09-01', diasVencimiento: 17, estado: 'Pendiente', telefono: '321-555-0301', email: 'ana@email.com'
        },
        {
            key: 'luis', nombre: 'Luis Hernández', torre: '4', apartamento: '404', concepto: 'Cuota de mantenimiento', monto: 150, fechaVencimiento: '2025-08-15', diasVencimiento: 34, estado: 'Pendiente', telefono: '321-555-0404', email: 'luis@email.com'
        }
    ];

    const RESIDENTES_POR_PAGINA = 5;
    const [paginaActual, setPaginaActual] = useState(1);
    const totalPaginas = Math.ceil(tablaResidentes.length / RESIDENTES_POR_PAGINA);
    const residentesPagina = tablaResidentes.slice((paginaActual - 1) * RESIDENTES_POR_PAGINA, paginaActual * RESIDENTES_POR_PAGINA);

    const handleContactar = (residente, telefono, email, accion) => {
        switch(accion) {
            case 'llamar':
                window.open(`tel:${telefono}`);
                break;
            case 'email':
                window.open(`mailto:${email}?subject=Recordatorio de pago pendiente&body=Estimado/a ${residente},%0A%0ATiene un pago pendiente. Por favor póngase al día con sus cuotas.%0A%0ASaludos,%0AAdministración`);
                break;
            case 'whatsapp':
                window.open(`https://wa.me/${telefono.replace(/[^0-9]/g, '')}?text=Hola ${residente}, tiene un pago pendiente. Por favor póngase al día con sus cuotas.`);
                break;
        }
        setShowContactMenu(null);
    };

    const handleShowMenu = (menuId, event) => {
        const rect = event.target.getBoundingClientRect();
        setMenuPosition({
            x: rect.left + (rect.width / 2) - 60,
            y: rect.top + (rect.height / 2) - 60
        });
        setShowContactMenu(showContactMenu === menuId ? null : menuId);
    };

    const ContactMenu = ({ residente, telefono, email }) => (
        <div 
            className="fixed bg-white border border-gray-300 rounded shadow-lg p-2 z-50" 
            style={{ 
                left: menuPosition.x, 
                top: menuPosition.y 
            }}
        >
            <button
                className="flex items-center w-full text-left px-3 py-2 hover:bg-gray-300 rounded text-sm"
                onClick={() => handleContactar(residente, telefono, email, 'llamar')}
            >
                <FaPhone className="mr-2 text-blue-600" />
                Llamar
            </button>
            <button
                className="flex items-center w-full text-left px-3 py-2 hover:bg-gray-300 rounded text-sm"
                onClick={() => handleContactar(residente, telefono, email, 'email')}
            >
                <SiGmail className="mr-2 text-red-500" />
                Gmail
            </button>
            <button
                className="flex items-center w-full text-left px-3 py-2 hover:bg-gray-300 rounded text-sm"
                onClick={() => handleContactar(residente, telefono, email, 'whatsapp')}
            >
                <SiWhatsapp className="mr-2 text-green-500" />
                WhatsApp
            </button>
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col" onClick={() => setShowContactMenu(null)}>
            {/* HEADER */}
            <SectionHeader>
                <Logo />
                <BotonSecundary textoBtn="Volver" onClick={() => window.location.href = "/admin"} />
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
                            <p>RESIDENTES EN MORA</p>
                            <div className="flex gap-2 justify-between">
                                <BotonSecundary textoBtn="Enviar notificación" onClick={() => alert("Notificación enviada")} />
                                <BotonSecundary textoBtn="Generar reporte" onClick={() => alert("Generando reporte...")} />
                            </div>
                        </div>

                        {/* TABLA DE RESIDENTES EN MORA */}
                        <div className="shadow-lg mt-6">
                            <div className="bg-white shadow-lg rounded">
                                <div className="flex justify-between items-center px-4 py-3 border-b">
                                    <span className="font-semibold text-gray-700">Residentes con pagos en mora</span>
                                    <div className="flex gap-2">
                                        <button 
                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded shadow hover:bg-green-700"
                                            onClick={() => alert("Exportando lista de morosos...")}
                                        >
                                            Exportar Excel
                                        </button>
                                    </div>
                                </div>
                                <div className="bg-gray-100 p-6 rounded-b">
                                    <h3 className="text-center text-blue-600 font-bold text-xl mb-4">Lista de residentes con pagos pendientes</h3>

                                    <div className="overflow-x-auto">
                                        <table className="w-full bg-white border rounded shadow">
                                            <thead className="bg-gray-200 text-gray-700">
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Residente</th>
                                                    <th className="px-4 py-2 text-left">Torre</th>
                                                    <th className="px-4 py-2 text-left">Apartamento</th>
                                                    <th className="px-4 py-2 text-left">Concepto</th>
                                                    <th className="px-4 py-2 text-left">Monto</th>
                                                    <th className="px-4 py-2 text-left">Fecha límite</th>
                                                    <th className="px-4 py-2 text-left">Días vencido</th>
                                                    <th className="px-4 py-2 text-center">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {residentesPagina.map((residente) => (
                                                    <tr
                                                        key={residente.key}
                                                        className={`border-t hover:bg-gray-50 cursor-pointer transition-colors ${getRowBackgroundColor(residente.estado)}`}
                                                        onClick={() => {
                                                            const residenteData = {
                                                                nombre: residente.nombre,
                                                                apartamento: residente.apartamento,
                                                                torre: residente.torre,
                                                                telefono: residente.telefono,
                                                                email: residente.email,
                                                                diasMora: residente.diasVencimiento,
                                                                totalDeuda: residente.monto
                                                            };
                                                            window.location.href = `/residente?fromMora=true&data=${encodeURIComponent(JSON.stringify(residenteData))}`;
                                                        }}
                                                    >
                                                        <td className="px-4 py-2">{residente.nombre}</td>
                                                        <td className="px-4 py-2">Torre {residente.torre}</td>
                                                        <td className="px-4 py-2">{residente.apartamento}</td>
                                                        <td className="px-4 py-2">{residente.concepto}</td>
                                                        <td className="px-4 py-2">${residente.monto}</td>
                                                        <td className="px-4 py-2">{new Date(residente.fechaVencimiento).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                                                        <td className="px-4 py-2">
                                                            <span className={`text-xs px-2 py-1 rounded ${
                                                                residente.diasVencimiento < 0
                                                                    ? 'bg-red-600 text-white'
                                                                    : 'bg-yellow-400 text-black'
                                                            }`}>
                                                                {residente.diasVencimiento < 0
                                                                    ? `${Math.abs(residente.diasVencimiento)} días`
                                                                    : `${residente.diasVencimiento} días`
                                                                }
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-center relative">
                                                            <button
                                                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleShowMenu(residente.key, e);
                                                                }}
                                                            >
                                                                Contactar
                                                            </button>
                                                            {showContactMenu === residente.key && (
                                                                <ContactMenu
                                                                    residente={residente.nombre}
                                                                    telefono={residente.telefono}
                                                                    email={residente.email}
                                                                />
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {/* Controles de paginación */}
                                        <div className="flex justify-center items-center gap-2 mt-4">
                                            <button
                                                className="px-3 py-1 bg-gray-300 text-gray-700 rounded shadow hover:bg-gray-400"
                                                onClick={() => setPaginaActual(paginaActual - 1)}
                                                disabled={paginaActual === 1}
                                            >
                                                Anterior
                                            </button>
                                            <span className="font-semibold">Página {paginaActual} de {totalPaginas}</span>
                                            <button
                                                className="px-3 py-1 bg-gray-300 text-gray-700 rounded shadow hover:bg-gray-400"
                                                onClick={() => setPaginaActual(paginaActual + 1)}
                                                disabled={paginaActual === totalPaginas}
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