import React, { useState } from "react";
import SectionHeader from "./SectionHeader";
import Logo from "./Logo";
import BotonSecundary from "./BotonSecundary";
import ImgFondo from "./ImgFondo";
import SectionFooter from "./SectionFooter";
import { FaPhone } from "react-icons/fa";
import { SiGmail, SiWhatsapp } from "react-icons/si";

export default function PageMora() {
    // Estado y lógica solo para datos reales
    const [residentesEnMora, setResidentesEnMora] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paginaActual, setPaginaActual] = useState(1);
    const RESIDENTES_POR_PAGINA = 5;
    const [showContactMenu, setShowContactMenu] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
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
        <div className="min-h-screen flex flex-col" onClick={() => setShowContactMenu(null)}>
            <SectionHeader>
                <Logo />
                <BotonSecundary textoBtn="Volver" onClick={() => window.location.href = "/admin"} />
            </SectionHeader>
            <main className="flex-1 p-4">
                <h2 className="text-2xl font-bold mb-4">Residentes en mora</h2>
                {loading ? (
                    <div className="text-center py-8">Cargando datos...</div>
                ) : residentesEnMora.length === 0 ? (
                    <div className="text-center py-8">No hay residentes en mora.</div>
                ) : (
                    <div className="overflow-x-auto">
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
                                    <tr key={residente.key} className={residente.estado === "Pendiente" ? "bg-red-50" : ""}>
                                        <td className="px-4 py-2">{residente.nombre}</td>
                                        <td className="px-4 py-2">{residente.torre}</td>
                                        <td className="px-4 py-2">{residente.apartamento}</td>
                                        <td className="px-4 py-2">{residente.concepto}</td>
                                        <td className="px-4 py-2">${residente.monto}</td>
                                        <td className="px-4 py-2">{residente.fechaVencimiento}</td>
                                        <td className="px-4 py-2">{residente.diasVencimiento < 0 ? Math.abs(residente.diasVencimiento) : 0}</td>
                                        <td className="px-4 py-2">
                                            <button
                                                className="bg-blue-500 text-white px-2 py-1 rounded"
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
                        {/* Paginación */}
                        <div className="flex justify-center items-center mt-4 gap-2">
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
            </main>
            <SectionFooter />
        </div>
    );
}