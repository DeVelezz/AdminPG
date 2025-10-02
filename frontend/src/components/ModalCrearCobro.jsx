import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Swal from 'sweetalert2';

export default function ModalCrearCobro({ isOpen, onClose, residentes = [], onCobroCreado = () => {} }) {
    const [formData, setFormData] = useState({
        nombre: '',
        monto: '',
        fecha_generacion: new Date().toISOString().split('T')[0],
        fecha_vencimiento: '',
        numero_factura: '',
        residente_id: '',
        aplicarATodos: false
    });

    const [loading, setLoading] = useState(false);

    const serviciosPreestablecidos = [
        { value: 'Administración', label: 'Administración' },
        { value: 'Agua', label: 'Agua' },
        { value: 'Luz', label: 'Luz' },
        { value: 'Gas', label: 'Gas' },
        { value: 'Parqueadero', label: 'Parqueadero' },
        { value: 'Multa', label: 'Multa' },
        { value: 'Otro', label: 'Otro' }
    ];

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                nombre: '',
                monto: '',
                fecha_generacion: new Date().toISOString().split('T')[0],
                fecha_vencimiento: '',
                numero_factura: '',
                residente_id: '',
                aplicarATodos: false
            });
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
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

        if (!formData.aplicarATodos && !formData.residente_id) {
            await Swal.fire({
                icon: 'warning',
                title: 'Selecciona un residente',
                text: 'Debes seleccionar un residente o aplicar a todos',
                timer: 2000
            });
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_URL}/servicios`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
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

            <div className="relative z-10 bg-white rounded-lg p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Seleccionar residente *</label>
                            <select name="residente_id" value={formData.residente_id} onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required={!formData.aplicarATodos}>
                                <option value="">Selecciona un residente</option>
                                {residentes.map((residente, idx) => {
                                    const keyId = residente.residente_id ?? residente.id ?? residente.propiedad_id ?? idx;
                                    return (
                                        <option key={keyId} value={keyId}>{residente.nombre} - Torre {residente.torre} Apto {residente.apartamento}</option>
                                    );
                                })}
                            </select>
                        </div>
                    )}

                    <div className="flex gap-3 mt-6">
                        <button type="submit" disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400">
                            {loading ? 'Creando...' : 'Crear Cobro'}
                        </button>
                        <button type="button" onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}