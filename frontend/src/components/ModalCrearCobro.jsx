import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';

export default function ModalCrearCobro({ isOpen, onClose, residentes = [], onCobroCreado = () => {} }) {
    const [formData, setFormData] = useState({
        nombre: '',
        otroServicio: '',
        monto: '',
        fecha_generacion: new Date().toISOString().split('T')[0],
        fecha_vencimiento: '',
        numero_factura: '',
        residente_ids: [], // Cambiar de residente_id a residente_ids (array)
        aplicarATodos: false
    });

    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const serviciosPreestablecidos = [
        { value: 'Administración', label: 'Administración' },
        { value: 'Parqueadero', label: 'Parqueadero' },
        { value: 'Multa', label: 'Multa' },
        { value: 'Mantenimiento', label: 'Mantenimiento' },
        { value: 'Otro', label: 'Otro' }
    ];

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                nombre: '',
                otroServicio: '',
                monto: '',
                fecha_generacion: new Date().toISOString().split('T')[0],
                fecha_vencimiento: '',
                numero_factura: '',
                residente_ids: [],
                aplicarATodos: false
            });
            setSearchTerm('');
            setIsDropdownOpen(false);
        }
    }, [isOpen]);

    // Filtrar residentes según el término de búsqueda
    const residentesFiltrados = residentes.filter(residente => {
        const searchLower = searchTerm.toLowerCase();
        return residente.nombre?.toLowerCase().includes(searchLower) ||
               residente.torre?.toLowerCase().includes(searchLower) ||
               residente.apartamento?.toLowerCase().includes(searchLower);
    });

    // Manejar selección/deselección de residente
    const toggleResidente = (residenteId) => {
        setFormData(prev => {
            const isSelected = prev.residente_ids.includes(residenteId);
            return {
                ...prev,
                residente_ids: isSelected 
                    ? prev.residente_ids.filter(id => id !== residenteId)
                    : [...prev.residente_ids, residenteId]
            };
        });
    };

    // Seleccionar/deseleccionar todos los filtrados
    const toggleTodos = () => {
        const todosFiltradosIds = residentesFiltrados.map(r => r.id);
        const todosSeleccionados = todosFiltradosIds.every(id => formData.residente_ids.includes(id));
        
        setFormData(prev => ({
            ...prev,
            residente_ids: todosSeleccionados 
                ? prev.residente_ids.filter(id => !todosFiltradosIds.includes(id))
                : [...new Set([...prev.residente_ids, ...todosFiltradosIds])]
        }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        // Manejar selección múltiple de residentes
        if (name === 'residente_ids') {
            const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
            setFormData(prev => ({
                ...prev,
                residente_ids: selectedOptions
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nombre || !formData.monto || !formData.fecha_vencimiento) {
            await Swal.fire({
                icon: 'warning',
                title: 'Campos incompletos',
                text: 'Por favor completa todos los campos requeridos',
                timer: 2000
            });
            return;
        }

        if (formData.nombre === 'Otro' && !formData.otroServicio.trim()) {
            await Swal.fire({
                icon: 'warning',
                title: 'Especifica el servicio',
                text: 'Debes especificar qué tipo de servicio es',
                timer: 2000
            });
            return;
        }

        if (!formData.aplicarATodos && formData.residente_ids.length === 0) {
            await Swal.fire({
                icon: 'warning',
                title: 'Selecciona al menos un residente',
                text: 'Debes seleccionar al menos un residente o aplicar a todos',
                timer: 2000
            });
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            // Si seleccionó "Otro", usar el valor de otroServicio
            const nombreFinal = formData.nombre === 'Otro' ? formData.otroServicio : formData.nombre;

            const payload = {
                ...formData,
                nombre: nombreFinal
            };

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_URL}/servicios`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error al crear el cobro');
            }

            await Swal.fire({
                icon: 'success',
                title: 'Cobro creado',
                text: data.message,
                timer: 2000,
                timerProgressBar: true
            });

            // Notificar a otras pestañas/componentes que se creó un cobro
            const cobroEvent = {
                timestamp: Date.now(),
                residentes: formData.residente_ids.length > 0 ? formData.residente_ids : 'todos'
            };
            localStorage.setItem('cobroCreado', JSON.stringify(cobroEvent));
            
            // También disparar un custom event para la misma pestaña
            window.dispatchEvent(new CustomEvent('cobroCreado', { detail: cobroEvent }));

            onCobroCreado();
            onClose();

        } catch (error) {
            console.error('Error al crear cobro:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Error al crear el cobro',
                timer: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const fondoUrl = new URL('/img/imagen.png', import.meta.url).href;

    // Usamos la misma estructura de fondo que los modales de edición: fondo de imagen en absolute
    // y el contenido del modal en z-10 sobre ese fondo. Eliminamos la capa negra semitransparente
    // para que el fondo sea idéntico al de los otros modales de la app.
    const modal = (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Imagen de fondo idéntica a la página (usando background-image para Vite) */}
            <div
                className="absolute inset-0 bg-cover bg-center brightness-75"
                style={{ backgroundImage: `url('${fondoUrl}')`, backgroundColor: '#0b1220' }}
                aria-hidden="true"
            />

            <div className="relative z-10 bg-white rounded-lg p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4 text-gray-800">Crear Nuevo Cobro</h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de servicio *</label>
                        <select
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Selecciona un servicio</option>
                            {serviciosPreestablecidos.map(servicio => (
                                <option key={servicio.value} value={servicio.value}>{servicio.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Campo condicional: Si selecciona "Otro", mostrar input para especificar */}
                    {formData.nombre === 'Otro' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Especificar servicio *</label>
                            <input 
                                type="text" 
                                name="otroServicio" 
                                value={formData.otroServicio} 
                                onChange={handleChange} 
                                placeholder="Ej: Reparación de fachada"
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                        <input type="number" name="monto" value={formData.monto} onChange={handleChange} placeholder="Ej: 150000"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required min="0" step="0.01" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de generación *</label>
                        <input type="date" name="fecha_generacion" value={formData.fecha_generacion} onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de vencimiento *</label>
                        <input type="date" name="fecha_vencimiento" value={formData.fecha_vencimiento} onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Número de factura (opcional)</label>
                        <input type="text" name="numero_factura" value={formData.numero_factura} onChange={handleChange} placeholder="Ej: FAC-2024-001"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div className="flex items-center">
                        <input type="checkbox" name="aplicarATodos" checked={formData.aplicarATodos} onChange={handleChange}
                            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                        <label className="text-sm font-medium text-gray-700">Aplicar a todos los residentes</label>
                    </div>

                    {!formData.aplicarATodos && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Seleccionar residentes *
                            </label>
                            
                            {/* Botón para desplegar/cerrar el dropdown */}
                            <button
                                type="button"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-left bg-white flex justify-between items-center"
                            >
                                <span className="text-gray-700">
                                    {formData.residente_ids.length === 0 
                                        ? 'Selecciona residentes...' 
                                        : `${formData.residente_ids.length} residente(s) seleccionado(s)`}
                                </span>
                                <svg 
                                    className={`w-5 h-5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Dropdown desplegable */}
                            {isDropdownOpen && (
                                <div className="mt-2 border border-gray-300 rounded bg-white shadow-lg max-h-80 overflow-hidden">
                                    {/* Buscador */}
                                    <div className="p-2 border-b border-gray-200 bg-gray-50">
                                        <input
                                            type="text"
                                            placeholder="Buscar por nombre, torre o apartamento..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        />
                                    </div>

                                    {/* Opción para seleccionar todos */}
                                    <div className="p-2 border-b border-gray-200 bg-gray-50">
                                        <label className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded">
                                            <input
                                                type="checkbox"
                                                checked={residentesFiltrados.length > 0 && residentesFiltrados.every(r => {
                                                    const keyId = r.residente_id ?? r.id ?? r.propiedad_id;
                                                    return formData.residente_ids.includes(keyId);
                                                })}
                                                onChange={toggleTodos}
                                                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="text-sm font-medium text-gray-700">
                                                Seleccionar todos ({residentesFiltrados.length})
                                            </span>
                                        </label>
                                    </div>

                                    {/* Lista de residentes con checkboxes */}
                                    <div className="max-h-60 overflow-y-auto">
                                        {residentesFiltrados.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500 text-sm">
                                                No se encontraron residentes
                                            </div>
                                        ) : (
                                            <div className="pb-2">
                                                {residentesFiltrados.map((residente) => {
                                                    const keyId = residente.id;
                                                    const isSelected = formData.residente_ids.includes(keyId);
                                                    
                                                    return (
                                                        <label 
                                                            key={keyId} 
                                                            className="flex items-center cursor-pointer hover:bg-blue-50 p-2 border-b border-gray-100 last:border-b-0"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => toggleResidente(keyId)}
                                                                className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {residente.nombre}
                                                                </div>
                                                                <div className="text-xs text-gray-500">
                                                                    Torre {residente.torre} - Apto {residente.apartamento}
                                                                </div>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {formData.residente_ids.length > 0 && (
                                <p className="text-xs text-gray-600 mt-1">
                                    {formData.residente_ids.length} residente(s) seleccionado(s)
                                </p>
                            )}
                        </div>
                    )}

                    <div className="flex gap-3 mt-6">
                        <button type="submit" disabled={loading}
                            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm">
                            {loading ? 'Creando...' : 'Crear Cobro'}
                        </button>
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition-colors shadow-sm">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}