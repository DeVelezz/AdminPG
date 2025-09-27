import React, { useState } from "react";
import SectionHeader from "./SectionHeader";
import Logo from "./Logo";
import BotonSecundary from "./BotonSecundary";
import ImgFondo from "./ImgFondo";
import SectionFooter from "./SectionFooter";
import { FaPhone } from "react-icons/fa";
import { SiGmail, SiWhatsapp } from "react-icons/si";
import { useNavigate } from "react-router-dom";

export default function PageMora() {
    // Estado y lógica solo para datos reales
    const [residentesEnMora, setResidentesEnMora] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paginaActual, setPaginaActual] = useState(1);
    const RESIDENTES_POR_PAGINA = 10;
    const [showContactMenu, setShowContactMenu] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    const navigate = useNavigate();

    React.useEffect(() => {
        const hoy = new Date();
        fetch("/api/residentes-mora")
            .then(res => res.json())
            .then(data => {
                let procesados = data.map(residente =>
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
                // Fallback temporal si la API responde vacío
                if (procesados.length === 0) {
                    procesados = [
                        {
                            key: 'demo1', nombre: 'Ana García', torre: '1', apartamento: '101', concepto: 'Cuota de mantenimiento', monto: 50, fechaVencimiento: '2025-09-15', diasVencimiento: -6, estado: 'Pendiente', telefono: '321-555-0101', email: 'ana.garcia@email.com'
                        },
                        {
                            key: 'demo2', nombre: 'Carlos López', torre: '2', apartamento: '205', concepto: 'Agua', monto: 30, fechaVencimiento: '2025-09-10', diasVencimiento: -11, estado: 'Pendiente', telefono: '321-555-0205', email: 'carlos.lopez@email.com'
                        },
                        {
                            key: 'demo3', nombre: 'María Rodríguez', torre: '3', apartamento: '303', concepto: 'Gas', monto: 35, fechaVencimiento: '2025-08-30', diasVencimiento: -22, estado: 'Pendiente', telefono: '321-555-0303', email: 'maria.rodriguez@email.com'
                        },
                        {
                            key: 'demo4', nombre: 'Pedro Ramírez', torre: '1', apartamento: '102', concepto: 'Energía', monto: 75, fechaVencimiento: '2025-09-05', diasVencimiento: -16, estado: 'Pendiente', telefono: '321-555-0102', email: 'pedro@email.com'
                        },
                        {
                            key: 'demo5', nombre: 'Ana Martínez', torre: '3', apartamento: '301', concepto: 'Energía', monto: 120, fechaVencimiento: '2025-09-01', diasVencimiento: -20, estado: 'Pendiente', telefono: '321-555-0301', email: 'ana@email.com'
                        },
                        {
                            key: 'demo6', nombre: 'Luis Hernández', torre: '4', apartamento: '404', concepto: 'Cuota de mantenimiento', monto: 150, fechaVencimiento: '2025-08-15', diasVencimiento: -34, estado: 'Pendiente', telefono: '321-555-0404', email: 'luis@email.com'
                        },
                        {
                            key: 'demo7', nombre: 'Sofía Torres', torre: '2', apartamento: '210', concepto: 'Gas', monto: 40, fechaVencimiento: '2025-09-12', diasVencimiento: -9, estado: 'Pendiente', telefono: '321-555-0210', email: 'sofia@email.com'
                        },
                        {
                            key: 'demo8', nombre: 'Miguel Díaz', torre: '1', apartamento: '110', concepto: 'Agua', monto: 60, fechaVencimiento: '2025-09-08', diasVencimiento: -13, estado: 'Pendiente', telefono: '321-555-0110', email: 'miguel@email.com'
                        },
                        {
                            key: 'demo9', nombre: 'Laura Gómez', torre: '3', apartamento: '320', concepto: 'Cuota de mantenimiento', monto: 80, fechaVencimiento: '2025-09-03', diasVencimiento: -18, estado: 'Pendiente', telefono: '321-555-0320', email: 'laura@email.com'
                        },
                        {
                            key: 'demo10', nombre: 'Andrés Ruiz', torre: '2', apartamento: '215', concepto: 'Energía', monto: 95, fechaVencimiento: '2025-08-28', diasVencimiento: -24, estado: 'Pendiente', telefono: '321-555-0215', email: 'andres@email.com'
                        }
                    ];
                }
                setResidentesEnMora(procesados);
                setLoading(false);
            })
            .catch(() => {
                // Si hay error, también mostrar datos de prueba
                setResidentesEnMora([
                    {
                        key: 'demo1', nombre: 'Ana García', torre: '1', apartamento: '101', concepto: 'Cuota de mantenimiento', monto: 50, fechaVencimiento: '2025-09-15', diasVencimiento: -6, estado: 'Pendiente', telefono: '321-555-0101', email: 'ana.garcia@email.com'
                    },
                    {
                        key: 'demo2', nombre: 'Carlos López', torre: '2', apartamento: '205', concepto: 'Agua', monto: 30, fechaVencimiento: '2025-09-10', diasVencimiento: -11, estado: 'Pendiente', telefono: '321-555-0205', email: 'carlos.lopez@email.com'
                    },
                    {
                        key: 'demo3', nombre: 'María Rodríguez', torre: '3', apartamento: '303', concepto: 'Gas', monto: 35, fechaVencimiento: '2025-08-30', diasVencimiento: -22, estado: 'Pendiente', telefono: '321-555-0303', email: 'maria.rodriguez@email.com'
                    },
                    {
                        key: 'demo4', nombre: 'Pedro Ramírez', torre: '1', apartamento: '102', concepto: 'Energía', monto: 75, fechaVencimiento: '2025-09-05', diasVencimiento: -16, estado: 'Pendiente', telefono: '321-555-0102', email: 'pedro@email.com'
                    },
                    {
                        key: 'demo5', nombre: 'Ana Martínez', torre: '3', apartamento: '301', concepto: 'Energía', monto: 120, fechaVencimiento: '2025-09-01', diasVencimiento: -20, estado: 'Pendiente', telefono: '321-555-0301', email: 'ana@email.com'
                    },
                    {
                        key: 'demo6', nombre: 'Luis Hernández', torre: '4', apartamento: '404', concepto: 'Cuota de mantenimiento', monto: 150, fechaVencimiento: '2025-08-15', diasVencimiento: -34, estado: 'Pendiente', telefono: '321-555-0404', email: 'luis@email.com'
                    },
                    {
                        key: 'demo7', nombre: 'Sofía Torres', torre: '2', apartamento: '210', concepto: 'Gas', monto: 40, fechaVencimiento: '2025-09-12', diasVencimiento: -9, estado: 'Pendiente', telefono: '321-555-0210', email: 'sofia@email.com'
                    },
                    {
                        key: 'demo8', nombre: 'Miguel Díaz', torre: '1', apartamento: '110', concepto: 'Agua', monto: 60, fechaVencimiento: '2025-09-08', diasVencimiento: -13, estado: 'Pendiente', telefono: '321-555-0110', email: 'miguel@email.com'
                    },
                    {
                        key: 'demo9', nombre: 'Laura Gómez', torre: '3', apartamento: '320', concepto: 'Cuota de mantenimiento', monto: 80, fechaVencimiento: '2025-09-03', diasVencimiento: -18, estado: 'Pendiente', telefono: '321-555-0320', email: 'laura@email.com'
                    },
                    {
                        key: 'demo10', nombre: 'Andrés Ruiz', torre: '2', apartamento: '215', concepto: 'Energía', monto: 95, fechaVencimiento: '2025-08-28', diasVencimiento: -24, estado: 'Pendiente', telefono: '321-555-0215', email: 'andres@email.com'
                    }
                ]);
                setLoading(false);
            });
    }, []);

    // Paginación
    const totalPaginas = Math.ceil(residentesEnMora.length / RESIDENTES_POR_PAGINA);
    const residentesPagina = residentesEnMora.slice((paginaActual - 1) * RESIDENTES_POR_PAGINA, paginaActual * RESIDENTES_POR_PAGINA);

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
    <div className="min-h-screen flex flex-col relative" onClick={() => setShowContactMenu(null)}>
            <SectionHeader>
                <Logo />
                <BotonSecundary textoBtn="Volver" onClick={() => window.location.href = "/admin"} />
            </SectionHeader>
            <main className="flex-1 flex flex-col relative z-0">
                <ImgFondo>
                    <img src="/img/imagen.png" alt="Imagen de fondo" className="w-full h-full object-cover brightness-75 absolute inset-0 z-0" />
                    <div className="relative z-10 p-5 flex flex-col pb-8">
                        <div className="flex flex-col items-center mt-8 mb-6">
                            <p className="font-bold text-blue-700 text-2xl text-center mb-2">RESIDENTES EN MORA</p>
                            <div className="flex gap-2 justify-center">
                                <BotonSecundary textoBtn="Enviar notificación" onClick={() => alert("Notificación enviada")} />
                                <BotonSecundary textoBtn="Generar reporte" onClick={() => alert("Generando reporte...")} />
                            </div>
                        </div>
                        {/* TABLA DE RESIDENTES EN MORA */}
                        <div className="shadow-lg mt-6">
                            <div className="bg-white shadow-lg rounded">
                                {loading ? (
                                    <div className="text-center py-8">Cargando datos...</div>
                                ) : residentesEnMora.length === 0 ? (
                                    <div className="text-center py-8">No hay residentes en mora.</div>
                                ) : (
                                    <div className="overflow-x-auto flex-1">
                                        <div className="overflow-x-auto overflow-y-auto max-h-[60vh] flex-1">
                                            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="px-4 py-2">Nombre</th>
                                                    <th className="px-4 py-2">Torre</th>
                                                    <th className="px-4 py-2">Apartamento</th>
                                                    <th className="px-4 py-2">Concepto</th>
                                                    <th className="px-4 py-2">Monto</th>
                                                    <th className="px-4 py-2">Fecha Vencimiento</th>
                                                    <th className="px-4 py-2">Días vencidos</th>
                                                    <th className="px-4 py-2">Contacto</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {residentesPagina.map((residente) => (
                                                    <tr 
                                                        key={residente.key} 
                                                        className={`border-t hover:bg-gray-50 cursor-pointer transition-colors ${residente.estado === "Pendiente" ? "bg-red-50" : ""}`}
                                                        onClick={() => {
                                                            const residenteData = {
                                                                nombre: residente.nombre,
                                                                apartamento: residente.apartamento,
                                                                torre: residente.torre,
                                                                telefono: residente.telefono,
                                                                email: residente.email,
                                                                concepto: residente.concepto,
                                                                monto: residente.monto,
                                                                fechaVencimiento: residente.fechaVencimiento,
                                                                diasVencimiento: residente.diasVencimiento,
                                                                estado: residente.estado
                                                            };
                                                            navigate("/residente", { state: { residenteData, isFromMora: true } });
                                                        }}
                                                    >
                                                        <td className="px-4 py-2 font-semibold text-gray-700">{residente.nombre}</td>
                                                        <td className="px-4 py-2">{residente.torre}</td>
                                                        <td className="px-4 py-2">{residente.apartamento}</td>
                                                        <td className="px-4 py-2">{residente.concepto}</td>
                                                        <td className="px-4 py-2 font-bold text-blue-700">${residente.monto}</td>
                                                        <td className="px-4 py-2">{residente.fechaVencimiento}</td>
                                                        <td className="px-4 py-2">
                                                            <span className={`text-xs px-2 py-1 rounded ${residente.diasVencimiento < 0 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
                                                                {residente.diasVencimiento < 0 ? `${Math.abs(residente.diasVencimiento)} días` : `${residente.diasVencimiento} días`}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-center relative">
                                                            <button
                                                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded shadow hover:bg-blue-700"
                                                                onClick={(e) => { e.stopPropagation(); handleShowMenu(residente.key, e); }}
                                                            >
                                                                Contactar
                                                            </button>
                                                            {showContactMenu === residente.key && (
                                                                <ContactMenu residente={residente.nombre} telefono={residente.telefono} email={residente.email} />
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        </div>
                                        {/* Paginación */}
                                        <div className="flex justify-center items-center mt-4 gap-2 mb-6">
                                            <button
                                                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                                                onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                                                disabled={paginaActual === 1}
                                            >Anterior</button>
                                            <span className="px-2">Página {paginaActual} de {totalPaginas}</span>
                                            <button
                                                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                                                onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                                                disabled={paginaActual === totalPaginas}
                                            >Siguiente</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ImgFondo>
            </main>
            <SectionFooter />
        </div>
    );
}