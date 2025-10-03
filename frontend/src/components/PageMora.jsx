import React, { useState, useEffect } from "react";
import Swal from 'sweetalert2';
import SectionHeader from "./SectionHeader";
import Logo from "./Logo";
import BotonSecundary from "./BotonSecundary";
import ImgFondo from "./ImgFondo";
import SectionFooter from "./SectionFooter";
import { FaPhone } from "react-icons/fa";
import { SiGmail, SiWhatsapp } from "react-icons/si";
import { formatCurrency } from '../utils/estadoUtils';

export default function PageMora() {
    // Estado y lógica solo para datos reales
    const [residentesEnMora, setResidentesEnMora] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [paginaActual, setPaginaActual] = useState(1);
    const RESIDENTES_POR_PAGINA = 12;
    const [showContactMenu, setShowContactMenu] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
    useEffect(() => {
    const cargarResidentesMora = async () => {
            try {
                setLoading(true);
                const api = (await import('../services/api')).default;
                const resp = await api.get('/servicios/morosos');
                const data = resp.data;
                const usuarios = Array.isArray(data) ? data : (data.data ?? data);

                // Mapear la respuesta del endpoint morosos directamente
                // Not needed: confiamos en el cálculo de `diasVencimiento` del backend

                // Mapear la respuesta: confiar exclusivamente en `diasVencimiento` y `deudaTotal` devueltos por el backend
                const procesados = usuarios.map(u => {
                    const rid = u.residente_id ?? u.residenteId ?? null;
                    const uid = u.usuario_id ?? u.usuarioId ?? null;
                    return {
                        key: `u-${rid ?? uid ?? Math.random().toString(36).slice(2,9)}`,
                        nombre: u.nombre || '',
                        torre: u.torre || '',
                        apartamento: u.apartamento || '',
                        concepto: 'Deuda acumulada',
                        monto: Number(u.deudaTotal || u.monto || 0) || 0,
                        deudaTotal: Number(u.deudaTotal || u.monto || 0) || 0,
                        residente_id: rid,
                        usuario_id: uid,
                        fechaVencimiento: u.ultimoVencimiento || u.fechaVencimiento || null,
                        // Usar directamente el valor calculado por el backend. Si no existe, tratar como 0 (no moroso)
                        diasVencimiento: Number(u.diasVencimiento ?? 0),
                        estado: u.estado || 'Pendiente',
                        telefono: u.telefono || '',
                        email: u.email || ''
                    };
                });

                // Filtrar para mostrar únicamente morosos reales: backend debe proveer diasVencimiento > 0
                const soloMorosos = procesados.filter(p => Number(p.diasVencimiento) > 0 && Number(p.monto || 0) > 0);
                console.debug('[PageMora] procesados total:', procesados.length, 'filtrados como morosos:', soloMorosos.length);
                // Debug: cuántos morosos y ejemplos
                console.debug('[PageMora] morosos encontrados:', soloMorosos.length, soloMorosos.slice(0,3));
                // Ordenar por deuda total descendente (los mayores deudores arriba)
                soloMorosos.sort((a, b) => Number(b.monto || 0) - Number(a.monto || 0));

                setResidentesEnMora(soloMorosos);
            } catch (err) {
                console.error('Error al cargar residentes en mora:', err);
                setResidentesEnMora([]);
                const texto = err?.message || 'No se pudo cargar la lista de morosos.';
                Swal.fire({ icon: 'error', title: 'Error', text: texto });
            } finally {
                setLoading(false);
            }
        };

        cargarResidentesMora();
    }, []);

    // Paginación
    // Filtrado por buscador (nombre, email, torre, apartamento)
    const residentesFiltradosPorBusqueda = residentesEnMora.filter(r => {
        if (!searchTerm || String(searchTerm).trim() === '') return true;
        const s = String(searchTerm).toLowerCase();
        return (
            String(r.nombre || '').toLowerCase().includes(s) ||
            String(r.email || '').toLowerCase().includes(s) ||
            String(r.torre || '').toLowerCase().includes(s) ||
            String(r.apartamento || '').toLowerCase().includes(s)
        );
    });

    const totalFiltrados = residentesFiltradosPorBusqueda.length;
    const totalMorosos = residentesEnMora.length;
    const totalPaginas = Math.ceil(totalFiltrados / RESIDENTES_POR_PAGINA) || 1;
    const residentesPagina = residentesFiltradosPorBusqueda.slice((paginaActual - 1) * RESIDENTES_POR_PAGINA, paginaActual * RESIDENTES_POR_PAGINA);

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

    // Navegación directa al perfil del residente
    const navigateToResidente = (residente) => {
        try {
            const residenteData = {
                nombre: residente.nombre,
                apartamento: residente.apartamento,
                torre: residente.torre,
                telefono: residente.telefono,
                email: residente.email,
                concepto: residente.concepto,
                monto: residente.monto,
                deudaTotal: residente.monto,
                fechaVencimiento: residente.fechaVencimiento,
                diasVencimiento: residente.diasVencimiento,
                residente_id: residente.residente_id ?? null,
                usuario_id: residente.usuario_id ?? null,
                estado: (Number(residente.diasVencimiento) > 0) ? 'En mora' : (residente.estado || 'Pendiente')
            };

            const encoded = encodeURIComponent(JSON.stringify(residenteData));
            const rid = residente.residente_id ?? null;
            const uid = residente.usuario_id ?? null;
            const extraParams = `${rid ? `&residente_id=${rid}` : ''}${uid ? `&usuario_id=${uid}` : ''}`;
            const url = `/residente?fromMora=true&data=${encoded}${extraParams}`;

            // Navegar directamente sin modal
            window.location.href = url;
        } catch (err) {
            console.error('Error navegando a residente:', err);
            window.location.href = '/residente?fromMora=true';
        }
    };

    return (
    <div className="min-h-screen flex flex-col relative" onClick={() => setShowContactMenu(null)}>
                <ImgFondo>
                    <img src="/img/imagen.png" alt="Imagen de fondo" className="w-full h-full object-cover brightness-75 absolute inset-0 z-0" />
                </ImgFondo>

            <SectionHeader>
                <Logo />
                <BotonSecundary textoBtn="Volver" onClick={() => window.location.href = "/admin"} />
            </SectionHeader>
            <main className="flex-1 flex flex-col relative z-0">
                    <div className="relative z-10 p-5 flex flex-col pb-8">
                       
                        <div className="bg-transparent py-3 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 ">
                            <p className="text-white font-bold text-lg sm:text-xl">RESIDENTES EN MORA</p>
                            <div className="flex flex-col sm:flex-row gap-2">
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
                                        <div className="overflow-x-auto rounded-lg border-gray-300 border shadow-lg p-2">
                                            <div className="flex items-center justify-between mb-3 gap-3">
                                                <div className="flex-1">
                                                    <input
                                                        type="text"
                                                        placeholder="Buscar por nombre, email, torre o apto..."
                                                        value={searchTerm}
                                                        onChange={(e) => { setSearchTerm(e.target.value); setPaginaActual(1); }}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>
                                                <div className="text-sm text-gray-600 ml-4">
                                                    Mostrando <span className="font-semibold">{residentesPagina.length}</span> de <span className="font-semibold">{totalMorosos}</span> morosos
                                                </div>
                                            </div>
                                            <table className="w-full bg-white rounded table-fixed">
                                                <colgroup>
                                                    <col style={{ width: '12.5%' }} />
                                                    <col style={{ width: '12.5%' }} />
                                                    <col style={{ width: '12.5%' }} />
                                                    <col style={{ width: '12.5%' }} />
                                                    <col style={{ width: '12.5%' }} />
                                                    <col style={{ width: '12.5%' }} />
                                                    <col style={{ width: '12.5%' }} />
                                                    <col style={{ width: '12.5%' }} />
                                                </colgroup>
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="px-3 py-2 whitespace-nowrap text-left">Nombre</th>
                                                    <th className="px-16 py-2 whitespace-nowrap text-left">Torre</th>
                                                    <th className="px-1 py-2 whitespace-nowrap text-left">Apartamento</th>
                                                       <th className="px-9 py-2 whitespace-nowrap text-left">Concepto</th>
                                                    <th className="px-17 py-2 whitespace-nowrap text-left">Monto</th>
                                                    <th className="px-6 py-2 whitespace-nowrap text-left">Fecha Vencimiento</th>
                                                    <th className="px-14 py-2 whitespace-nowrap text-left">Días vencidos</th>
                                                    <th className="px-2 py-2 whitespace-nowrap text-center">Contacto</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {residentesPagina.map((residente) => (
                                                    <tr 
                                                        key={residente.key} 
                                                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${residente.diasVencimiento > 0 ? 'bg-red-100/65' : ''}`}
                                                        onClick={() => navigateToResidente(residente)}
                                                    >
                                                        <td className="px-3 py-2 font-semibold text-gray-700 whitespace-nowrap text-left">{residente.nombre}</td>
                                                        <td className="px-20 py- whitespace-nowrap text-left">{residente.torre}</td>
                                                        <td className="px-10 py-2 whitespace-nowrap text-left">{residente.apartamento}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-left">{residente.concepto}</td>
                                                        <td className="px-13 py-2 font-bold text-blue-700 whitespace-nowrap text-left">{formatCurrency(residente.monto)}</td>
                                                        <td className="px-15 py-2 whitespace-nowrap text-left">{residente.fechaVencimiento}</td>
                                                        <td className="px-22 py-2 whitespace-nowrap text-left">
                                                            {/* Mostrar badge de días en rojo si efectivamente hay días vencidos */}
                                                            <span className={`text-xs px-2 py-1 rounded ${residente.diasVencimiento > 0 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                                                                {Math.abs(residente.diasVencimiento)} días
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2 text-center relative whitespace-nowrap">
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
            </main>
            <SectionFooter />
        </div>
    );
}

    // formatCurrency y normalizeEstado provienen de ../utils/estadoUtils