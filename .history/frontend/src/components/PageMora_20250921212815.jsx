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
        const hoy = new Date(); // Se mantiene la declaración de hoy
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
            <SectionHeader>
                <Logo />
                <BotonSecundary textoBtn="Volver" onClick={() => window.location.href = "/admin"} />
            </SectionHeader>

        React.useEffect(() => {
            // Reemplaza la URL por tu endpoint real
            fetch("/api/residentes-mora")
                .then(res => res.json())
                .then(data => {
                    // Procesar los datos para agregar días vencidos y estado
                    const procesados = data.map(residente => {
                        return residente.servicios
                            .filter(servicio => !servicio.fechaPago)
                            .map(servicio => {
                                const vencimiento = new Date(servicio.fechaVencimiento);
                                const diasVencimiento = Math.floor((vencimiento - hoy) / (1000 * 60 * 60 * 24));
                                return {
                                    key: `${residente.id}-${servicio.nombre}`,
                                    nombre: residente.nombre,
                                    torre: residente.torre,
                                    apartamento: residente.apartamento,
                                    concepto: servicio.nombre,
                                    monto: servicio.monto,
                                    fechaVencimiento: servicio.fechaVencimiento,
                                    diasVencimiento,
                                    estado: diasVencimiento < 0 ? "Pendiente" : "Por vencer",
                                    telefono: residente.telefono,
                                    email: residente.email
                                };
                            });
                    }).flat();
                    setResidentesEnMora(procesados);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }, []);
            // Estado y lógica solo para datos reales
            const [residentesEnMora, setResidentesEnMora] = React.useState([]);
            const [loading, setLoading] = React.useState(true);
            const hoy = new Date();

            React.useEffect(() => {
              fetch("/api/residentes-mora")
                .then(res => res.json())
                .then(data => {
                  const procesados = data.map(residente =>
                    residente.servicios
                      .filter(servicio => !servicio.fechaPago)
                      .map(servicio => {
                        const vencimiento = new Date(servicio.fechaVencimiento);
                        const diasVencimiento = Math.floor((vencimiento - hoy) / (1000 * 60 * 60 * 24));
                        return {
                          key: `${residente.id}-${servicio.nombre}`,
                          nombre: residente.nombre,
                          torre: residente.torre,
                          apartamento: residente.apartamento,
                          concepto: servicio.nombre,
                          monto: servicio.monto,
                          fechaVencimiento: servicio.fechaVencimiento,
                          diasVencimiento,
                          estado: diasVencimiento < 0 ? "Pendiente" : "Por vencer",
                          telefono: residente.telefono,
                          email: residente.email
                        };
                      })
                  ).flat();
                  setResidentesEnMora(procesados);
                  setLoading(false);
                })
                .catch(() => setLoading(false));
            }, []);
            </main>

            {/* FOOTER */}
            <SectionFooter />
        </div>
    );
}